/**
 * User model (Sequelize).
 *
 * Represents both students and admins (distinguished by `role`). Passwords are
 * hashed with bcrypt via lifecycle hooks; the plaintext value never reaches
 * the database. The password column is excluded from queries by default via a
 * `defaultScope` so it is never accidentally serialised to a client.
 */
import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';

export class User extends Model {
  /**
   * Compare a candidate plaintext password against the stored hash.
   *
   * @param {string} candidate - Plaintext password supplied at login.
   * @returns {Promise<boolean>} True when the password matches.
   */
  matchPassword(candidate) {
    return bcrypt.compare(candidate, this.password);
  }
}

User.init(
  {
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: { len: [2, 80] },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // prevents duplicate accounts
      validate: { isEmail: true },
      set(value) {
        // Normalise email to lowercase before storing.
        this.setDataValue('email', String(value).toLowerCase().trim());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('student', 'admin'),
      allowNull: false,
      defaultValue: 'student',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    // Hide the password hash from every normal query result.
    defaultScope: { attributes: { exclude: ['password'] } },
    // A named scope for the rare case we need the hash (e.g. login).
    scopes: { withPassword: { attributes: { include: ['password'] } } },
    hooks: {
      // Hash the password whenever it is set or changed.
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);
