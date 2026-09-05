// lib/repo.ts
//
// Typed data-access functions. This file — along with db.ts — is the only
// place SQL lives. It has no idea what bcrypt or AES is; it just moves rows
// in and out of the database. Swap SQLite for Aurora Postgres by rewriting
// db.ts + this file alone; app/api/** never changes.

import { randomUUID } from "crypto";
import { db } from "./db";
import type { Category } from "./types";

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface VaultEntryRow {
  id: string;
  userId: string;
  site: string;
  username: string;
  iv: string;
  ciphertext: string;
  category: string;
  url: string;
  createdAt: string;
}

// ── Users ────────────────────────────────────────────────────────────────

const USER_COLUMNS = `id, email, username, password_hash as passwordHash, created_at as createdAt`;

export function findUserByEmail(email: string): User | undefined {
  const row = db
    .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE email = ?`)
    .get(email.trim().toLowerCase()) as User | undefined;
  return row;
}

export function findUserByUsername(username: string): User | undefined {
  const row = db
    .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE username = ?`)
    .get(username.trim().toLowerCase()) as User | undefined;
  return row;
}

// Login accepts either an email or a username in the same field. One query,
// matches whichever column the identifier looks like it belongs to.
export function findUserByIdentifier(identifier: string): User | undefined {
  const normalized = identifier.trim().toLowerCase();
  const row = db
    .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE email = ? OR username = ?`)
    .get(normalized, normalized) as User | undefined;
  return row;
}

export function findUserById(id: string): User | undefined {
  const row = db
    .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`)
    .get(id) as User | undefined;
  return row;
}

export function createUser(
  email: string,
  username: string,
  passwordHash: string
): User {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?)`
  ).run(id, email.trim().toLowerCase(), username.trim().toLowerCase(), passwordHash);
  return findUserById(id)!;
}

// ── Vault entries ────────────────────────────────────────────────────────

export function listVaultEntries(userId: string): VaultEntryRow[] {
  return db
    .prepare(
      `SELECT id, user_id as userId, site, username, iv, ciphertext,
              category, url, created_at as createdAt
       FROM vault_entries WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(userId) as VaultEntryRow[];
}

export function getOwnedEntry(
  id: string,
  userId: string
): VaultEntryRow | undefined {
  const entry = db
    .prepare(
      `SELECT id, user_id as userId, site, username, iv, ciphertext,
              category, url, created_at as createdAt
       FROM vault_entries WHERE id = ?`
    )
    .get(id) as VaultEntryRow | undefined;

  if (!entry || entry.userId !== userId) return undefined;
  return entry;
}

export function createVaultEntry(params: {
  userId: string;
  site: string;
  username: string;
  iv: string;
  ciphertext: string;
  category: Category;
  url: string;
}): VaultEntryRow {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO vault_entries (id, user_id, site, username, iv, ciphertext, category, url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    params.userId,
    params.site,
    params.username,
    params.iv,
    params.ciphertext,
    params.category,
    params.url
  );
  return getOwnedEntry(id, params.userId)!;
}

export function updateVaultEntry(
  id: string,
  userId: string,
  params: Partial<{
    site: string;
    username: string;
    iv: string;
    ciphertext: string;
    category: Category;
    url: string;
  }>
): VaultEntryRow | undefined {
  const existing = getOwnedEntry(id, userId);
  if (!existing) return undefined;

  const merged = { ...existing, ...params };
  db.prepare(
    `UPDATE vault_entries
     SET site = ?, username = ?, iv = ?, ciphertext = ?, category = ?, url = ?
     WHERE id = ? AND user_id = ?`
  ).run(
    merged.site,
    merged.username,
    merged.iv,
    merged.ciphertext,
    merged.category,
    merged.url,
    id,
    userId
  );
  return getOwnedEntry(id, userId);
}

export function deleteVaultEntry(id: string, userId: string): boolean {
  const existing = getOwnedEntry(id, userId);
  if (!existing) return false;

  const result = db
    .prepare(`DELETE FROM vault_entries WHERE id = ? AND user_id = ?`)
    .run(id, userId);
  return result.changes > 0;
}
