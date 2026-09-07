import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2] === "start" ? "start" : "dev";
const webPort = process.env.WEB_PORT || "3000";
const apiPort = process.env.API_PORT || "3001";
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const viteBin = path.join(root, "node_modules", "vite", "bin", "vite.js");

const api = spawn(process.execPath, [nextBin, mode, "-p", apiPort], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});

const webArgs = mode === "dev" ? ["--host", "0.0.0.0", "--port", webPort, "--strictPort"] : ["preview", "--host", "0.0.0.0", "--port", webPort, "--strictPort"];
const web = spawn(process.execPath, [viteBin, ...webArgs], {
  cwd: root,
  env: {
    ...process.env,
    VITE_API_TARGET: `http://127.0.0.1:${apiPort}`,
  },
  stdio: "inherit",
});

let stopping = false;
function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  if (!api.killed) api.kill();
  if (!web.killed) web.kill();
  setTimeout(() => process.exit(exitCode), 100);
}

api.on("exit", (code) => stop(code ?? 1));
web.on("exit", (code) => stop(code ?? 1));
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
