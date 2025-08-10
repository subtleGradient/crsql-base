import initWasm, { DB as WasmDB } from "@vlcn.io-community/crsqlite-wasm";
import wasmUrl from "@vlcn.io-community/crsqlite-wasm/crsqlite.wasm";

let sqlite3: Awaited<ReturnType<typeof initWasm>> | null = null;

// DB interface that matches op-sqlite's interface
export interface DB {
	execute(sql: string, params?: unknown[]): Promise<{ rows: any[] }>;
	transaction<T>(fn: (tx: DB) => Promise<T>): Promise<T>;
	close(): void;
}

class WebDB implements DB {
	constructor(private db: WasmDB) {}

	async execute(sql: string, params?: unknown[]): Promise<{ rows: any[] }> {
		const result = await this.db.execA(sql, params);
		return { rows: result };
	}

	async transaction<T>(fn: (tx: DB) => Promise<T>): Promise<T> {
		return await this.db.tx(async (innerTx) => {
			const txWrapper: DB = {
				execute: async (sql: string, params?: unknown[]) => {
					const result = await innerTx.execA(sql, params);
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

	close(): void {
		this.db.close();
	}
}

export function open(options: { name: string; location?: string }): DB {
	if (!sqlite3) {
		throw new Error(
			"SQLite WASM not initialized. Please wait for initialization.",
		);
	}

	const wasmDb = sqlite3.open(options.name);
	return new WebDB(wasmDb);
}

// Initialize WASM on module load
if (typeof window !== "undefined") {
	initWasm((file) => {
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

export type { DB };
