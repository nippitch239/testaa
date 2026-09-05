import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOwnedEntry, updateVaultEntry, deleteVaultEntry } from "@/lib/repo";
import { encryptVaultPassword, decryptVaultPassword } from "@/lib/crypto";
import { CATEGORIES, type Category } from "@/lib/types";

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as string[]).includes(value);
}

type Params = { params: Promise<{ id: string }> };

// GET /api/vault/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  // getOwnedEntry checks entry.userId === session.userId before returning
  // anything, so one user can never fetch another user's entry by id.
  const row = getOwnedEntry(id, session.userId);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    entry: {
      id: row.id,
      site: row.site,
      username: row.username,
      password: decryptVaultPassword({ iv: row.iv, ciphertext: row.ciphertext }),
      category: row.category,
      url: row.url,
      createdAt: row.createdAt,
    },
  });
}

// PUT /api/vault/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  let body: {
    site?: string;
    username?: string;
    password?: string;
    category?: string;
    url?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const updates: Parameters<typeof updateVaultEntry>[2] = {};
  if (body.site !== undefined) updates.site = body.site;
  if (body.username !== undefined) updates.username = body.username;
  if (body.url !== undefined) updates.url = body.url;
  if (isCategory(body.category)) updates.category = body.category;
  if (body.password !== undefined) {
    const { iv, ciphertext } = encryptVaultPassword(body.password);
    updates.iv = iv;
    updates.ciphertext = ciphertext;
  }

  const updated = updateVaultEntry(id, session.userId, updates);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    entry: {
      id: updated.id,
      site: updated.site,
      username: updated.username,
      password:
        body.password ??
        decryptVaultPassword({ iv: updated.iv, ciphertext: updated.ciphertext }),
      category: updated.category,
      url: updated.url,
      createdAt: updated.createdAt,
    },
  });
}

// DELETE /api/vault/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteVaultEntry(id, session.userId);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
