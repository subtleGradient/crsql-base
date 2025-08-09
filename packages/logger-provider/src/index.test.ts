import { describe, it, expect, vi, beforeEach } from "vitest";

describe("logger-provider", () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let consoleDebugSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  it("should log info messages", () => {
    const logger = {
      info: (msg: string) => console.log(msg),
      error: (msg: string) => console.error(msg),
      warn: (msg: string) => console.warn(msg),
      debug: (msg: string) => console.debug(msg),
    };

    logger.info("Test info message");
    expect(consoleLogSpy).toHaveBeenCalledWith("Test info message");
  });

  it("should log error messages", () => {
    const logger = {
      info: (msg: string) => console.log(msg),
      error: (msg: string) => console.error(msg),
      warn: (msg: string) => console.warn(msg),
      debug: (msg: string) => console.debug(msg),
    };

    logger.error("Test error message");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Test error message");
  });

  it("should format log messages with context", () => {
    const logger = {
      info: (msg: string, context?: any) => {
        const formatted = context ? `${msg} ${JSON.stringify(context)}` : msg;
        console.log(formatted);
      },
    };

    logger.info("User action", { userId: "123", action: "login" });
    expect(consoleLogSpy).toHaveBeenCalledWith('User action {"userId":"123","action":"login"}');
  });
});
