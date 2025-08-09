#!bun
import { $, type BunFile, file } from "bun";

const makePathsRelative = (html: string) =>
	html.replaceAll('href="/', 'href="./').replaceAll('src="/', 'src="./');

async function buildExpoWeb({ destination }: { destination: BunFile }) {
	if (await destination.exists()) await $`rm -rf ${destination}`.nothrow();

	await $`expo export --platform web --output-dir ${destination} --no-minify --no-bytecode --dump-assetmap`;

	const expoWebIndex = file(`${destination.name}/index.html`);

	const html = await expoWebIndex.text();
	await expoWebIndex.write(makePathsRelative(html));
}

async function buildBunServer({ destination }: { destination: BunFile }) {
	if (await destination.exists()) await $`rm -rf ${destination}`.nothrow();
	const result = await Bun.build({
		define: {
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
		entrypoints: [`${import.meta.dir}/server/src/server.tsx`],
		outdir: destination.name,
		target: "bun",
		conditions: ["react-server"],
		sourcemap: true,
		minify: false,
	});

	const outputTable = result.outputs.map((output) => ({
		File: output.path.replace(import.meta.dir, "."),
		Size: output.size,
		Type: output.kind,
	}));

	console.table(outputTable);
}

async function main() {
	await buildExpoWeb({
		destination: file(`${import.meta.dir}/server/src/.expo-web-build`),
	});
	// await buildBunServer({ destination: file(`${import.meta.dir}/build/`) });
}

if (import.meta.main) await main();
