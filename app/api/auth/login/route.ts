import { NextRequest, NextResponse } from "next/server";
import { findUserByIdentifier } from "@/lib/repo";
import { verifyMasterPassword, createSession } from "@/lib/auth";

const GENERIC_ERROR = "Invalid email/username or master password";

export async function POST(req: NextRequest) {
  let body: { identifier?: string; masterPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const identifier = body.identifier?.trim();
  const masterPassword = body.masterPassword;

  if (!identifier || !masterPassword) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  // Accepts either an email or a username in the same field.
  const user = findUserByIdentifier(identifier);
  // Same generic error whether the identifier doesn't exist or the password
  // is wrong — stops the login endpoint from being used to discover which
  // emails/usernames are registered.
  if (!user) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const valid = await verifyMasterPassword(masterPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  await createSession({ userId: user.id, email: user.email });

  return NextResponse.json({
    user: { id: user.id, email: user.email, username: user.username },
  });
}
