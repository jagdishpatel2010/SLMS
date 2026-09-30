/**
 * Express application setup.
 *
 * Wires global middleware (security headers, CORS, body/cookie parsing, rate
 * limiting), mounts the API routers, and registers the 404 + error handlers.
 * Kept separate from server.js so the app can be imported for testing without
 * opening a network port.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { config } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Security HTTP headers (X-Content-Type-Options, frameguard, etc.).
app.use(helmet());

// Allow the SPA origin and send cookies with cross-origin requests.
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Parse JSON bodies and cookies (the JWT lives in an httpOnly cookie).
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Apply the general rate limiter to all API traffic.
app.use('/api', apiLimiter);

// Lightweight health check for uptime probes.
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

// Feature routers.
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// Unmatched routes -> 404, then the central error handler.
app.use(notFound);
app.use(errorHandler);

export default app;
