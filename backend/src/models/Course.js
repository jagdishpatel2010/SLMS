/**
 * Course model (Sequelize).
 *
 * A course groups lessons and quizzes and is the primary unit students browse
 * and enroll in.
 */
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Course extends Model {}

Course.init(
  {
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    instructor: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true, // the catalogue filters heavily by category
    },
    // Human-friendly duration label, e.g. "6 weeks" or "12 hours".
    duration: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    level: {
      type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
      defaultValue: 'Beginner',
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    // URL to a thumbnail image; kept as a string so any CDN/host works.
    thumbnail: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    // FK to the admin who created the course (set in the association index).
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Course',
    tableName: 'courses',
  }
);
