/**
 * Quiz controller.
 *
 * Students fetch quizzes (without the correct answers) and submit answers to
 * receive a graded result. Admins create quizzes with answer keys.
 *
 * Security note: correct-answer indexes are stored server-side and NEVER sent
 * to the student before grading. Grading also happens on the server so the
 * client cannot tamper with the score.
 */
import { Quiz, Question, Course, QuizResult, sequelize } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// A quiz score at or above this percentage is a pass.
const PASS_THRESHOLD = 60;

/**
 * Shape a quiz (with its questions) into a student-safe object: each question
 * is reduced to id/text/options with the correct answer removed.
 *
 * @param {object} quiz - Quiz instance including `questions`.
 * @returns {object} Student-facing quiz object.
 */
const toStudentQuiz = (quiz) => {
  const plain = quiz.toJSON();
  return {
    _id: plain.id,
    course: plain.courseId,
    title: plain.title,
    questions: (plain.questions || []).map((q) => ({
      _id: q.id,
      text: q.text,
      options: q.options,
    })),
  };
};

/**
 * GET /api/quizzes/:courseId
 * List quizzes for a course (answers removed).
 */
export const getQuizzesForCourse = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.findAll({
    where: { courseId: req.params.courseId },
    include: [{ model: Question, as: 'questions' }],
  });
  res.json({ success: true, quizzes: quizzes.map(toStudentQuiz) });
});

/**
 * GET /api/quizzes/single/:id
 * Fetch one quiz to take (answers removed).
 */
export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findByPk(req.params.id, {
    include: [{ model: Question, as: 'questions' }],
  });
  if (!quiz) throw new ApiError(404, 'Quiz not found.');
  res.json({ success: true, quiz: toStudentQuiz(quiz) });
});

/**
 * POST /api/quizzes  (admin)
 * Create a quiz with its questions and answer key (in a transaction).
 */
export const createQuiz = asyncHandler(async (req, res) => {
  const { course, title, questions } = req.body;

  const parent = await Course.findByPk(course);
  if (!parent) throw new ApiError(404, 'Course not found for this quiz.');

  // Validate each question's correctOption points to a real option index.
  (questions || []).forEach((q, i) => {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new ApiError(400, `Question ${i + 1} needs at least two options.`);
    }
    if (
      typeof q.correctOption !== 'number' ||
      q.correctOption < 0 ||
      q.correctOption >= q.options.length
    ) {
      throw new ApiError(400, `Question ${i + 1} has an invalid correct option.`);
    }
  });

  // Create the quiz and its questions atomically.
  const quiz = await sequelize.transaction(async (t) => {
    const created = await Quiz.create({ courseId: course, title }, { transaction: t });
    if (questions && questions.length) {
      await Question.bulkCreate(
        questions.map((q) => ({
          quizId: created.id,
          text: q.text,
          options: q.options,
          correctOption: q.correctOption,
        })),
        { transaction: t }
      );
    }
    return created;
  });

  const full = await Quiz.findByPk(quiz.id, { include: [{ model: Question, as: 'questions' }] });
  res.status(201).json({ success: true, quiz: full });
});

/**
 * PUT /api/quizzes/:id  (admin)
 * Replace a quiz's title and/or questions.
 */
export const updateQuiz = asyncHandler(async (req, res) => {
  const { title, questions } = req.body;

  const quiz = await Quiz.findByPk(req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz not found.');

  await sequelize.transaction(async (t) => {
    if (title !== undefined) {
      quiz.title = title;
      await quiz.save({ transaction: t });
    }
    // Replacing questions: delete existing then insert the new set.
    if (Array.isArray(questions)) {
      await Question.destroy({ where: { quizId: quiz.id }, transaction: t });
      await Question.bulkCreate(
        questions.map((q) => ({
          quizId: quiz.id,
          text: q.text,
          options: q.options,
          correctOption: q.correctOption,
        })),
        { transaction: t }
      );
    }
  });

  const full = await Quiz.findByPk(quiz.id, { include: [{ model: Question, as: 'questions' }] });
  res.json({ success: true, quiz: full });
});

/**
 * DELETE /api/quizzes/:id  (admin)
 */
export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findByPk(req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz not found.');
  await quiz.destroy();
  res.json({ success: true, message: 'Quiz deleted.' });
});

/**
 * POST /api/quizzes/:id/submit  (student)
 * Grade submitted answers server-side and persist a result.
 *
 * Request body: { answers: { [questionId]: selectedOptionIndex } }
 */
export const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  if (!answers || typeof answers !== 'object') {
    throw new ApiError(400, 'Answers must be provided as an object of questionId -> optionIndex.');
  }

  const quiz = await Quiz.findByPk(req.params.id, {
    include: [{ model: Question, as: 'questions' }],
  });
  if (!quiz) throw new ApiError(404, 'Quiz not found.');

  const totalQuestions = quiz.questions.length;
  if (totalQuestions === 0) throw new ApiError(400, 'This quiz has no questions.');

  // Grade by comparing each stored correctOption against the submitted choice.
  let correctAnswers = 0;
  quiz.questions.forEach((q) => {
    // Answer keys arrive as strings (JSON object keys); match on id.
    const submitted = answers[q.id] ?? answers[String(q.id)];
    if (submitted === q.correctOption) correctAnswers += 1;
  });

  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = percentage >= PASS_THRESHOLD;

  const result = await QuizResult.create({
    studentId: req.user.id,
    quizId: quiz.id,
    courseId: quiz.courseId,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    percentage,
    passed,
  });

  res.status(201).json({
    success: true,
    result: {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      percentage,
      passed,
      passThreshold: PASS_THRESHOLD,
      id: result.id,
    },
  });
});
