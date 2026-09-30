/**
 * QuizResult model (Sequelize).
 *
 * Stores the outcome of a student's quiz submission: score breakdown,
 * percentage, and pass/fail status. One row per submission so a student's
 * attempt history is preserved.
 */
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class QuizResult extends Model {}

QuizResult.init(
  {
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    quizId: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    totalQuestions: { type: DataTypes.INTEGER, allowNull: false },
    correctAnswers: { type: DataTypes.INTEGER, allowNull: false },
    wrongAnswers: { type: DataTypes.INTEGER, allowNull: false },
    percentage: { type: DataTypes.INTEGER, allowNull: false },
    passed: { type: DataTypes.BOOLEAN, allowNull: false },
  },
  {
    sequelize,
    modelName: 'QuizResult',
    tableName: 'quiz_results',
  }
);
