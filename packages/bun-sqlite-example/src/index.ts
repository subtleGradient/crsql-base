import { Database } from "bun:sqlite";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

Database.setCustomSQLite('')

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the cr-sqlite extension
const extensionPath = join(__dirname, "../../../node_modules/@vlcn.io/crsqlite/dist/crsqlite.dylib");

console.log("🚀 Bun SQLite + CR-SQLite Example\n");

// Create two database instances to simulate two peers
const db1 = new Database(":memory:");
const db2 = new Database(":memory:");

// Load cr-sqlite extension on both databases
db1.loadExtension(extensionPath);
db2.loadExtension(extensionPath);

// Initialize cr-sqlite on both databases
db1.exec("SELECT crsql_as_crr('todos')");
db2.exec("SELECT crsql_as_crr('todos')");

// Create a todos table on both databases
const createTable = `
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    title TEXT,
    completed INTEGER DEFAULT 0
  )
`;

db1.exec(createTable);
db2.exec(createTable);

// Get site IDs for each database
const siteId1 = db1.query("SELECT crsql_site_id()").get() as { "crsql_site_id()": Uint8Array };
const siteId2 = db2.query("SELECT crsql_site_id()").get() as { "crsql_site_id()": Uint8Array };

console.log("📍 Database 1 Site ID:", Buffer.from(siteId1["crsql_site_id()"]).toString('hex').slice(0, 8));
console.log("📍 Database 2 Site ID:", Buffer.from(siteId2["crsql_site_id()"]).toString('hex').slice(0, 8));
console.log();

// Add some todos to database 1
console.log("➕ Adding todos to Database 1...");
db1.query("INSERT INTO todos (id, title, completed) VALUES (?, ?, ?)").run("1", "Learn Bun", 1);
db1.query("INSERT INTO todos (id, title, completed) VALUES (?, ?, ?)").run("2", "Try CR-SQLite", 0);
db1.query("INSERT INTO todos (id, title, completed) VALUES (?, ?, ?)").run("3", "Build something cool", 0);

// Show todos in database 1
console.log("\n📋 Todos in Database 1:");
const todos1 = db1.query("SELECT * FROM todos").all();
todos1.forEach((todo: any) => {
  console.log(`  [${todo.completed ? '✓' : ' '}] ${todo.title}`);
});

// Show todos in database 2 (should be empty)
console.log("\n📋 Todos in Database 2 (before sync):");
const todos2Before = db2.query("SELECT * FROM todos").all();
console.log(`  ${todos2Before.length === 0 ? "(empty)" : todos2Before}`);

// Sync changes from database 1 to database 2
console.log("\n🔄 Syncing changes from Database 1 to Database 2...");

// Get changes from database 1
const changes = db1.query(`
  SELECT "table", "pk", "cid", "val", "col_version", "db_version", "site_id", "cl", "seq"
  FROM crsql_changes
`).all();

console.log(`  Found ${changes.length} changes to sync`);

// Apply changes to database 2
const applyStmt = db2.prepare(`
  INSERT INTO crsql_changes 
  ("table", "pk", "cid", "val", "col_version", "db_version", "site_id", "cl", "seq")
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

changes.forEach((change: any) => {
  applyStmt.run(
    change.table,
    change.pk,
    change.cid,
    change.val,
    change.col_version,
    change.db_version,
    change.site_id,
    change.cl,
    change.seq
  );
});

// Show todos in database 2 after sync
console.log("\n📋 Todos in Database 2 (after sync):");
const todos2After = db2.query("SELECT * FROM todos").all();
todos2After.forEach((todo: any) => {
  console.log(`  [${todo.completed ? '✓' : ' '}] ${todo.title}`);
});

// Update a todo in database 2
console.log("\n✏️  Updating todo in Database 2 (marking 'Try CR-SQLite' as completed)...");
db2.query("UPDATE todos SET completed = 1 WHERE id = ?").run("2");

// Sync back to database 1
console.log("\n🔄 Syncing changes from Database 2 back to Database 1...");

// Get new changes from database 2
const changesBack = db2.query(`
  SELECT "table", "pk", "cid", "val", "col_version", "db_version", "site_id", "cl", "seq"
  FROM crsql_changes
  WHERE db_version > 0
`).all();

console.log(`  Found ${changesBack.length} changes to sync back`);

// Apply changes to database 1
const applyBackStmt = db1.prepare(`
  INSERT INTO crsql_changes 
  ("table", "pk", "cid", "val", "col_version", "db_version", "site_id", "cl", "seq")
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

changesBack.forEach((change: any) => {
  applyBackStmt.run(
    change.table,
    change.pk,
    change.cid,
    change.val,
    change.col_version,
    change.db_version,
    change.site_id,
    change.cl,
    change.seq
  );
});

// Show final state in both databases
console.log("\n📋 Final state - Database 1:");
const finalTodos1 = db1.query("SELECT * FROM todos").all();
finalTodos1.forEach((todo: any) => {
  console.log(`  [${todo.completed ? '✓' : ' '}] ${todo.title}`);
});

console.log("\n📋 Final state - Database 2:");
const finalTodos2 = db2.query("SELECT * FROM todos").all();
finalTodos2.forEach((todo: any) => {
  console.log(`  [${todo.completed ? '✓' : ' '}] ${todo.title}`);
});

// Demonstrate conflict resolution
console.log("\n⚔️  Demonstrating conflict resolution...");

// Both databases update the same todo
db1.query("UPDATE todos SET title = ? WHERE id = ?").run("Build something AWESOME", "3");
db2.query("UPDATE todos SET title = ? WHERE id = ?").run("Build something AMAZING", "3");

// Get the conflicting changes
const conflict1 = db1.query(`
  SELECT "table", "pk", "cid", "val", "col_version", "db_version", "site_id", "cl", "seq"
  FROM crsql_changes
  WHERE "table" = 'todos' AND pk = x'0133'
  ORDER BY db_version DESC LIMIT 1
`).get();

const conflict2 = db2.query(`
  SELECT "table", "pk", "cid", "val", "col_version", "db_version", "site_id", "cl", "seq"
  FROM crsql_changes
  WHERE "table" = 'todos' AND pk = x'0133'
  ORDER BY db_version DESC LIMIT 1
`).get();

console.log("  Database 1 change:", (conflict1 as any)?.val);
console.log("  Database 2 change:", (conflict2 as any)?.val);

// Apply both changes (CR-SQLite will use Last-Write-Wins)
if (conflict1) {
  applyStmt.run(
    (conflict1 as any).table,
    (conflict1 as any).pk,
    (conflict1 as any).cid,
    (conflict1 as any).val,
    (conflict1 as any).col_version,
    (conflict1 as any).db_version,
    (conflict1 as any).site_id,
    (conflict1 as any).cl,
    (conflict1 as any).seq
  );
}

if (conflict2) {
  applyBackStmt.run(
    (conflict2 as any).table,
    (conflict2 as any).pk,
    (conflict2 as any).cid,
    (conflict2 as any).val,
    (conflict2 as any).col_version,
    (conflict2 as any).db_version,
    (conflict2 as any).site_id,
    (conflict2 as any).cl,
    (conflict2 as any).seq
  );
}

console.log("\n📋 After conflict resolution:");
console.log("  Database 1:", db1.query("SELECT title FROM todos WHERE id = ?").get("3"));
console.log("  Database 2:", db2.query("SELECT title FROM todos WHERE id = ?").get("3"));

// Clean up
db1.close();
db2.close();

console.log("\n✅ Example completed successfully!");