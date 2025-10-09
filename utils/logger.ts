import { createLogger, format, transports } from 'winston';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const isDev = process.env.NODE_ENV === 'development';

const devFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.printf((info: any) => {
    const { level, message, timestamp, ...meta } = info;
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${String(message)}${extra}`;
  })
);

const prodFormat = format.combine(
  format.timestamp(),
  format.json()
);

// Ensure logs directory exists
const logDir = process.env.LOG_DIR || 'logs';
mkdirSync(logDir, { recursive: true });

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: isDev ? devFormat : prodFormat,
  transports: [
    new transports.Console(),
    new transports.File({ filename: join(logDir, 'auth-configurator.log'), level: 'debug', format: prodFormat })
  ],
});

export default logger;
