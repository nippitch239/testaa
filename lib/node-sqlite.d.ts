// Minimal ambient types for node:sqlite.
//
// The installed @types/node version doesn't ship types for this module yet,
// so this declares just the surface area lib/db.ts actually uses. Safe to
// delete once @types/node is bumped to a version that includes it.
declare module "node:sqlite" {
  export interface StatementResultingChanges {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  export class StatementSync {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(...params: unknown[]): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    all(...params: unknown[]): any[];
    run(...params: unknown[]): StatementResultingChanges;
  }

  export class DatabaseSync {
    constructor(path: string, options?: Record<string, unknown>);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
