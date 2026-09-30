/**
 * Admin controller.
 *
 * Admin-only operations for managing students: list all students and remove a
 * student account together with their enrollments and results (cascaded via
 * FK constraints).
 */
import { User, Enrollment } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/admin/students  (admin)
 * List all student accounts with a count of their enrollments.
 */
export const getStudents = asyncHandler(async (req, res) => {
  const students = await User.findAll({
    where: { role: 'student' },
    attributes: ['id', 'name', 'email', 'createdAt'],
  });

  // Attach enrollment counts so the admin can see engagement at a glance.
  const withCounts = await Promise.all(
    students.map(async (s) => ({
      ...s.toJSON(),
      enrollmentCount: await Enrollment.count({ where: { studentId: s.id } }),
    }))
  );

  res.json({ success: true, count: withCounts.length, students: withCounts });
});

/**
 * DELETE /api/admin/students/:id  (admin)
 * Delete a student. Enrollments and quiz results cascade via FK constraints.
 */
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await User.findByPk(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found.');
  if (student.role !== 'student') {
    // Guard so this endpoint can never be used to delete admins.
    throw new ApiError(400, 'Only student accounts can be removed here.');
  }

  await student.destroy();

  res.json({ success: true, message: 'Student and related data removed.' });
});
