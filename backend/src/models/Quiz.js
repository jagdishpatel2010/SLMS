/**
 * Quiz model (Sequelize).
 *
 * A quiz belongs to a course and has many questions (see Question model). The
 * correct-answer index lives on each Question and is stripped from
 * student-facing responses in the controller so it is never leaked.
 */
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Quiz extends Model {}

Quiz.init(
  {
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      index: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Quiz',
    tableName: 'quizzes',
  }
);
