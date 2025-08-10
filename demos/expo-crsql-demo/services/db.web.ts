export type { DB } from "@op-engineering/op-sqlite";
export function open() {
	throw new Error(
		"Database operations are not supported in web environment yet",
	);
}
