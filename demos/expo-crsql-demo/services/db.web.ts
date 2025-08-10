import initWasm from "@vlcn.io-community/crsqlite-wasm";
import wasmUrl from "@vlcn.io-community/crsqlite-wasm/crsqlite.wasm";
import { use } from "react";

let sqlite3: Awaited<ReturnType<typeof initWasm>> | null = null;
let initPromise: Promise<void> | null = null;
let dbInstances = new Map<string, Promise<any>>();

// DB interface that matches op-sqlite's interface
export interface DB {
	execute(sql: string, params?: unknown[]): Promise<{ rows: any[] }>;
	transaction<T>(fn: (tx: DB) => Promise<T>): Promise<T>;
	close(): void;
}

// For React 19 - Suspense-based DB that can use React.use()
export class SuspenseDB implements DB {
	constructor(private dbPromise: Promise<any>) {}
	
	// This can be called with React.use() in components
	getDbPromise() {
		return this.dbPromise;
	}

	async execute(sql: string, params?: unknown[]): Promise<{ rows: any[] }> {
		const db = await this.dbPromise;
		const result = await db.execO(sql, params || []);
		return { rows: result };
	}

	async transaction<T>(fn: (tx: DB) => Promise<T>): Promise<T> {
		const db = await this.dbPromise;
		return await db.tx(async (innerTx: any) => {
			const txWrapper: DB = {
				execute: async (sql: string, params?: unknown[]) => {
					const result = await innerTx.execO(sql, params || []);
					return { rows: result };
				},
				transaction: async (innerFn) => {
					// Nested transactions just execute in the same transaction
					return innerFn(txWrapper);
				},
				close: () => {
					// No-op for transaction
				},
			};
			return fn(txWrapper);
		});
	}

	async close(): Promise<void> {
		const db = await this.dbPromise;
		db.close();
	}
}

export async function ensureInitialized(): Promise<void> {
	if (sqlite3) return;

	if (!initPromise) {
		initPromise = initWasm((file) => {
			// Provide the WASM URL directly, avoiding import.meta
			if (file === "crsqlite.wasm") {
				return wasmUrl;
			}
			return file;
		}).then((s) => {
			sqlite3 = s;
			console.debug("SQLite WASM initialized");
		});
	}

	await initPromise;
}

export function open(options: { name: string; location?: string }): DB {
	// Return cached instance if exists
	if (dbInstances.has(options.name)) {
		return new SuspenseDB(dbInstances.get(options.name)!);
	}

	// Create new db promise that includes initialization
	const dbPromise = ensureInitialized().then(() => {
		if (!sqlite3) {
			throw new Error("Failed to initialize SQLite WASM");
		}
		return sqlite3.open(options.name);
	});

	dbInstances.set(options.name, dbPromise);
	return new SuspenseDB(dbPromise);
}

// Start initialization on module load
if (typeof window !== "undefined") {
	ensureInitialized();
}

export type { DB };
