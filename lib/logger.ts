import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";

type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

type LogEntry = {
  level: LogLevel;
  event: string;
  message: string;
  timestamp: string;
} & LogMeta;

export const LOG_PATH = path.join(process.cwd(), "logs", "app-events.jsonl");

function writeLog(level: LogLevel, event: string, message: string, meta: LogMeta = {}) {
  const entry: LogEntry = {
    level,
    event,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const payload = JSON.stringify(entry);

  try {
    mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    appendFileSync(LOG_PATH, `${payload}\n`, "utf8");
  } catch (error) {
    const fallback = JSON.stringify({
      level: "error",
      event: "logger.write_failed",
      message: "Failed to write log file.",
      timestamp: new Date().toISOString(),
      logPath: LOG_PATH,
      error: serializeError(error),
      originalEntry: entry,
    });
    console.error(fallback);
  }

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
  userFacingErrorWithException(
    event: string,
    message: string,
    error: unknown,
    meta?: LogMeta,
  ) {
    writeLog("error", event, message, {
      ...meta,
      userFacing: true,
      error: serializeError(error),
    });
  },
};
