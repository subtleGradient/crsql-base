#!bun
import { $, type BunFile, file, sleep, stdout } from "bun";

const makePathsRelative = (html: string) =>
	html.replaceAll('href="/', 'href="./').replaceAll('src="/', 'src="./');

async function buildExpoWeb({ destination }: { destination: BunFile }) {
	console.debug(
		`[buildExpoWeb] Starting Expo web build to: ${destination.name}`,
	);
	if (!(await destination.stat().then((it) => it.isDirectory())))
		throw new Error(
			`Destination directory ${destination.name} must exist, but it does not.`,
		);

	// Set CI env var to prevent interactive prompts and ensure non-interactive mode
	void $`CI=1 bunx --bun expo export --clear --platform web --output-dir ${destination}`;

	const maxTime = 60 * 1000; // 60 seconds
	const startTime = Date.now();
	while (!(await file(`${destination.name}/index.html`).exists())) {
		// console.debug(
		// 	`[buildExpoWeb] Waiting for index.html to be created...`,
		// 	file(`${destination.name}/index.html`).name,
		// );
		await sleep(100);
		if (Date.now() - startTime > maxTime) {
			throw new Error(
				`Expo web build did not produce index.html within ${maxTime / 1000} seconds.`,
			);
		}
	}

	const html = await file(`${destination.name}/index.html`).text();
	await file(`${destination.name}/index.html`).write(makePathsRelative(html));
	console.debug(
		`[buildExpoWeb] Finished Expo web build to: ${destination.name}`,
	);
}

async function buildBunServer({ destination }: { destination: BunFile }) {
	console.debug(
		`[buildBunServer] Starting Bun server build to: ${destination.name}`,
	);
	if (!(await destination.stat().then((it) => it.isDirectory())))
		throw new Error(
			`Destination directory ${destination.name} must exist, but it does not.`,
		);

	const result = await Bun.build({
		define: {
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
		entrypoints: [`${import.meta.dir}/server/src/server.tsx`],
		outdir: destination.name,
		target: "bun",
		conditions: ["react-server"],
		sourcemap: true,
		minify: process.env.NODE_ENV === "production",
	});

	const outputTable = result.outputs.map((output) => ({
		File: output.path.replace(import.meta.dir, "."),
		Size: output.size,
		Type: output.kind,
	}));

	console.table(outputTable);
	console.debug(
		`[buildBunServer] Finished Bun server build to: ${destination.name}`,
	);
}

export const __DEV__ = process.env.NODE_ENV !== "production";

export const expoWebBuildRootPath = __DEV__
	? `${import.meta.dir}/build/expo`
	: `${import.meta.dir}/expo`;

export default main;
async function main() {
	const buildRoot = file(`${import.meta.dir}/build`);
	const expoWebBuildRoot = file(expoWebBuildRootPath);

	await $`rm -rf ${buildRoot}`.nothrow();
	await $`mkdir ${buildRoot}`.nothrow();
	await $`mkdir ${expoWebBuildRoot}`.nothrow();

	console.debug("[main] Starting Expo web build...");
	await buildExpoWeb({ destination: expoWebBuildRoot });
	console.debug("[main] Expo web build complete.");

	console.debug("[main] Starting Bun server build...");
	await buildBunServer({ destination: buildRoot });
	console.debug("[main] Bun server build complete.");

	process.exit(0);
}

if (import.meta.main) await main();
