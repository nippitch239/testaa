import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listVaultEntries, createVaultEntry } from "@/lib/repo";
import { encryptVaultPassword, decryptVaultPassword } from "@/lib/crypto";
import { CATEGORIES, type Category } from "@/lib/types";

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as string[]).includes(value);
}

// GET /api/vault — list this user's entries, decrypted for display.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rows = listVaultEntries(session.userId);
  const entries = rows.map((row) => ({
    id: row.id,
    site: row.site,
    username: row.username,
    password: decryptVaultPassword({ iv: row.iv, ciphertext: row.ciphertext }),
    category: row.category,
    url: row.url,
    createdAt: row.createdAt,
  }));

  return NextResponse.json({ entries });
}

// POST /api/vault — create a new entry. Plaintext password never touches
// the database — only iv + ciphertext are stored.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

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

  const { site, username, password, url } = body;
  const category = isCategory(body.category) ? body.category : "Other";

  if (!site || !username || !password) {
    return NextResponse.json(
      { error: "site, username, and password are required" },
      { status: 400 }
    );
  }

  const { iv, ciphertext } = encryptVaultPassword(password);
  const entry = createVaultEntry({
    userId: session.userId,
    site,
    username,
    iv,
    ciphertext,
    category,
    url: url ?? "",
  });

  return NextResponse.json(
    {
      entry: {
        id: entry.id,
        site: entry.site,
        username: entry.username,
        password, // echo back what was just saved, no need to re-decrypt
        category: entry.category,
        url: entry.url,
        createdAt: entry.createdAt,
      },
    },
    { status: 201 }
  );
}
