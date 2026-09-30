/**
 * Enrollment model (Sequelize).
 *
 * Links a student to a course they enrolled in and tracks a derived progress
 * percentage. Completed lessons are tracked via the CompletedLesson join
 * table (a many-to-many between enrollments and lessons). A unique constraint
 * on (studentId, courseId) prevents enrolling in the same course twice.
 */
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Enrollment extends Model {}

Enrollment.init(
  {
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 0–100 completion percentage, recomputed when lessons are completed.
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    status: {
      type: DataTypes.ENUM('in-progress', 'completed'),
      defaultValue: 'in-progress',
    },
  },
  {
    sequelize,
    modelName: 'Enrollment',
    tableName: 'enrollments',
    indexes: [
      // One enrollment per student+course pair.
      { unique: true, fields: ['studentId', 'courseId'] },
    ],
  }
);
