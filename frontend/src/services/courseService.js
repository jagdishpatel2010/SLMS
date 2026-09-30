/**
 * Course, lesson, enrollment, quiz, progress, and admin API calls.
 *
 * Grouped in one service module because the frontend consumes them together
 * across the catalogue, learning, and admin flows.
 */
import api from '../utils/api.js';

/* ------------------------------- Courses -------------------------------- */

/**
 * Fetch courses with optional search/filter/sort params.
 *
 * @param {object} params - { search, category, level, sort }.
 * @returns {Promise<object>} API payload with a `courses` array.
 */
export const fetchCourses = (params = {}) =>
  api.get('/courses', { params }).then((r) => r.data);

export const fetchCourse = (id) => api.get(`/courses/${id}`).then((r) => r.data);

export const fetchCategories = () =>
  api.get('/courses/meta/categories').then((r) => r.data);

export const createCourse = (payload) => api.post('/courses', payload).then((r) => r.data);

export const updateCourse = (id, payload) =>
  api.put(`/courses/${id}`, payload).then((r) => r.data);

export const deleteCourse = (id) => api.delete(`/courses/${id}`).then((r) => r.data);

export const enrollInCourse = (id) => api.post(`/courses/${id}/enroll`).then((r) => r.data);

/* ------------------------------ Enrollments ----------------------------- */

export const fetchMyEnrollments = () => api.get('/enrollments').then((r) => r.data);

export const fetchEnrollmentForCourse = (courseId) =>
  api.get(`/enrollments/${courseId}`).then((r) => r.data);

export const markLessonComplete = (courseId, lessonId) =>
  api
    .patch(`/enrollments/${courseId}/lessons/${lessonId}/complete`)
    .then((r) => r.data);

/* -------------------------------- Lessons ------------------------------- */

export const fetchLessons = (courseId) =>
  api.get(`/lessons/${courseId}`).then((r) => r.data);

export const createLesson = (payload) => api.post('/lessons', payload).then((r) => r.data);

export const updateLesson = (id, payload) =>
  api.put(`/lessons/${id}`, payload).then((r) => r.data);

export const deleteLesson = (id) => api.delete(`/lessons/${id}`).then((r) => r.data);

/* -------------------------------- Quizzes ------------------------------- */

export const fetchQuizzes = (courseId) =>
  api.get(`/quizzes/${courseId}`).then((r) => r.data);

export const fetchQuiz = (id) => api.get(`/quizzes/single/${id}`).then((r) => r.data);

export const createQuiz = (payload) => api.post('/quizzes', payload).then((r) => r.data);

export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`).then((r) => r.data);

export const submitQuiz = (id, answers) =>
  api.post(`/quizzes/${id}/submit`, { answers }).then((r) => r.data);

/* ------------------------------- Progress ------------------------------- */

export const fetchProgress = () => api.get('/progress').then((r) => r.data);

/* -------------------------------- Admin --------------------------------- */

export const fetchStudents = () => api.get('/admin/students').then((r) => r.data);

export const deleteStudent = (id) => api.delete(`/admin/students/${id}`).then((r) => r.data);
