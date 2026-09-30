/**
 * PostgreSQL connection via Sequelize.
 *
 * Creates a single shared Sequelize instance for the whole app. Prefers a full
 * DATABASE_URL when provided (common on hosting platforms); otherwise builds
 * the connection from discrete PG* settings.
 */
import { Sequelize } from 'sequelize';
import { config } from './env.js';

// Build the Sequelize instance. Logging is disabled to keep the console clean;
// set `logging: console.log` temporarily when debugging SQL.
export const sequelize = config.databaseUrl
  ? new Sequelize(config.databaseUrl, {
      dialect: 'postgres',
      logging: false,
    })
  : new Sequelize(config.db.database, config.db.user, config.db.password, {
      host: config.db.host,
      port: config.db.port,
      dialect: 'postgres',
      logging: false,
    });

/**
 * Verify the database connection. Exits the process on failure so the app
 * never runs without a working database.
 *
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // Log host/db name only — never log the password.
    console.log(`PostgreSQL connected: ${config.db.host}/${config.db.database}`);
  } catch (error) {
    console.error(`PostgreSQL connection error: ${error.message}`);
    process.exit(1);
  }
};
