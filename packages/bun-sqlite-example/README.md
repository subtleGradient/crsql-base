# Bun + CR-SQLite Example

This example demonstrates how to use CR-SQLite (Conflict-free Replicated SQLite) with Bun runtime using better-sqlite3.

## What it demonstrates

- Loading the CR-SQLite extension with better-sqlite3 in Bun
- Creating CRDT-enabled tables
- Syncing data between two database instances
- Bidirectional synchronization
- Conflict resolution with Last-Write-Wins

## Running the example

```bash
# Install dependencies
bun install

# Run the example with Node.js (due to Bun native module limitations)
npx tsx src/better-sqlite3.ts

# Or use Node.js directly
node --loader tsx src/better-sqlite3.ts
```

Note: Currently, Bun's built-in SQLite doesn't support dynamic extension loading, and better-sqlite3's native module has compatibility issues with Bun runtime. The example runs successfully with Node.js.

## Key concepts

### Loading CR-SQLite

```typescript
import Database from "better-sqlite3";

const db = new Database(":memory:");
db.loadExtension("path/to/crsqlite.dylib");
```

### Making tables replicated

```typescript
// Convert a table to a CRDT
db.exec("SELECT crsql_as_crr('todos')");
```

### Syncing changes

```typescript
// Get changes from source database
const changes = sourceDb.query(`
  SELECT * FROM crsql_changes
`).all();

// Apply changes to target database
changes.forEach(change => {
  targetDb.query(`
    INSERT INTO crsql_changes (...) VALUES (...)
  `).run(...);
});
```

## Architecture

CR-SQLite uses CRDTs (Conflict-free Replicated Data Types) to enable:
- Multi-master replication
- Automatic conflict resolution
- Eventual consistency
- Offline-first capabilities

Each database has a unique site ID and tracks changes with logical clocks, enabling deterministic conflict resolution across all peers.

## Learn more

- [CR-SQLite Documentation](https://vlcn.io)
- [Bun SQLite Documentation](https://bun.sh/docs/api/sqlite)
- [CRDTs Explained](https://crdt.tech)