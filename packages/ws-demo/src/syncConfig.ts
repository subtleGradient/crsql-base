import { Config, defaultConfig } from "@vlcn.io-community/ws-client";
import { createDbProvider } from "@vlcn.io-community/ws-browserdb";
import wasmUrl from "@vlcn.io-community/crsqlite-wasm/crsqlite.wasm?url";

export const config: Config = {
  dbProvider: createDbProvider(wasmUrl),
  transportProvider: defaultConfig.transportProvider,
};
