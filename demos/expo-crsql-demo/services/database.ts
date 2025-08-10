import {open} from '@op-engineering/op-sqlite';
import type {DB} from '@op-engineering/op-sqlite';

let db: DB | null = null;

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  created_at: number;
  updated_at: number;
}

export const initDatabase = async (): Promise<DB> => {
  if (db) return db;
  
  try {
    // Open database with cr-sqlite extension
    db = open({
      name: 'crsqlite-demo.db',
      location: 'default',
    });
    
    // Load cr-sqlite extension
    await db.loadExtension('crsqlite');
    
    // Create tables
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
    
    // Make table a CRDT
    await db.executeAsync(`SELECT crsql_as_crr('todos');`);
    
    console.debug('Database initialized with cr-sqlite');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const getDatabase = (): DB => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

export const getSiteId = async (): Promise<string> => {
  const result = await getDatabase().executeAsync('SELECT crsql_site_id() as site_id');
  return result.rows?._array[0]?.site_id || 'unknown';
};

export const getDbVersion = async (): Promise<number> => {
  const result = await getDatabase().executeAsync('SELECT crsql_db_version() as version');
  return result.rows?._array[0]?.version || 0;
};

// Todo CRUD operations
export const addTodo = async (text: string): Promise<string> => {
  const id = `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await getDatabase().executeAsync(
    'INSERT INTO todos (id, text) VALUES (?, ?)',
    [id, text]
  );
  return id;
};

export const getTodos = async (): Promise<Todo[]> => {
  const result = await getDatabase().executeAsync('SELECT * FROM todos ORDER BY created_at DESC');
  return result.rows?._array || [];
};

export const toggleTodo = async (id: string): Promise<void> => {
  await getDatabase().executeAsync(
    `UPDATE todos SET completed = NOT completed, updated_at = strftime('%s', 'now') WHERE id = ?`,
    [id]
  );
};

export const deleteTodo = async (id: string): Promise<void> => {
  await getDatabase().executeAsync('DELETE FROM todos WHERE id = ?', [id]);
};

// Sync operations
export const getChanges = async (sinceVersion: number = 0): Promise<any[]> => {
  const result = await getDatabase().executeAsync(
    `SELECT * FROM crsql_changes WHERE db_version > ?`,
    [sinceVersion]
  );
  return result.rows?._array || [];
};

export const applyChanges = async (changes: any[]): Promise<void> => {
  const db = getDatabase();
  await db.transaction(async (tx) => {
    for (const change of changes) {
      await tx.executeAsync(
        `INSERT INTO crsql_changes (
          "table", pk, cid, val, col_version, db_version, site_id, cl, seq
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          change.table,
          change.pk,
          change.cid,
          change.val,
          change.col_version,
          change.db_version,
          change.site_id,
          change.cl,
          change.seq
        ]
      );
    }
  });
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close();
    db = null;
  }
};