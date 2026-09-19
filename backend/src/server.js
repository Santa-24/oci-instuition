import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';

import healthRoutes from './routes/health.routes.js';
import examRoutes from './routes/exam.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import appVersionRoutes from './routes/app-version.routes.js';

const app = express();

// Security Headers
app.use(helmet());

// Strict Production CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    if (ENV.CORS_ALLOWED_ORIGINS.includes(origin) || ENV.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by OCI CORS policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info'],
};
app.use(cors(corsOptions));

// JSON Request Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging (Structured without logging secrets)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use(healthRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', appVersionRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'OCI Platform Backend API',
    status: 'ONLINE',
    docs: '/health',
    timestamp: new Date().toISOString(),
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: `Path ${req.originalUrl} not found on OCI Backend Service.` });
});

// Production Centralized Error Handler (Never show raw stack trace to user)
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Exception]:', err.message);
  const status = err.status || 500;
  const message = ENV.NODE_ENV === 'production' 
    ? 'An internal error occurred. Our operations team has been notified.' 
    : err.message;
  res.status(status).json({ error: message });
});

// Start Server
const server = app.listen(ENV.PORT, () => {
  console.log('================================================================');
  console.log(`🚀 OCI Production Backend Service running on port ${ENV.PORT}`);
  console.log(`   Health Check: http://localhost:${ENV.PORT}/health`);
  console.log(`   Environment:  ${ENV.NODE_ENV}`);
  console.log('================================================================');
});

// Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\n[Shutdown] Received ${signal}. Terminating gracefully...`);
  server.close(() => {
    console.log('[Shutdown] HTTP Server terminated cleanly.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
