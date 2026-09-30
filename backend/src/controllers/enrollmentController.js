/**
 * Enrollment controller.
 *
 * Students enroll in courses, list their enrollments, and mark lessons
 * complete. Progress percentage is recomputed from completed lessons against
 * the total lesson count for the course.
 */
import { Enrollment, Course, Lesson, CompletedLesson } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Recompute progress and status for an enrollment based on completed lessons.
 *
 * @param {import('../models/Enrollment.js').Enrollment} enrollment - The row.
 * @returns {Promise<void>} Saves the updated enrollment.
 */
const recomputeProgress = async (enrollment) => {
  const [totalLessons, done] = await Promise.all([
    Lesson.count({ where: { courseId: enrollment.courseId } }),
    CompletedLesson.count({ where: { enrollmentId: enrollment.id } }),
  ]);
  // Avoid divide-by-zero for courses that have no lessons yet.
  const percentage = totalLessons === 0 ? 0 : Math.round((done / totalLessons) * 100);
  enrollment.progress = percentage;
  enrollment.status = percentage >= 100 && totalLessons > 0 ? 'completed' : 'in-progress';
  await enrollment.save();
};

/**
 * Serialise an enrollment to match the previous MongoDB shape, including a
 * `completedLessons` array of lesson ids.
 *
 * @param {object} enrollment - Enrollment instance.
 * @returns {Promise<object>} Plain object with completedLessons ids.
 */
const withCompletedIds = async (enrollment) => {
  const rows = await CompletedLesson.findAll({
    where: { enrollmentId: enrollment.id },
    attributes: ['lessonId'],
    raw: true,
  });
  return { ...enrollment.toJSON(), completedLessons: rows.map((r) => r.lessonId) };
};

/**
 * POST /api/courses/:id/enroll  (student)
 * Enroll the current user in a course. Idempotent.
 */
export const enroll = asyncHandler(async (req, res) => {
  const courseId = req.params.id;

  const course = await Course.findByPk(courseId);
  if (!course) throw new ApiError(404, 'Course not found.');

  const existing = await Enrollment.findOne({
    where: { studentId: req.user.id, courseId },
  });
  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'You are already enrolled in this course.',
      enrollment: await withCompletedIds(existing),
    });
  }

  const enrollment = await Enrollment.create({ studentId: req.user.id, courseId });
  res.status(201).json({ success: true, enrollment: await withCompletedIds(enrollment) });
});

/**
 * GET /api/enrollments  (student)
 * List the current user's enrollments with populated course details.
 */
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.findAll({
    where: { studentId: req.user.id },
    include: [{ model: Course, as: 'course' }],
    order: [['updatedAt', 'DESC']],
  });

  const shaped = await Promise.all(enrollments.map(withCompletedIds));
  res.json({ success: true, count: shaped.length, enrollments: shaped });
});

/**
 * GET /api/enrollments/:courseId  (student)
 * Return the current user's enrollment for a single course (or 404).
 */
export const getEnrollmentForCourse = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    where: { studentId: req.user.id, courseId: req.params.courseId },
  });
  if (!enrollment) throw new ApiError(404, 'You are not enrolled in this course.');
  res.json({ success: true, enrollment: await withCompletedIds(enrollment) });
});

/**
 * PATCH /api/enrollments/:courseId/lessons/:lessonId/complete  (student)
 * Mark a lesson complete and recompute progress.
 */
export const markLessonComplete = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;

  const enrollment = await Enrollment.findOne({
    where: { studentId: req.user.id, courseId },
  });
  if (!enrollment) throw new ApiError(403, 'Enroll in the course before tracking lessons.');

  // Confirm the lesson actually belongs to this course.
  const lesson = await Lesson.findOne({ where: { id: lessonId, courseId } });
  if (!lesson) throw new ApiError(404, 'Lesson not found for this course.');

  // findOrCreate keeps this idempotent (progress can never exceed 100%).
  const [, created] = await CompletedLesson.findOrCreate({
    where: { enrollmentId: enrollment.id, lessonId: lesson.id },
    defaults: { enrollmentId: enrollment.id, lessonId: lesson.id },
  });

  if (created) await recomputeProgress(enrollment);

  res.json({ success: true, enrollment: await withCompletedIds(enrollment) });
});
