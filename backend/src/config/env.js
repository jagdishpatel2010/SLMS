/**
 * Centralised environment configuration.
 *
 * Loads variables from the process environment (populated by dotenv in
 * server.js) and exposes them as a single typed object. Reading env vars in
 * one place keeps the rest of the codebase free of scattered
 * `process.env.*` lookups and makes missing-value validation easy.
 */

// Read a required variable and fail fast if it is missing. Failing at boot is
// far safer than silently running with an undefined secret.
const required = (name) => {
  const value = process.env[name];
  if (!value) {
    // Do not print the value itself; only report which key is missing.
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const config = {
  port: process.env.PORT || 5000,

  // PostgreSQL connection: prefer a full DATABASE_URL, otherwise use discrete
  // PG* settings with sensible local defaults.
  databaseUrl: process.env.DATABASE_URL || '',
  db: {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE || 'slms',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
  },

  // JWT secret is mandatory: without it, tokens cannot be signed safely.
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  get isProduction() {
    return this.nodeEnv === 'production';
  },
};
