// setup-all.js
// Orchestrator only — runs each per-concern setup script in order.
// Lives in setup/ alongside the other four scripts, and writes files into
// the project root (one directory up), not into setup/ itself.
//
//   setup-lib.js        -> lib/ (db, repo, auth, crypto)
//   setup-api-auth.js   -> app/api/auth/**
//   setup-api-vault.js  -> app/api/vault/**
//   setup-frontend.js   -> login/register pages + VaultClient
//
// Run with:  node setup-all.js   (from inside setup/)
// or:        node setup/setup-all.js   (from the project root)
// Either works — it locates its sibling scripts via __dirname, not cwd.

const path = require("path");
const { execFileSync } = require("child_process");

const scripts = [
  "setup-lib.js",
  "setup-api-auth.js",
  "setup-api-vault.js",
  "setup-frontend.js",
];

for (const script of scripts) {
  console.log(`\n--- ${script} ---`);
  execFileSync(process.execPath, [path.join(__dirname, script)], { stdio: "inherit" });
}

console.log("\nAll done.");
