import { serve } from "bun";
import { expoWebBuildRootPath } from "../../build";
import index from "./index.html";

const expo = {
	async GET(request) {
		try {
			const url = new URL(request.url);
			const filePath = url.pathname.replace(/^[/.]+/, ""); // Remove leading slashes or dots
			const fsPath = `${expoWebBuildRootPath}/${filePath || "index.html"}`;

			const file = Bun.file(fsPath);
			if (!(await file.exists())) {
				console.warn(404, fsPath);
				return new Response("File not found", { status: 404 });
			}
			return new Response(file);
		} catch (cause) {
			console.error(request, cause);
			return new Response("Unknown error", { status: 500 });
		}
	},
} as const satisfies Bun.RouterTypes.RouteValueWithWebSocketUpgrade<"/*">;

const server = serve({
	routes: {
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
