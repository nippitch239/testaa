// setup-api-auth.js
// Writes app/api/auth/** — register, login, logout, me routes.
// Lives in the setup/ folder. Run with:  node setup-api-auth.js

const fs = require('fs');
const path = require('path');

// This script lives in a `setup/` folder one level below your actual
// project root, but it needs to write files like "lib/db.ts" into the
// PROJECT root, not into setup/lib/db.ts. So it locates the project root
// as "one directory up from this script" rather than using the current
// working directory — that way it works correctly whether you run it as
// `node setup-all.js` from inside setup/, or `node setup/setup-all.js`
// from the project root.
const PROJECT_ROOT = path.join(__dirname, "..");

const files = {
  "app/api/auth/register/route.ts": "import { NextRequest, NextResponse } from \"next/server\";\nimport { findUserByEmail, findUserByUsername, createUser } from \"@/lib/repo\";\nimport { hashMasterPassword, createSession } from \"@/lib/auth\";\n\nexport async function POST(req: NextRequest) {\n  let body: { email?: string; username?: string; masterPassword?: string };\n  try {\n    body = await req.json();\n  } catch {\n    return NextResponse.json({ error: \"Invalid request body\" }, { status: 400 });\n  }\n\n  const email = body.email?.trim().toLowerCase();\n  const username = body.username?.trim().toLowerCase();\n  const masterPassword = body.masterPassword;\n\n  if (!email || !username || !masterPassword) {\n    return NextResponse.json(\n      { error: \"Email, username, and master password are required\" },\n      { status: 400 }\n    );\n  }\n  if (!/^\\S+@\\S+\\.\\S+$/.test(email)) {\n    return NextResponse.json({ error: \"Invalid email address\" }, { status: 400 });\n  }\n  if (!/^[a-z0-9_.]{3,20}$/.test(username)) {\n    return NextResponse.json(\n      { error: \"Username must be 3-20 characters (a-z, 0-9, _ or .)\" },\n      { status: 400 }\n    );\n  }\n  if (masterPassword.length < 8) {\n    return NextResponse.json(\n      { error: \"Master password must be at least 8 characters\" },\n      { status: 400 }\n    );\n  }\n\n  // Deliberately vague on both checks \u2014 don't confirm which emails or\n  // usernames are already registered.\n  if (findUserByEmail(email) || findUserByUsername(username)) {\n    return NextResponse.json(\n      { error: \"Could not create account with these details\" },\n      { status: 409 }\n    );\n  }\n\n  const passwordHash = await hashMasterPassword(masterPassword);\n  const user = createUser(email, username, passwordHash);\n\n  await createSession({ userId: user.id, email: user.email });\n\n  return NextResponse.json(\n    { user: { id: user.id, email: user.email, username: user.username } },\n    { status: 201 }\n  );\n}\n",
  "app/api/auth/login/route.ts": "import { NextRequest, NextResponse } from \"next/server\";\nimport { findUserByIdentifier } from \"@/lib/repo\";\nimport { verifyMasterPassword, createSession } from \"@/lib/auth\";\n\nconst GENERIC_ERROR = \"Invalid email/username or master password\";\n\nexport async function POST(req: NextRequest) {\n  let body: { identifier?: string; masterPassword?: string };\n  try {\n    body = await req.json();\n  } catch {\n    return NextResponse.json({ error: \"Invalid request body\" }, { status: 400 });\n  }\n\n  const identifier = body.identifier?.trim();\n  const masterPassword = body.masterPassword;\n\n  if (!identifier || !masterPassword) {\n    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });\n  }\n\n  // Accepts either an email or a username in the same field.\n  const user = findUserByIdentifier(identifier);\n  // Same generic error whether the identifier doesn't exist or the password\n  // is wrong \u2014 stops the login endpoint from being used to discover which\n  // emails/usernames are registered.\n  if (!user) {\n    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });\n  }\n\n  const valid = await verifyMasterPassword(masterPassword, user.passwordHash);\n  if (!valid) {\n    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });\n  }\n\n  await createSession({ userId: user.id, email: user.email });\n\n  return NextResponse.json({\n    user: { id: user.id, email: user.email, username: user.username },\n  });\n}\n",
  "app/api/auth/logout/route.ts": "import { NextResponse } from \"next/server\";\nimport { clearSession } from \"@/lib/auth\";\n\nexport async function POST() {\n  await clearSession();\n  return NextResponse.json({ ok: true });\n}\n",
  "app/api/auth/me/route.ts": "import { NextResponse } from \"next/server\";\nimport { getSession } from \"@/lib/auth\";\nimport { findUserById } from \"@/lib/repo\";\n\nexport async function GET() {\n  const session = await getSession();\n  if (!session) {\n    return NextResponse.json({ user: null }, { status: 401 });\n  }\n\n  const user = findUserById(session.userId);\n  if (!user) {\n    return NextResponse.json({ user: null }, { status: 401 });\n  }\n\n  return NextResponse.json({\n    user: { id: user.id, email: user.email, username: user.username },\n  });\n}\n"
};


for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(PROJECT_ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
  console.log("wrote", relPath);
}

console.log("Done: " + Object.keys(files).length + " file(s) written.");
