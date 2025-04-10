import { env } from "~/env";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogOptions {
  context?: string;
  data?: unknown;
}

interface Logger {
  debug: (message: string, options?: LogOptions) => void;
  info: (message: string, options?: LogOptions) => void;
  warn: (message: string, options?: LogOptions) => void;
  error: (message: string, options?: LogOptions) => void;
  withNamespace: (namespace: string) => Logger;
}

const createLogger = (namespace = "app"): Logger => {
  // Use a client-side check for development mode
  const shouldLog =
    typeof window !== "undefined" && process.env.NODE_ENV === "development";

  const log = (level: LogLevel, message: string, options?: LogOptions) => {
    if (!shouldLog && level !== "error") return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${namespace}]${options?.context ? ` [${options.context}]` : ""}:`;

    switch (level) {
      case "debug":
        console.debug(prefix, message, options?.data);
        break;
      case "info":
        console.info(prefix, message, options?.data);
        break;
      case "warn":
        console.warn(prefix, message, options?.data);
        break;
      case "error":
        console.error(prefix, message, options?.data);
        break;
    }
  };

  const logger: Logger = {
    debug: (message, options) => log("debug", message, options),
    info: (message, options) => log("info", message, options),
    warn: (message, options) => log("warn", message, options),
    error: (message, options) => log("error", message, options),
    withNamespace: (newNamespace: string) => createLogger(newNamespace),
  };

  return logger;
};

export const logger = createLogger();
