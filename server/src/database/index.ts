import Database from 'better-sqlite3'
import path from 'path'

let db: Database.Database

export function initDatabase(): void {
  const dbPath = path.join(__dirname, '../../data/emailvalidator.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  createTables()
}

function createTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      theme TEXT DEFAULT 'light',
      notifications INTEGER DEFAULT 1,
      export_format TEXT DEFAULT 'csv',
      api_source TEXT DEFAULT 'public',
      language TEXT DEFAULT 'en',
      timezone TEXT DEFAULT 'UTC',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS validations (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      user_id TEXT,
      syntax_valid INTEGER NOT NULL DEFAULT 0,
      domain_valid INTEGER NOT NULL DEFAULT 0,
      mx_valid INTEGER NOT NULL DEFAULT 0,
      smtp_valid INTEGER,
      is_disposable INTEGER NOT NULL DEFAULT 0,
      provider TEXT,
      deliverability TEXT DEFAULT 'unknown',
      confidence_score REAL DEFAULT 0,
      health_score INTEGER DEFAULT 0,
      explanation TEXT DEFAULT '',
      suggestions TEXT DEFAULT '[]',
      typo_suggestions TEXT DEFAULT '[]',
      result_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      validation_id TEXT,
      email TEXT NOT NULL,
      label TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (validation_id) REFERENCES validations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#4F46E5',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS collection_items (
      id TEXT PRIMARY KEY,
      collection_id TEXT NOT NULL,
      validation_id TEXT,
      email TEXT NOT NULL,
      added_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
      FOREIGN KEY (validation_id) REFERENCES validations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS share_tokens (
      id TEXT PRIMARY KEY,
      validation_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT,
      FOREIGN KEY (validation_id) REFERENCES validations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bulk_jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      filename TEXT NOT NULL,
      total_emails INTEGER DEFAULT 0,
      processed_emails INTEGER DEFAULT 0,
      valid_emails INTEGER DEFAULT 0,
      invalid_emails INTEGER DEFAULT 0,
      disposable_emails INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS bulk_results (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      result_json TEXT,
      error TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES bulk_jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      total INTEGER DEFAULT 0,
      valid INTEGER DEFAULT 0,
      invalid INTEGER DEFAULT 0,
      disposable INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_validations_email ON validations(email);
    CREATE INDEX IF NOT EXISTS idx_validations_user ON validations(user_id);
    CREATE INDEX IF NOT EXISTS idx_validations_created ON validations(created_at);
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
    CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
    CREATE INDEX IF NOT EXISTS idx_bulk_jobs_user ON bulk_jobs(user_id);
    CREATE INDEX IF NOT EXISTS idx_bulk_results_job ON bulk_results(job_id);
    CREATE INDEX IF NOT EXISTS idx_share_tokens_token ON share_tokens(token);
  `)
}

export function getDb(): Database.Database {
  return db
}
