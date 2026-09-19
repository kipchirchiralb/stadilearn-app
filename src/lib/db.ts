import mysql, { type Pool, type PoolConnection, type PoolOptions, type RowDataPacket } from "mysql2/promise";

/**
 * Database pools. Server-side only.
 *
 * - app       custom DB, read/write (CUSTOM_DB_USER)
 * - ai        custom DB, SELECT on ai_v_* views and rag_* tables only (CUSTOM_DB_AI_USER)
 * - moodle    Moodle DB, read-only (MOODLE_DB_USER)
 * - moodleAi  Moodle DB, SELECT on content/completion tables only (MOODLE_AI_DB_USER)
 *
 * The AI pools fall back to the broader read credentials when their dedicated
 * user is not configured, so local development works with fewer accounts.
 * Production should set both dedicated users; see db-grants.sql.
 */

type Row = RowDataPacket & Record<string, unknown>;

const globalPools = globalThis as unknown as { __stadilearnPools?: Map<string, Pool> };
const pools: Map<string, Pool> = (globalPools.__stadilearnPools ??= new Map());

function env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") throw new Error(`Missing environment variable ${name}`);
  return value;
}

function pool(key: string, prefix: "CUSTOM_DB" | "MOODLE_DB", userVar: string, passVar: string, limit: number) {
  let p = pools.get(key);
  if (!p) {
    const options: PoolOptions = {
      host: env(`${prefix}_HOST`),
      port: Number(env(`${prefix}_PORT`, "3306")),
      database: env(`${prefix}_NAME`),
      user: process.env[userVar] || env(`${prefix}_USER`),
      password: process.env[userVar] ? process.env[passVar] : process.env[`${prefix}_PASSWORD`],
      connectionLimit: limit,
      timezone: "Z",
      charset: "utf8mb4",
      supportBigNumbers: true,
      ssl: process.env[`${prefix}_SSL`] === "true" ? { rejectUnauthorized: true } : undefined,
    };
    p = mysql.createPool(options);
    pools.set(key, p);
  }
  return p;
}

const appPool = () => pool("app", "CUSTOM_DB", "CUSTOM_DB_USER", "CUSTOM_DB_PASSWORD", 10);
const aiPool = () => pool("ai", "CUSTOM_DB", "CUSTOM_DB_AI_USER", "CUSTOM_DB_AI_PASSWORD", 5);
const moodlePool = () => pool("moodle", "MOODLE_DB", "MOODLE_DB_USER", "MOODLE_DB_PASSWORD", 5);
const moodleAiPool = () => pool("moodleAi", "MOODLE_DB", "MOODLE_AI_DB_USER", "MOODLE_AI_DB_PASSWORD", 5);

type Scalar = string | number | bigint | boolean | Date | Buffer | null;
/** Arrays expand for `IN (?)`. */
type Params = (Scalar | Scalar[])[];

export type DbTx = {
  query<T = Row>(sql: string, params?: Params): Promise<T[]>;
  execute(sql: string, params?: Params): Promise<mysql.ResultSetHeader>;
};

function executor(conn: PoolConnection): DbTx {
  return {
    async query<T = Row>(sql: string, params: Params = []) {
      const [rows] = await conn.query<Row[]>(sql, params);
      return rows as T[];
    },
    async execute(sql: string, params: Params = []) {
      const [result] = await conn.query<mysql.ResultSetHeader>(sql, params);
      return result;
    },
  };
}

/** Read/write access to the custom database. */
export const appDb: DbTx & { transaction<T>(fn: (tx: DbTx) => Promise<T>): Promise<T> } = {
  async query<T = Row>(sql: string, params: Params = []) {
    const [rows] = await appPool().query<Row[]>(sql, params);
    return rows as T[];
  },
  async execute(sql: string, params: Params = []) {
    const [result] = await appPool().query<mysql.ResultSetHeader>(sql, params);
    return result;
  },
  async transaction<T>(fn: (tx: DbTx) => Promise<T>): Promise<T> {
    const conn = await appPool().getConnection();
    try {
      await conn.beginTransaction();
      const out = await fn(executor(conn));
      await conn.commit();
      return out;
    } catch (err) {
      try {
        await conn.rollback();
      } catch {
        /* connection may already be closed */
      }
      throw err;
    } finally {
      conn.release();
    }
  },
};

const READ_ONLY = /^\s*(SELECT|WITH)\b/i;

function readOnly(getPool: () => Pool, label: string) {
  return async function query<T = Row>(sql: string, params: Params = []) {
    // Belt and braces: the DB user is already SELECT-only.
    if (!READ_ONLY.test(sql) || sql.includes(";")) throw new Error(`${label}: only single SELECT statements are allowed`);
    const [rows] = await getPool().query<Row[]>(sql, params);
    return rows as T[];
  };
}

/** Custom DB, restricted to non-PII views (ai_v_*) and RAG tables. */
export const aiDb = { query: readOnly(aiPool, "aiDb") };

/** Moodle DB, read-only. Never writes. */
export const moodleDb = { query: readOnly(moodlePool, "moodleDb") };

/** Moodle DB for the AI and the indexer: content and completion tables only. */
export const moodleAiDb = { query: readOnly(moodleAiPool, "moodleAiDb") };

/** Moodle table name with the configured prefix, e.g. mt("course") -> mdl_course. */
export function mt(table: string) {
  const prefix = process.env.MOODLE_DB_PREFIX ?? "mdl_";
  if (!/^[a-z0-9_]*$/.test(prefix) || !/^[a-z0-9_]+$/.test(table)) throw new Error("Invalid Moodle table name");
  return `\`${prefix}${table}\``;
}

export async function closePools() {
  await Promise.all([...pools.values()].map((p) => p.end()));
  pools.clear();
}
