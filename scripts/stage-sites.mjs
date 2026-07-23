import { copyFileSync, existsSync, mkdirSync } from "node:fs";

if (!existsSync("dist/server/index.mjs")) {
  throw new Error("vinext server entrypoint was not generated.");
}

copyFileSync("dist/server/index.mjs", "dist/server/index.js");
mkdirSync("dist/.openai", { recursive: true });
copyFileSync(".openai/hosting.json", "dist/.openai/hosting.json");
