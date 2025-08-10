import { Config, defaultConfig } from "@vlcn.io-community/ws-client";
import { start } from "@vlcn.io-community/ws-client/worker.js";
import { createDbProvider } from "@vlcn.io-community/ws-browserdb";

export const config: Config = {
  dbProvider: createDbProvider(),
  transportProvider: defaultConfig.transportProvider,
};

start(config);
