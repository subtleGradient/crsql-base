# @vlcn.io/bun-sqlite-lib

SQLite library loader for Bun with extension support. Provides a bundled SQLite library with extension loading enabled, bypassing Apple's system SQLite which has extensions disabled.

## Installation

```bash
bun add @vlcn.io/bun-sqlite-lib
```

This will automatically install the correct platform-specific SQLite library based on your system.

## Usage

```typescript
import { setBundledSQLite } from '@vlcn.io/bun-sqlite-lib';
import { Database } from 'bun:sqlite';

// MUST be called before creating any Database instances
setBundledSQLite();

// Now you can use bun:sqlite with extension support
const db = new Database('app.db');
db.loadExtension('/path/to/crsqlite.dylib'); // Works! 🎉
```

## API

### `setBundledSQLite(): string`
Sets the bundled SQLite library for Bun. Must be called before creating any Database instances.
Returns the path to the SQLite library.

### `getSQLitePath(): string`
Returns the absolute path to the bundled SQLite library.

### `isSQLiteAvailable(): boolean`
Checks if the bundled SQLite library is available on the system.

### `getSQLiteVersion(): string`
Returns the version of the bundled SQLite library.

## CLI Tool

The package includes a CLI tool to inspect the SQLite installation:

```bash
# Print the path to the SQLite library
npx sqlite-path

# Check if the library is available
npx sqlite-path --check

# Print the SQLite version
npx sqlite-path --version
```

## Platform Support

Currently supports:
- macOS ARM64 (Apple Silicon)
- macOS x64 (Intel)

The correct platform package is installed automatically as an optional dependency.

## How It Works

1. The package provides prebuilt SQLite libraries compiled with extension loading enabled
2. Uses Bun's `Database.setCustomSQLite()` API to override the system SQLite
3. Platform-specific packages are distributed separately to minimize download size
4. The loader automatically detects your platform and uses the correct library

## Building from Source

The SQLite libraries are built from the official SQLite amalgamation with these features enabled:
- JSON1
- FTS5
- R*Tree
- Column metadata
- Math functions
- **Extension loading** (the key feature!)

## License

MIT