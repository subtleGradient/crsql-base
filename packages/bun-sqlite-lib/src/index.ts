import { Database } from "bun:sqlite";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

let customSQLiteSet = false;

/**
 * Sets the bundled SQLite library for Bun's Database
 * Must be called before creating any Database instances
 * @returns true if successfully set, false if already set
 */
export function setBundledSQLite(): boolean {
	if (customSQLiteSet) {
		console.warn("setBundledSQLite() was already called. Skipping...");
		return false;
	}

	const dylibPath = getSQLitePath();

	if (!existsSync(dylibPath)) {
		const archSuffix = process.arch === "arm64" ? "arm64" : "x64";
		throw new Error(
			`SQLite library not found at ${dylibPath}. ` +
				`Make sure the platform-specific package is installed: ` +
				`@vlcn.io/libsqlite3-darwin-${archSuffix}`,
		);
	}

	Database.setCustomSQLite(dylibPath);
	customSQLiteSet = true;

	console.debug(`✅ Custom SQLite set: ${dylibPath}`);
	return true;
}

/**
 * Gets the path to the bundled SQLite library
 * @returns The absolute path to the SQLite dylib
 */
export function getSQLitePath() {
	if (process.platform !== "darwin") return;
	const __dirname = dirname(fileURLToPath(import.meta.url));
	const arch = process.arch === "arm64" ? "darwin-arm64" : "darwin-x64";
	const dylibPath = join(
		__dirname,
		"..",
		"..",
		`libsqlite3-${arch}`,
		"vendor",
		"libsqlite3.0.dylib",
	);
	return dylibPath;
}

/**
 * Checks if the bundled SQLite library is available
 * @returns true if the library exists, false otherwise
 */
export function isSQLiteAvailable(): boolean {
	try {
		return existsSync(getSQLitePath());
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
	return "3.47.2";
}

/**
 * Resets the custom SQLite setting (mainly for testing)
 * @internal
 */
export function resetCustomSQLite(): void {
	customSQLiteSet = false;
}
