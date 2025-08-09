import { setBundledSQLite, getSQLitePath, isSQLiteAvailable } from './dist/index.js';
import { Database } from 'bun:sqlite';

console.log('🧪 Testing bun-sqlite-lib...\n');

// Check if SQLite is available
console.log('Checking SQLite availability:', isSQLiteAvailable() ? '✅' : '❌');
console.log('SQLite path:', getSQLitePath());

// Set the bundled SQLite
console.log('\nSetting bundled SQLite...');
const dylibPath = setBundledSQLite();
console.log('Set to:', dylibPath);

// Test with Bun's Database
console.log('\n📊 Testing with bun:sqlite...');
const db = new Database(':memory:');

// Check version
const versionResult = db.query('SELECT sqlite_version() as version').get() as { version: string };
console.log('SQLite version:', versionResult.version);

// Test extension loading capability
console.log('\n🔌 Testing extension loading...');
try {
  // Try to load the CR-SQLite extension
  const crsqlitePath = '/Users/tom/Developer/cr-sqlite-js/node_modules/@vlcn.io/crsqlite/dist/crsqlite.dylib';
  db.loadExtension(crsqlitePath);
  console.log('✅ CR-SQLite extension loaded successfully!');
  
  // Test CR-SQLite functionality
  db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY NOT NULL, name TEXT)');
  db.exec("SELECT crsql_as_crr('test')");
  
  const siteId = db.query('SELECT crsql_site_id()').get();
  console.log('✅ CR-SQLite is working! Site ID:', siteId);
} catch (error) {
  console.log('⚠️  Extension loading test:', (error as Error).message);
  console.log('   (This is expected if the extension file doesn\'t exist)');
}

db.close();
console.log('\n✅ All tests completed!');