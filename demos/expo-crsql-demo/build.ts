#!bun
import { $, type BunFile, file } from "bun";

const makePathsRelative = (html: string) =>
	html.replaceAll('href="/', 'href="./').replaceAll('src="/', 'src="./');

async function buildExpoWeb({ destination }: { destination: BunFile }) {
	if (!(await destination.stat().then((it) => it.isDirectory())))
		throw new Error(
			`Destination directory ${destination.name} must exist, but it does not.`,
		);

	const minifyFlag = process.env.NODE_ENV === "production" ? "" : "--no-minify";
	await $`expo export --platform web --output-dir ${destination} ${minifyFlag} --no-bytecode --dump-assetmap`;

	const expoWebIndex = file(`${destination.name}/index.html`);

	const html = await expoWebIndex.text();
	await expoWebIndex.write(makePathsRelative(html));
}

async function buildBunServer({ destination }: { destination: BunFile }) {
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

	await buildExpoWeb({ destination: expoWebBuildRoot });
	await buildBunServer({ destination: buildRoot });
}

if (import.meta.main) await main();
