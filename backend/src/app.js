import express from 'express';
import cookieParser from 'cookie-parser';
import logger from './config/logger.js';
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import menuRoutes from './routes/menu.Routes.js';
import userRoutes from './routes/user.Routes.js';
import errorHandler from './middleware/errorHandler.js';
import connectDB from './config/db.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';
import { healthCheck } from './controllers/health.Controller.js';
import { register, metricsMiddleware } from './utils/metrics.js';
// Connect to database
connectDB();

// Initialize Express app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: {
      skip: req => req.url === '/health' || req.url === '/metrics',
      write: message => logger.info(message.trim()),
    },
  })
);
app.use(cookieParser());

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', healthCheck);

// Metrics middleware
app.use(metricsMiddleware);

// API routes
app.use('/api/menu', apiLimiter, menuRoutes);
app.use('/api/users', authLimiter, userRoutes);

// Serve Frontend
//if (process.env.NODE_ENV === 'production') {
// app.use(express.static(path.join(__dirname, '../../frontend/build')));
// app.get(/.*/, (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../../frontend/build/index.html'));
// });
//}
// else {
//app.get('*', (req, res) => {
// res.status(404).send('Please set to production');
// });
//}
app.use(errorHandler);

export default app;
