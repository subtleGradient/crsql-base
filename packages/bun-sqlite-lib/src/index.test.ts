import { describe, it, expect } from "bun:test";
import { getSQLitePath, isSQLiteAvailable, getSQLiteVersion } from "./index";

describe("bun-sqlite-lib", () => {
  it("should return correct SQLite path for current platform", () => {
    const path = getSQLitePath();
    
    if (process.platform === 'darwin') {
      // On macOS, should return a valid path
      expect(typeof path).toBe("string");
      expect(path).toContain("libsqlite3");
      expect(path).toContain(process.arch === "arm64" ? "darwin-arm64" : "darwin-x64");
    } else {
      // On other platforms, should return null (not supported yet)
      expect(path).toBeNull();
    }
  });

  it("should check if SQLite is available", () => {
    const available = isSQLiteAvailable();
    // This will be true or false depending on whether the library is installed
    expect(typeof available).toBe("boolean");
  });

  it("should return SQLite version", () => {
    const version = getSQLiteVersion();
    expect(version).toBe("3.47.2");
  });

  // Note: We can't test setBundledSQLite() in unit tests because:
  // 1. Database.setCustomSQLite() can only be called once per process
  // 2. It must be called before any Database instances are created
  // 3. Running tests may have already initialized SQLite
  // This functionality should be tested via integration tests or example usage
});