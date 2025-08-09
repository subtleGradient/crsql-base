Forked from [the original vlcn-io/js project](https://github.com/vlcn-io/js) in order to update dependencies and add support for more environments.


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

## Bun:sqlite

```ts
import { Database } from "bun:sqlite";
import { setCustomSQLite } from "@vlcn.io/bun-sqlite-lib";
import { extensionPath } from "@vlcn.io/crsqlite";

// Required on macOS to use a SQLite build with extension support
// No-op on other platforms
setCustomSQLite();

const db = new Database(":memory:");
db.loadExtension(extensionPath);

// Use cr-sqlite features
db.exec("SELECT crsql_as_crr('my_table')");

// Run queries
const todos = db.query("SELECT * FROM my_table").all();

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

---

|original package|new package? (maybe)|
|-|-|
|@vlcn.io/browser-tests           |@vlcn.io-community/browser-tests|
|@vlcn.io/crsqlite                |@vlcn.io-community/crsqlite|
|@vlcn.io/crsqlite-allinone       |@vlcn.io-community/crsqlite-allinone|
|@vlcn.io/crsqlite-wasm           |@vlcn.io-community/crsqlite-wasm|
|@vlcn.io/direct-connect-browser  |@vlcn.io-community/direct-connect-browser|
|@vlcn.io/direct-connect-common   |@vlcn.io-community/direct-connect-common|
|@vlcn.io/direct-connect-nodejs   |@vlcn.io-community/direct-connect-nodejs|
|@vlcn.io/id                      |@vlcn.io-community/id|
|@vlcn.io/logger-provider         |@vlcn.io-community/logger-provider|
|@vlcn.io/nodeno-tests            |@vlcn.io-community/nodeno-tests|
|@vlcn.io/py-correctness          |@vlcn.io-community/py-correctness|
|@vlcn.io/react                   |@vlcn.io-community/react|
|@vlcn.io/rx-query                |@vlcn.io-community/rx-query|
|@vlcn.io/rx-tbl                  |@vlcn.io-community/rx-tbl|
|@vlcn.io/sync-p2p                |@vlcn.io-community/sync-p2p|
|@vlcn.io/tsbuild-all             |@vlcn.io-community/tsbuild-all|
|@vlcn.io/wa-sqlite               |@vlcn.io-community/wa-sqlite|
|@vlcn.io/ws-browserdb            |@vlcn.io-community/ws-browserdb|
|@vlcn.io/ws-client               |@vlcn.io-community/ws-client|
|@vlcn.io/ws-common               |@vlcn.io-community/ws-common|
|@vlcn.io/ws-demo                 |@vlcn.io-community/ws-demo|
|@vlcn.io/ws-litefs               |@vlcn.io-community/ws-litefs|
|@vlcn.io/ws-server               |@vlcn.io-community/ws-server|
|@vlcn.io/xplat-api               |@vlcn.io-community/xplat-api|
|@vlcn.io/xplat-tests             |@vlcn.io-community/xplat-tests|


|new package|
|-|
|@vlcn.io-community/bun-sqlite-example|
|@vlcn.io-community/bun-sqlite-lib|
|@vlcn.io-community/libsqlite3-darwin-arm64|
|@vlcn.io-community/libsqlite3-darwin-x64|
