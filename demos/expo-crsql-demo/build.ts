#!bun
import { $, type BunFile, file } from "bun";

const makePathsRelative = (html: string) =>
	html.replaceAll('href="/', 'href="./').replaceAll('src="/', 'src="./');

async function buildExpoWeb({ distFolder }: { distFolder: BunFile }) {
	if (await distFolder.exists()) await $`rm -rf ${distFolder}`.nothrow();

	await $`expo export --platform web --output-dir dist --no-minify --no-bytecode --dump-assetmap`;

	const expoWebIndex = file(`${distFolder.name}/index.html`);

	const html = await expoWebIndex.text();
	await expoWebIndex.write(makePathsRelative(html));
}

async function main() {
	const distFolder = file(`${import.meta.dir}/dist`);

	await buildExpoWeb({ distFolder });
}

if (import.meta.main) await main();
