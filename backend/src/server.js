/**
 * Server entry point.
 *
 * `dotenv/config` is imported first (as a side-effect import) so environment
 * variables are loaded before any other module reads them. Then we connect to
 * PostgreSQL, sync the schema, and start the HTTP server.
 */
import 'dotenv/config';
import app from './app.js';
import { connectDB, sequelize } from './config/db.js';
import { config } from './config/env.js';
// Importing the model index registers all models + associations before sync.
import './models/index.js';

const start = async () => {
  await connectDB();

  // Create/adjust tables to match the models. `alter` keeps the schema in sync
  // during development without a separate migration step.
  await sequelize.sync({ alter: true });
  console.log('Database schema synchronised.');

  app.listen(config.port, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
  });
};

start();

// Catch unhandled rejections so the process fails loudly rather than silently.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});
