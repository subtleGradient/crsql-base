# crsqlite-js

JavaScript packages to use `cr-sqlite` in the browser, node, react and other JS frameworks & environments.

# Quickstart

Scaffolding a new project -- https://github.com/vlcn-io/vite-starter/tree/main

Example apps:

- [Vite Starter over WebSocket](https://github.com/vlcn-io/vite-starter)
- [Manual REST sync Example](https://github.com/vlcn-io/example-rest)
- https://github.com/vlcn-io/live-examples
- [Observable Notebook](https://observablehq.com/@tantaman/cr-sqlite-basic-setup)
- [WIP Local-First Presentation Editor](https://github.com/tantaman/strut)

[Video overview](https://www.youtube.com/watch?v=T1ES9x8DKR4)

## Browser

```ts
import initWasm from "@vlcn.io/crsqlite-wasm";
import wasmUrl from "@vlcn.io/crsqlite-wasm/crsqlite.wasm?url";

const crsqlite = await initWasm(wasmUrl);
const db = await sqlite.open("db-name");

...

db.close();
```

## NodeJS

```ts
import Database from "better-sqlite3";

const db = new Database(":memory:");
import { extensionPath } from "@vlcn.io/crsqlite";
db.loadExtension(extensionPath);

...

db.close();
```

## React

```ts
function TodoList() {
  const allTodos: readonly Todo[] = useQuery<Todo>(
    ctx,
    "SELECT * FROM todo ORDER BY id DESC"
  ).data;

  return (
    <div>
      {allTodos.map((t) => (
        <Todo item={t} />
      ))}
    </div>
  );
}
```

## Sync

See official docs or the `vite-starter`

# Packages

## Core Storage

- **@vlcn.io/crsqlite-allinone** (`node-allinone`) - CR-SQLite loadable extension with bundled SQLite for Node.js/Deno
- **@vlcn.io/crsqlite-wasm** - WASM build of CR-SQLite & SQLite for browser environments
- **@vlcn.io/bun-sqlite-lib** - SQLite library loader for Bun with extension support
- **@vlcn.io/libsqlite3-darwin-arm64** - Prebuilt SQLite 3.47.2 for macOS ARM64 (Node.js/Bun)
- **@vlcn.io/libsqlite3-darwin-x64** - Prebuilt SQLite 3.47.2 for macOS x64 (Node.js/Bun)

## Sync & Networking

### WebSocket
- **@vlcn.io/ws-client** - WebSocket client for browser-to-server database sync (Browser)
- **@vlcn.io/ws-server** - WebSocket sync server implementation (Node.js)
- **@vlcn.io/ws-common** - Shared WebSocket protocol code (Node.js/Browser)
- **@vlcn.io/ws-browserdb** - Browser database interface for WebSocket sync (Browser)
- **@vlcn.io/ws-litefs** - LiteFS integration for WebSocket sync (Node.js)
- **@vlcn.io/ws-demo** - WebSocket sync demo application (Browser/React)

### Direct Connection
- **@vlcn.io/direct-connect-browser** - Direct connection sync for browser (Browser)
- **@vlcn.io/direct-connect-nodejs** - Direct connection sync for Node.js (Node.js)
- **@vlcn.io/direct-connect-common** - Shared direct connection code (Node.js/Browser)

### P2P
- **@vlcn.io/sync-p2p** - Peer-to-peer sync implementation using WebRTC (Browser)

## UI Integration

- **@vlcn.io/react** - React hooks for reactive database queries (React)
- **@vlcn.io/rx-query** - Query AST and reactive query infrastructure (Browser/Node.js)
- **@vlcn.io/rx-tbl** - Simple table-based reactivity (Browser/Node.js)

## Cross-Platform & Utilities

- **@vlcn.io/xplat-api** - Cross-platform SQLite API for browser and Node.js environments
- **@vlcn.io/id** - ID generation utilities (Browser/Node.js)
- **@vlcn.io/logger-provider** - Logging infrastructure (Browser/Node.js)

## Testing

- **@vlcn.io/browser-tests** - Browser-specific test suite using Cypress (Browser)
- **@vlcn.io/nodeno-tests** - Node.js specific test suite (Node.js)
- **@vlcn.io/xplat-tests** - Cross-platform test suite (Node.js/Browser)

## Examples & Development

- **@vlcn.io/bun-sqlite-example** - Example using CR-SQLite with Bun runtime (Bun)
- **@vlcn.io/tsbuild-all** - Build orchestration for all TypeScript packages (Development)
- **sandbox** - Playground for bug reproductions (Browser/React)
- **sandbox-node** - Node.js playground for testing (Node.js)

# Contributing

If you want to build these projects from source and/or hack on them or contribute, you'll need to clone the workspace repository:

```bash
git clone --recurse-submodules git@github.com:vlcn-io/workspace.git
```

Running `make` in that directory will get you set up. Ensure you have the rust nightly toolchain installed and activated before running make.

