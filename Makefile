git-deps = deps/wa-sqlite deps/emsdk
node-deps = ./packages/crsqlite-wasm/node_modules
wasm-file = ./packages/crsqlite-wasm/dist/crsqlite.wasm
tsbuildinfo = ./tsbuild-all/tsconfig.tsbuildinfo
native-ext = ./node_modules/@vlcn.io/crsqlite/dist/crsqlite.dylib

.EXPORT_ALL_VARIABLES:
	CRSQLITE_NOPREBUILD = 1

all: $(git-deps) $(wasm-file) $(tsbuildinfo) $(native-ext)

$(git-deps):
	@echo "Ensuring git submodules are initialized and up-to-date..."
	@if [ ! -e deps/wa-sqlite/.git ] || [ ! -e deps/emsdk/.git ]; then \
		echo "Initializing git submodules..."; \
		git submodule update --init --recursive; \
	else \
		echo "Checking submodule status..."; \
		git submodule status --recursive | grep -E '^[+-]' && { \
			echo "Submodules are out of sync, updating..."; \
			git submodule update --init --recursive; \
		} || echo "Submodules are up-to-date."; \
	fi
	@echo "Verifying submodules are properly initialized..."
	@[ -e deps/wa-sqlite/.git ] || { echo "ERROR: wa-sqlite submodule not initialized"; exit 1; }
	@[ -e deps/emsdk/.git ] || { echo "ERROR: emsdk submodule not initialized"; exit 1; }
	@echo "✓ All submodules verified and ready"

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
