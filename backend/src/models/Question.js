/**
 * Question model (Sequelize).
 *
 * A multiple-choice question belonging to a quiz. `options` is stored as a
 * JSONB array of strings, and `correctOption` is the zero-based index of the
 * correct choice within that array.
 */
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Question extends Model {}

Question.init(
  {
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      index: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Array of answer options; JSONB keeps them together with the question row.
    options: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        // Enforce at least two options at the model level.
        hasTwoOptions(value) {
          if (!Array.isArray(value) || value.length < 2) {
            throw new Error('A question needs at least two options');
          }
        },
      },
    },
    // Zero-based index into `options` marking the correct choice.
    correctOption: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    sequelize,
    modelName: 'Question',
    tableName: 'questions',
  }
);
