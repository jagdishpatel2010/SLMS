/**
 * Progress controller.
 *
 * Aggregates a student's learning progress: enrolled/completed/in-progress
 * course counts, per-course progress, and quiz scores. Powers the student
 * dashboard.
 */
import { Enrollment, Course, QuizResult, Quiz } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/progress  (student)
 * Return a summary of the current user's overall learning progress.
 */
export const getMyProgress = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const [enrollments, results] = await Promise.all([
    Enrollment.findAll({
      where: { studentId },
      include: [{ model: Course, as: 'course', attributes: ['id', 'name', 'category', 'level'] }],
    }),
    QuizResult.findAll({
      where: { studentId },
      include: [
        { model: Quiz, as: 'quiz', attributes: ['id', 'title'] },
        { model: Course, as: 'course', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    }),
  ]);

  const enrolledCount = enrollments.length;
  const completedCount = enrollments.filter((e) => e.status === 'completed').length;
  const inProgressCount = enrolledCount - completedCount;

  // Average progress across all enrollments (0 when none).
  const overallProgress =
    enrolledCount === 0
      ? 0
      : Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrolledCount);

  res.json({
    success: true,
    progress: {
      enrolledCount,
      completedCount,
      inProgressCount,
      overallProgress,
      enrollments: enrollments.map((e) => ({
        course: e.course,
        progress: e.progress,
        status: e.status,
      })),
      quizScores: results.map((r) => ({
        quizTitle: r.quiz?.title || 'Quiz',
        courseName: r.course?.name || 'Course',
        percentage: r.percentage,
        passed: r.passed,
        takenAt: r.createdAt,
      })),
    },
  });
});
