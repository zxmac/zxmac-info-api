import { createServer } from 'http';
import app from './server/app';
import { gsheets_api } from 'zxmac.googleapis.helper';
import { SocketService } from '@services';
import { env, logger } from '@utils';

gsheets_api.access.config({
  master: {
    id: env.GSHEETS_API_MASTER_ID
  },
  key: {
    gsheets_api_email: 'GSHEETS_API_EMAIL',
    gsheets_api_key: 'GSHEETS_API_KEY',
    gsheets_api_scopes: 'GSHEETS_API_SCOPES',
    gsheets_api_sheet_range: 'GSHEETS_API_SHEET_RANGE',
  }
});

const server = createServer(app);

const io = SocketService.initSocketIO(server);
app.set('io', io);

const PORT = env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`API listening on port ${PORT} (env: ${env.NODE_ENV})`);
});

['SIGINT', 'SIGTERM', 'uncaughtException', 'unhandledRejection'].forEach((sig) => {
  process.on(sig, (err) => {
    if (err) logger.error(err);
    logger.info(`Shutting down due to ${sig}`);
    server.close(() => process.exit(0));
    // Fallback shutdown in 3s
    setTimeout(() => process.exit(1), 3000).unref();
  });
});

