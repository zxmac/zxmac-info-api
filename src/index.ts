import { createServer } from "http";
import app from "./server/app";
import socketService from "./server/services/socket/socket.service";
import gsheets_api from "./server/core/gsheets-api";
import { env } from "./server/helpers/env";
import { logger } from "./server/helpers/logger";

gsheets_api.access_config();

const server = createServer(app);

const io = socketService.initSocketIO(server);
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

