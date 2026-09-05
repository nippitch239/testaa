// lib/crypto.ts
//
// Only knows about encryption. Doesn't touch the database or sessions.
// Vault passwords must be recoverable (the user needs to view/copy them),
// so they're encrypted with AES-256-CBC rather than hashed — see the
// design doc's "core security idea" section for why this differs from how
// the master password is handled.

import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // bytes — AES block size

function getKey(): Buffer {
  const hex = process.env.VAULT_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY is not set. Copy .env.example to .env and generate one."
    );
  }
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY must be 32 bytes (64 hex characters) for AES-256."
    );
  }
  return key;
}

export interface EncryptedPayload {
  iv: string; // hex-encoded, stored alongside the ciphertext — not secret
  ciphertext: string; // hex-encoded
}

// A fresh random IV every call — reusing an IV with the same key across
// two different vault passwords would leak that their first blocks are
// related (see design doc).
export function encryptVaultPassword(plaintext: string): EncryptedPayload {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return { iv: iv.toString("hex"), ciphertext: ciphertext.toString("hex") };
}

export function decryptVaultPassword(payload: EncryptedPayload): string {
  const iv = Buffer.from(payload.iv, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "hex")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
