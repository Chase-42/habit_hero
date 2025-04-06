type LogLevel = "debug" | "info" | "warn" | "error";

interface LogOptions {
  level?: LogLevel;
  context?: string;
  data?: unknown;
}

const isDevelopment = process.env.NODE_ENV === "development";

export function log(message: string, options: LogOptions = {}) {
  const { level = "info", context, data } = options;

  if (!isDevelopment && level === "debug") {
    return;
  }

  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : "";
  const dataStr = data ? `\nData: ${JSON.stringify(data, null, 2)}` : "";

  const logMessage = `${timestamp} ${contextStr} ${message}${dataStr}`;

  switch (level) {
    case "debug":
      console.debug(logMessage);
      break;
    case "info":
      console.info(logMessage);
      break;
    case "warn":
      console.warn(logMessage);
      break;
    case "error":
      console.error(logMessage);
      break;
  }
}

export const logger = {
  debug: (message: string, options?: Omit<LogOptions, "level">) =>
    log(message, { ...options, level: "debug" }),
  info: (message: string, options?: Omit<LogOptions, "level">) =>
    log(message, { ...options, level: "info" }),
  warn: (message: string, options?: Omit<LogOptions, "level">) =>
    log(message, { ...options, level: "warn" }),
  error: (message: string, options?: Omit<LogOptions, "level">) =>
    log(message, { ...options, level: "error" }),
};
