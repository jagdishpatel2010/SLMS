/**
 * Model registry and associations.
 *
 * Imports every Sequelize model and declares the relationships between them in
 * one place. Importing from this module (rather than the individual files)
 * guarantees the associations have been set up. `onDelete: 'CASCADE'` mirrors
 * the cascade-delete behaviour the MongoDB version implemented manually.
 */
import { sequelize } from '../config/db.js';
import { User } from './User.js';
import { Course } from './Course.js';
import { Lesson } from './Lesson.js';
import { Quiz } from './Quiz.js';
import { Question } from './Question.js';
import { Enrollment } from './Enrollment.js';
import { CompletedLesson } from './CompletedLesson.js';
import { QuizResult } from './QuizResult.js';

/* --------------------------- Course relations --------------------------- */

// An admin creates many courses.
User.hasMany(Course, { foreignKey: 'createdBy' });
Course.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// A course has many lessons and quizzes; deleting a course removes them.
Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons', onDelete: 'CASCADE' });
Lesson.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(Quiz, { foreignKey: 'courseId', as: 'quizzes', onDelete: 'CASCADE' });
Quiz.belongsTo(Course, { foreignKey: 'courseId' });

/* ---------------------------- Quiz relations ---------------------------- */

// A quiz has many questions; deleting a quiz removes them.
Quiz.hasMany(Question, { foreignKey: 'quizId', as: 'questions', onDelete: 'CASCADE' });
Question.belongsTo(Quiz, { foreignKey: 'quizId' });

/* ------------------------- Enrollment relations ------------------------- */

// A student has many enrollments; a course has many enrollments.
User.hasMany(Enrollment, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Enrollment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments', onDelete: 'CASCADE' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Completed lessons: a many-to-many between enrollments and lessons, tracked
// through the CompletedLesson join table.
Enrollment.belongsToMany(Lesson, {
  through: CompletedLesson,
  foreignKey: 'enrollmentId',
  otherKey: 'lessonId',
  as: 'completedLessons',
  onDelete: 'CASCADE',
});
Lesson.belongsToMany(Enrollment, {
  through: CompletedLesson,
  foreignKey: 'lessonId',
  otherKey: 'enrollmentId',
  onDelete: 'CASCADE',
});

/* -------------------------- QuizResult relations ------------------------ */

User.hasMany(QuizResult, { foreignKey: 'studentId', onDelete: 'CASCADE' });
QuizResult.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Quiz.hasMany(QuizResult, { foreignKey: 'quizId', as: 'results', onDelete: 'CASCADE' });
QuizResult.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

Course.hasMany(QuizResult, { foreignKey: 'courseId', onDelete: 'CASCADE' });
QuizResult.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

/* ------------------------------------------------------------------------ *
 * Frontend compatibility: expose `_id` alongside `id`.
 *
 * The React frontend (originally built against MongoDB) reads `_id` on every
 * entity. Rather than touch every component, we add an `_id` mirror of the
 * numeric primary key to each model's serialised output. This keeps the API
 * response shape identical to the previous MongoDB version.
 * ------------------------------------------------------------------------ */
const addIdAlias = (model) => {
  const originalToJSON = model.prototype.toJSON;
  // eslint-disable-next-line no-param-reassign, func-names
  model.prototype.toJSON = function () {
    const values = originalToJSON.call(this);
    if (values && values.id !== undefined && values._id === undefined) {
      values._id = values.id;
    }
    return values;
  };
};

[User, Course, Lesson, Quiz, Question, Enrollment, CompletedLesson, QuizResult].forEach(addIdAlias);

export {
  sequelize,
  User,
  Course,
  Lesson,
  Quiz,
  Question,
  Enrollment,
  CompletedLesson,
  QuizResult,
};
