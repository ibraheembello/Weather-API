import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import weatherRouter from './routes/weather.js';
import { errorHandler } from './middleware/errorHandler.js';
import { securityMiddleware, logSecurityEvents } from './middleware/security.js';
import logger from './config/logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(securityMiddleware);
app.use(logSecurityEvents);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
  message: { error: 'Too many requests' }
}));

// Logging middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Routes
app.get('/health', (_, res) => res.status(200).json({ status: 'OK' }));
app.use('/api/v1/weather', weatherRouter);

// Error handling
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

// Error handling with logging
app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  next(err);
});

// Start server
const server = app.listen(port, () => console.log(`Server running on port ${port}`));

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

export default app;
