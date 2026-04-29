import pg from "pg";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

const result = await pool.query("SELECT * FROM notes ORDER BY id ASC");
const backup = {
  exportedAt: new Date().toISOString(),
  table: "notes",
  rows: result.rows
};

fs.mkdirSync("backups", { recursive: true });
const filename = `backups/notes-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
console.log(`Backup written to ${filename}`);

await pool.end();
