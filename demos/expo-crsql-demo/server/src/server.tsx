import { serve } from "bun";
import * as path from "path";
import { expoWebBuildRootPath } from "../../build";
import index from "./index.html";

if (
	!(await Bun.file(expoWebBuildRootPath)
		.stat()
		.then((it) => it.isDirectory()))
)
	throw new Error(`DEFECT: Expo web build root must exist, but it does not`, {
		cause: expoWebBuildRootPath,
	});

const expo = {
	async GET(request) {
		try {
			const url = new URL(request.url);
			let filePath = decodeURIComponent(url.pathname);

			// Remove leading slash and default to index.html
			if (filePath === "/" || !filePath) {
				filePath = "index.html";
			} else {
				filePath = filePath.replace(/^\/+/, "");
			}

			// Resolve and normalize the path
			const fsPath = path.resolve(expoWebBuildRootPath, filePath);

			// Prevent path traversal: ensure fsPath is within expoWebBuildRootPath
			if (!fsPath.startsWith(path.resolve(expoWebBuildRootPath))) {
				console.warn("Path traversal attempt:", fsPath);
				return new Response("Forbidden", { status: 403 });
			}

			const file = Bun.file(fsPath);
			if (!(await file.exists())) {
				console.debug(
					`[404] File not found: ${filePath}, responding with index.html`,
				);
				return new Response(
					Bun.file(path.resolve(expoWebBuildRootPath, "index.html")),
				);
			}
			return new Response(file);
		} catch (cause) {
			// Log only essential request information, not the entire request object
			console.error(`[500] Server error - Path: ${request.url}`, {
				method: request.method,
				// NOTE: don't leak server errors to the client
				// DO NOT DO THIS: error: cause instanceof Error ? cause.message : "Unknown error",
			});
			return new Response("Internal Server Error", { status: 500 });
		}
	},
} as const satisfies Bun.RouterTypes.RouteValueWithWebSocketUpgrade<"/*">;

const server = serve({
	routes: {
		// Health check endpoint for Docker
		"/up": {
			GET: () => new Response("OK", { status: 200 }),
		},

		// Serve index.html for all unmatched routes.
		"/flarm": index,

		"/*": expo,

		"/api/hello": {
			async GET(req) {
				return Response.json({
					message: "Hello, world!",
					method: "GET",
				});
			},
			async PUT(req) {
				return Response.json({
					message: "Hello, world!",
					method: "PUT",
				});
			},
		},

		"/api/hello/:name": async (req) => {
			const name = req.params.name;
			return Response.json({
				message: `Hello, ${name}!`,
			});
		},
	},

	development: process.env.NODE_ENV !== "production" && {
		// Enable browser hot reloading in development
		hmr: true,

		// Echo console logs from the browser to the server
		console: true,
	},
});

console.log(`🚀 Server running at ${server.url}`);
