import { use, useMemo } from "react";
import { initDatabase } from "@/services/database";
import type { DB } from "@/services/db";
import * as dbModule from "@/services/db";

// Singleton promise for database initialization
let dbInitPromise: Promise<DB> | null = null;

function getDbInitPromise(): Promise<DB> {
	if (!dbInitPromise) {
		dbInitPromise = initDatabase();
	}
	return dbInitPromise;
}

/**
 * React 19 Suspense-based database hook
 * Use this inside a Suspense boundary
 */
export function useDatabaseSuspense() {
	// This will suspend until the database is ready
	const db = use(getDbInitPromise());

	return {
		db,
		// Site ID and version can be fetched directly from the resolved db
		getSiteId: async () => {
			const result = await db.execute(
				"SELECT quote(crsql_site_id()) as site_id",
			);
			return result.rows[0]?.site_id?.replace(/'/g, "") || "unknown";
		},
		getDbVersion: async () => {
			const result = await db.execute("SELECT crsql_db_version() as version");
			return result.rows[0]?.version || 0;
		},
	};
}
