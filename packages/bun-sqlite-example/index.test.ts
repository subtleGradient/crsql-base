import { describe, it, expect, beforeEach, afterEach, beforeAll } from "bun:test";
import { Database } from "bun:sqlite";
import fs from "fs";
import path from "path";

// Check if dependencies are available
let isSQLiteAvailable = false;
let extensionPath: string | undefined;

try {
  const sqliteLib = await import("@vlcn.io-community/bun-sqlite-lib");
  isSQLiteAvailable = sqliteLib.isSQLiteAvailable();
} catch (e) {
  console.log("Note: @vlcn.io-community/bun-sqlite-lib not available, skipping tests");
}

try {
  const crsqlite = await import("@vlcn.io/crsqlite");
  extensionPath = crsqlite.extensionPath;
} catch (e) {
  console.log("Note: @vlcn.io/crsqlite not available, skipping tests");
}

const testsEnabled = isSQLiteAvailable && extensionPath && fs.existsSync(extensionPath);

describe.skipIf(!testsEnabled)("bun-sqlite-example", () => {
  let db: Database;
  const testDbPath = path.join(import.meta.dir, "test.db");

  beforeAll(async () => {
    // Set the bundled SQLite before any Database instances are created
    const { setBundledSQLite } = await import("@vlcn.io-community/bun-sqlite-lib");
    setBundledSQLite();
  });

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it("should create a database and load cr-sqlite extension", () => {
    db = new Database(testDbPath);
    
    // Load the cr-sqlite extension
    expect(() => db.loadExtension(extensionPath!)).not.toThrow();
    
    // Verify extension is loaded by checking for cr-sqlite functions
    const result = db.query("SELECT crsql_db_version()").get();
    expect(result).toBeDefined();
    expect(result).toHaveProperty("crsql_db_version()");
  });

  it("should create and query a CRDT table", () => {
    db = new Database(":memory:");
    db.loadExtension(extensionPath!);
    
    // Create a regular table with proper primary key
    db.exec("CREATE TABLE todos (id TEXT PRIMARY KEY NOT NULL, text TEXT, completed INTEGER)");
    
    // Convert to CRDT
    db.exec("SELECT crsql_as_crr('todos')");
    
    // Insert data
    db.exec("INSERT INTO todos VALUES ('todo1', 'Test todo', 0)");
    
    // Query the data
    const result = db.query("SELECT * FROM todos").get();
    expect(result).toEqual({
      id: "todo1",
      text: "Test todo",
      completed: 0,
    });
  });

  it("should track changes in CRDT tables", () => {
    db = new Database(":memory:");
    db.loadExtension(extensionPath!);
    
    // Setup CRDT table with proper primary key
    db.exec("CREATE TABLE items (id TEXT PRIMARY KEY NOT NULL, value TEXT)");
    db.exec("SELECT crsql_as_crr('items')");
    
    // Insert and update
    db.exec("INSERT INTO items VALUES ('item1', 'initial')");
    db.exec("UPDATE items SET value = 'updated' WHERE id = 'item1'");
    
    // Check changes
    const changes = db.query("SELECT * FROM crsql_changes").all();
    expect(changes.length).toBeGreaterThan(0);
  });
});

// If tests are skipped, provide a message
if (!testsEnabled) {
  it("Prerequisites not available", () => {
    console.log("Skipping tests - SQLite library or cr-sqlite extension not available");
    console.log("To run these tests, ensure:");
    console.log("  1. @vlcn.io-community/libsqlite3-darwin-arm64 or -x64 is installed with dylib");
    console.log("  2. @vlcn.io/crsqlite is built and available");
    expect(true).toBe(true);
  });
}