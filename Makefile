git-deps = deps/wa-sqlite deps/emsdk
node-deps = ./packages/crsqlite-wasm/node_modules
wasm-file = ./packages/crsqlite-wasm/dist/crsqlite.wasm
tsbuildinfo = ./tsbuild-all/tsconfig.tsbuildinfo
native-ext = ./node_modules/@vlcn.io/crsqlite/dist/crsqlite.dylib

.EXPORT_ALL_VARIABLES:
	CRSQLITE_NOPREBUILD = 1

all: $(git-deps) $(wasm-file) $(tsbuildinfo) $(native-ext)

$(git-deps):
	git submodule update --init --recursive

$(node-deps): $(git-deps)
	bun install

$(wasm-file): $(git-deps)
	./build-wasm.sh

$(tsbuildinfo): $(node-deps) $(wasm-file) FORCE
	cd tsbuild-all && bun run build

$(native-ext): $(node-deps) FORCE
	cd node_modules/@vlcn.io/crsqlite && make loadable

test-all: $(tsbuildinfo) $(wasm-file) $(native-ext) FORCE
	./test.sh

test: test-all

clean:
	git clean -xfd
	git submodule foreach --recursive git clean -xfd

FORCE:

.PHONY: all test test-all clean
