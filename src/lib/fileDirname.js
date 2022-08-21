import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export default function fileDirname(importMetaURL) {
  const __filename = fileURLToPath(importMetaURL);
  const __dirname = dirname(__filename);
  return __dirname;
}
