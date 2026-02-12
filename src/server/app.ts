import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { env } from './utils/env';
import { httpStream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { authenticateAdminJWT, authenticateAuthKey, authenticateJWT, authenticateKey } from './middlewares/jwt';
import { router as authRouter } from './routes/auth';
import { router as gsheetRouter } from './routes/gsheet';
import { router as lsheetRouter } from './routes/lsheet';
import { router as taskRouter } from './routes/task';
import { router as cvRouter } from './routes/cv';
import { router as pfRouter } from './routes/pf';
import { router as chatRouter } from './routes/chat';
import { router as socketRouter } from './routes/socket';
import { router as toolRouter } from './routes/tool';
import { router as todoRouter } from './routes/todo';

const app = express();

// Trust proxy (for secure cookies & correct IP detection) when behind a proxy
if (env.TRUST_PROXY) app.set('trust proxy', parseInt(env.TRUST_PROXY, 10));

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting (apply globally; you can also scope per route)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200, // adjust per your needs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

// CORS with allowlist
const allowed = (env.CORS_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization', 'Key', 'AuthKey']
}));

// Body parsers with sensible limits
app.use(express.json({ limit: '100kb' }));
// app.use(xss());
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());

// Prevent HTTP parameter pollution
app.use(hpp());

// Sanitize against NoSQL injection
// app.use(mongoSanitize());

// Compress responses
app.use(compression());

app.use(express.text());


// Logging (dev-friendly + production to Winston)
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: httpStream }));
}

app.use(authenticateKey);
// app.use(authenticateKey, responseHandler);

// Gsheet
app.use('/api/v1/gsheet', authenticateAdminJWT, gsheetRouter);

// Lenient sheet
app.use('/api/v1/lsheet', authenticateAuthKey, lsheetRouter);

// Chat
app.use('/api/v1/chat', chatRouter);

// Socket
app.use('/api/v1/socket', authenticateAdminJWT, socketRouter);

// Task
app.use('/api/v1/task', authenticateAdminJWT, taskRouter);

// Cv
app.use('/api/v1/cv', cvRouter);

// Portfolio
app.use('/api/v1/pf', pfRouter);

// Tool
app.use('/api/v1/tool', authenticateJWT, toolRouter);

// Todo
app.use('/api/v1/todo', authenticateJWT, todoRouter);

// Auth
app.use('/api/v1/auth', authRouter);

// 404 + centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;