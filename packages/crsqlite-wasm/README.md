# @vlcn.io-community/crsqlite-wasm

WASM build of `sqlite` that can:

- run without COEP headers
- run in SharedWorkers
- run concurrently in many tabs
- run in the UI thread if desired
- includes the `crsqlite` extension.

Builds upon https://github.com/rhashimoto/wa-sqlite/. The only delta is that we add our extension at build time and expose a few extra sqlite methods.

## SQLite Version

The SQLite version used in this WASM build is controlled by the `wa-sqlite` submodule in `deps/wa-sqlite`. To update the SQLite version for the WASM build, the SQLite version configuration in the wa-sqlite submodule needs to be updated.

# Examples

- [Observable Notebook](https://observablehq.com/@tantaman/cr-sqlite-basic-setup)
- [Working TODO MVC](https://github.com/vlcn-io/js/tree/main/js/examples/p2p-todomvc)
- [WIP Local-First Presentation Editor](https://github.com/tantaman/strut)
