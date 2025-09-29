import { createLogger, format, transports } from 'winston';

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

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isDev ? devFormat : prodFormat,
  transports: [new transports.Console()],
});

export default logger;
