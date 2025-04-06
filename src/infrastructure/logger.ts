type LogLevel = "info" | "error" | "warn" | "debug";

type LogContext = Record<string, unknown>;

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}${
      context ? ` ${JSON.stringify(context)}` : ""
    }`;

    if (level === "error") {
      console.error(logMessage);
    } else if (this.isDevelopment || level === "info") {
      console.log(logMessage);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log("error", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }
}

export const logger = Logger.getInstance();
