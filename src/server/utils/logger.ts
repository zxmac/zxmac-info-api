import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [new transports.Console()]
});

// morgan stream -> winston
export const httpStream = {
  write: (message: string) => logger.http ? logger.http(message.trim()) : logger.info(message.trim())
};