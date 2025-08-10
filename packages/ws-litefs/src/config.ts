import { Config } from "@vlcn.io-community/ws-server";
import path from "path";

export function litefsPrimaryPath(config: Config) {
  return path.normalize(path.join(config.dbFolder!, ".primary"));
}
