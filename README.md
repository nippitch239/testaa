# SecureVault

A password manager built with Next.js. Protects your accounts with a
single master password and encrypts every stored password.

## How your data is protected

There are two different types of passwords in this app, which are
intentionally protected in two different ways:

| Password | Purpose | Protection |
|---|---|---|
| **Master password** | Login to SecureVault | One-way hash (bcrypt, cost 12) — never stored in reversible form |
| **Vault passwords** | The stored website passwords | Reversible encryption (AES-256-CBC) — recoverable so you can view/copy them |

The master password only needs to be *verified*, so hashing is correct
and more secure here. Vault passwords need to be *retrievable* so they
can be shown to you — that's why they're encrypted (reversible), not
hashed.

## Getting started

**Prerequisites:** Node.js 18+ (tested with Node 22/24), npm.

```bash
cd SecureVault
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Then open `.env` and enter two random secrets. Generate each one with:
ใช้ 2 ครั้ง อะนแรกของ JWT อีกอันของ vault
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run the command once for `VAULT_ENCRYPTION_KEY` and once for
`JWT_SECRET`. Your `.env` should then look like this:

```
DATABASE_URL="file:./data/vault.db"
VAULT_ENCRYPTION_KEY="<64 hex characters you generated>"
JWT_SECRET="<64 hex characters you generated>"
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an
account, and start saving passwords.
