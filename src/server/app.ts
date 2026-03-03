import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middlewares/error";
import { adminAuthenticator, authKeyAuthenticator, authenticator, keyAuthenticator } from "./middlewares/jwt";
import authRouter from "./routes/auth/router";
import gsheetRouter from "./routes/gsheet/router";
import lsheetRouter from "./routes/lsheet/router";
import taskRouter from "./routes/task/router";
import infoRouter from "./routes/info/router";
import bookRouter from "./routes/book/router";
import chatRouter from "./routes/chat/router";
import socketRouter from "./routes/socket/router";
import toolRouter from "./routes/tool/router";
import fileRouter from "./routes/file/router";
import { env } from "./helpers/env";
import { httpStream } from "./helpers/logger";
import { errors } from "celebrate";

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

app.use(keyAuthenticator);
// app.use(keyAuthenticator, responseHandler);

// Auth
app.use('/api/v1/auth', authRouter);

// Info
app.use('/api/v1/cv', infoRouter);

// Book
app.use('/api/v1/pf', bookRouter);

// GSheet
app.use('/api/v1/gsheet', adminAuthenticator, gsheetRouter);

// Lenient gsheet
app.use('/api/v1/lsheet', authKeyAuthenticator, lsheetRouter);

// Chat
app.use('/api/v1/chat', chatRouter);

// Socket
app.use('/api/v1/socket', adminAuthenticator, socketRouter);

// Task
app.use('/api/v1/task', adminAuthenticator, taskRouter);

// Tool
app.use('/api/v1/tool', authenticator, toolRouter);

// File
app.use('/api/v1/file', authenticator, fileRouter);

app.use(errors());

// 404 + centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;