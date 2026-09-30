/**
 * CompletedLesson model (Sequelize).
 *
 * Join table recording which lessons a given enrollment has completed. Each
 * row is a unique (enrollmentId, lessonId) pair, replacing the array field
 * that the MongoDB version stored on the enrollment document.
 */
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class CompletedLesson extends Model {}

CompletedLesson.init(
  {
    enrollmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'CompletedLesson',
    tableName: 'completed_lessons',
    indexes: [
      // A lesson can only be marked complete once per enrollment.
      { unique: true, fields: ['enrollmentId', 'lessonId'] },
    ],
  }
);
