// lib/auth.ts
//
// Only knows about hashing the master password and managing the session
// cookie. Has no idea what SQL is (that's repo.ts) and no idea what AES is
// (that's crypto.ts).

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "sv_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
const BCRYPT_COST = 12;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Copy .env.example to .env and generate one."
    );
  }
  return new TextEncoder().encode(secret);
}

// ── Master password hashing (one-way — see design doc) ─────────────────────

export async function hashMasterPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyMasterPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  return bcrypt.compare(password, storedHash);
}

// ── Session cookie (signed JWT, httpOnly) ───────────────────────────────────

export interface SessionPayload {
  userId: string;
  email: string;
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { userId: payload.userId, email: payload.email };
  } catch {
    // Expired, tampered, or signed with an old secret — treat as logged out.
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
