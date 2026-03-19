type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

type LogEntry = {
  level: LogLevel;
  event: string;
  message: string;
  timestamp: string;
} & LogMeta;

function writeLog(level: LogLevel, event: string, message: string, meta: LogMeta = {}) {
  const entry: LogEntry = {
    level,
    event,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const payload = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(payload);
      break;
    case "warn":
      console.warn(payload);
      break;
    default:
      console.info(payload);
      break;
  }
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

export const logger = {
  info(event: string, message: string, meta?: LogMeta) {
    writeLog("info", event, message, meta);
  },
  warn(event: string, message: string, meta?: LogMeta) {
    writeLog("warn", event, message, meta);
  },
  error(event: string, message: string, meta?: LogMeta) {
    writeLog("error", event, message, meta);
  },
  errorWithException(event: string, message: string, error: unknown, meta?: LogMeta) {
    writeLog("error", event, message, {
      ...meta,
      error: serializeError(error),
    });
  },
};
