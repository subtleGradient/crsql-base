import { Database } from 'bun:sqlite';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { join, dirname } from 'path';

let customSQLiteSet = false;

/**
 * Sets the bundled SQLite library for Bun's Database
 * Must be called before creating any Database instances
 * @returns true if successfully set, false if already set
 */
export function setBundledSQLite(): boolean {
  if (customSQLiteSet) {
    console.warn('setBundledSQLite() was already called. Skipping...');
    return false;
  }

  const dylibPath = getSQLitePath();
  
  if (!dylibPath) {
    throw new Error(
      `SQLite library not available for platform '${process.platform}'. ` +
      `Currently only macOS (darwin) is supported. ` +
      `Make sure you're running on macOS and the platform-specific package is installed: ` +
      `@vlcn.io-community/libsqlite3-darwin-${process.arch === 'arm64' ? 'arm64' : 'x64'}`
    );
  }

  Database.setCustomSQLite(dylibPath);
  customSQLiteSet = true;
  
  console.debug(`✅ Custom SQLite set: ${dylibPath}`);
  return true;
}

/**
 * Gets the path to the bundled SQLite library
 * @returns The absolute path to the SQLite dylib, or null if not available for current platform
 */
export function getSQLitePath(): string | null {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  
  // Only Darwin (macOS) is currently supported with bundled SQLite libraries
  if (process.platform !== 'darwin') {
    return null;
  }
  
  const arch = process.arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
  const dylibPath = join(__dirname, '..', '..', `libsqlite3-${arch}`, 'vendor', 'libsqlite3.0.dylib');
  
  // Return null if library doesn't exist instead of invalid path
  return existsSync(dylibPath) ? dylibPath : null;
}

/**
 * Checks if the bundled SQLite library is available
 * @returns true if the library exists, false otherwise
 */
export function isSQLiteAvailable(): boolean {
  try {
    const path = getSQLitePath();
    return path !== null;
  } catch {
    return false;
  }
}

/**
 * Gets the SQLite version from the bundled library
 * @returns The SQLite version string
 */
export function getSQLiteVersion(): string {
  // This would be dynamically determined from the actual library
  // For now, return the version we're targeting
  return '3.47.2';
}

/**
 * Resets the custom SQLite setting (mainly for testing)
 * @internal
 */
export function resetCustomSQLite(): void {
  customSQLiteSet = false;
}