/**
 * Lesson model (Sequelize).
 *
 * Lessons belong to a course and are grouped into modules. `order` controls
 * sequencing within a course so the learning interface can render next/prev.
 */
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Lesson extends Model {}

Lesson.init(
  {
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      index: true, // lessons are almost always queried by course
    },
    // Module grouping label, e.g. "Getting Started".
    module: {
      type: DataTypes.STRING,
      defaultValue: 'General',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    // Optional video URL/link shown in the learning interface.
    videoUrl: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    duration: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    // Position within the course; used for ordering next/previous navigation.
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Lesson',
    tableName: 'lessons',
  }
);
