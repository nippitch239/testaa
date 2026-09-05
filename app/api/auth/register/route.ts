import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, findUserByUsername, createUser } from "@/lib/repo";
import { hashMasterPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { email?: string; username?: string; masterPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const username = body.username?.trim().toLowerCase();
  const masterPassword = body.masterPassword;

  if (!email || !username || !masterPassword) {
    return NextResponse.json(
      { error: "Email, username, and master password are required" },
      { status: 400 }
    );
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3-20 characters (a-z, 0-9, _ or .)" },
      { status: 400 }
    );
  }
  if (masterPassword.length < 8) {
    return NextResponse.json(
      { error: "Master password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // Deliberately vague on both checks — don't confirm which emails or
  // usernames are already registered.
  if (findUserByEmail(email) || findUserByUsername(username)) {
    return NextResponse.json(
      { error: "Could not create account with these details" },
      { status: 409 }
    );
  }

  const passwordHash = await hashMasterPassword(masterPassword);
  const user = createUser(email, username, passwordHash);

  await createSession({ userId: user.id, email: user.email });

  return NextResponse.json(
    { user: { id: user.id, email: user.email, username: user.username } },
    { status: 201 }
  );
}
