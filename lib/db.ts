// lib/db.ts
//
// Owns exactly one thing: opening the database connection and making sure
// the schema exists. It knows nothing about bcrypt, JWTs, or AES — that's
// on purpose (see repo.ts / auth.ts / crypto.ts).
//
// Uses Node's built-in node:sqlite (no native compilation required — this
// matters on Windows, where a native module like better-sqlite3 needs
// Visual Studio's C++ build tools to install).
//
// ── Swapping to Aurora PostgreSQL later ──────────────────────────────────
// This file (and repo.ts, which is the only other file that touches SQL)
// are the *only* two files that need to change to move off local SQLite:
//   1. Swap `node:sqlite` for `pg` (`Pool` from the `pg` package).
//   2. Point it at DATABASE_URL, which will be your Aurora cluster endpoint
//      instead of a local file path.
//   3. Adjust the CREATE TABLE statements below to Postgres syntax.
// Nothing in app/api/** or repo.ts's function signatures needs to change —
// they just call findUserByEmail(), createVaultEntry(), etc.
// ──────────────────────────────────────────────────────────────────────────

import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";

const DB_PATH =
  process.env.DATABASE_URL?.replace(/^file:/, "") ??
  path.join(process.cwd(), "data", "vault.db");

// Make sure the containing directory exists (data/ is gitignored and
// created on first run, same as the original design doc describes).
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// A module-level singleton so we don't reopen the file on every hot-reload
// in dev or on every request in prod.
declare global {
  // eslint-disable-next-line no-var
  var __securevault_db: DatabaseSync | undefined;
}

function createConnection(): DatabaseSync {
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vault_entries (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      site        TEXT NOT NULL,
      username    TEXT NOT NULL,
      iv          TEXT NOT NULL,
      ciphertext  TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT 'Other',
      url         TEXT NOT NULL DEFAULT '',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_vault_entries_user_id
      ON vault_entries(user_id);
  `);

  return db;
}

export const db = globalThis.__securevault_db ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalThis.__securevault_db = db;
}
