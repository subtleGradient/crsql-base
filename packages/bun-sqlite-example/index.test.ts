import { describe, it, expect, beforeEach, afterEach, beforeAll } from "bun:test";
import { Database } from "bun:sqlite";
import { setBundledSQLite, isSQLiteAvailable } from "@vlcn.io/bun-sqlite-lib";
import { extensionPath } from "@vlcn.io/crsqlite";
import fs from "fs";
import path from "path";

describe.skipIf(!isSQLiteAvailable() || !fs.existsSync(extensionPath))("bun-sqlite-example", () => {
  let db: Database;
  const testDbPath = path.join(import.meta.dir, "test.db");

  beforeAll(() => {
    // Set the bundled SQLite before any Database instances are created
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
    expect(() => db.loadExtension(extensionPath)).not.toThrow();
    
    // Verify extension is loaded by checking for cr-sqlite functions
    const result = db.query("SELECT crsql_version()").get();
    expect(result).toBeDefined();
  });

  it("should create and query a CRDT table", () => {
    db = new Database(":memory:");
    db.loadExtension(extensionPath);
    
    // Create a regular table
    db.exec("CREATE TABLE todos (id PRIMARY KEY, text TEXT, completed INTEGER)");
    
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
    db.loadExtension(extensionPath);
    
    // Setup CRDT table
    db.exec("CREATE TABLE items (id PRIMARY KEY, value TEXT)");
    db.exec("SELECT crsql_as_crr('items')");
    
    // Insert and update
    db.exec("INSERT INTO items VALUES ('item1', 'initial')");
    db.exec("UPDATE items SET value = 'updated' WHERE id = 'item1'");
    
    // Check changes
    const changes = db.query("SELECT * FROM crsql_changes").all();
    expect(changes.length).toBeGreaterThan(0);
  });
});