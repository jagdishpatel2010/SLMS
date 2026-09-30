/**
 * Lesson controller.
 *
 * Students read lessons for a course; admins create, update, and delete them.
 */
import { Lesson, Course } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/lessons/:courseId
 * List lessons for a course, ordered for sequential navigation.
 */
export const getLessonsForCourse = asyncHandler(async (req, res) => {
  const lessons = await Lesson.findAll({
    where: { courseId: req.params.courseId },
    order: [
      ['order', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });

  res.json({ success: true, count: lessons.length, lessons });
});

/**
 * POST /api/lessons  (admin)
 * Create a lesson under a course.
 */
export const createLesson = asyncHandler(async (req, res) => {
  const { course, module, title, content, videoUrl, duration, order } = req.body;

  // Verify the parent course exists before attaching a lesson to it.
  const parent = await Course.findByPk(course);
  if (!parent) throw new ApiError(404, 'Course not found for this lesson.');

  const lesson = await Lesson.create({
    courseId: course,
    module,
    title,
    content,
    videoUrl,
    duration,
    order,
  });

  res.status(201).json({ success: true, lesson });
});

/**
 * PUT /api/lessons/:id  (admin)
 * Update a lesson.
 */
export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByPk(req.params.id);
  if (!lesson) throw new ApiError(404, 'Lesson not found.');

  const allowed = ['module', 'title', 'content', 'videoUrl', 'duration', 'order'];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) lesson[key] = req.body[key];
  });
  await lesson.save();

  res.json({ success: true, lesson });
});

/**
 * DELETE /api/lessons/:id  (admin)
 * Delete a lesson.
 */
export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByPk(req.params.id);
  if (!lesson) throw new ApiError(404, 'Lesson not found.');

  await lesson.destroy();

  res.json({ success: true, message: 'Lesson deleted.' });
});
