-- Visits table: one row per request to a cert page
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cert_slug TEXT NOT NULL,        -- e.g. 'brainstation', 'george-brown'
  path TEXT NOT NULL,             -- full request path
  country TEXT,                   -- Cloudflare-provided (e.g. 'CA', 'US')
  city TEXT,                      -- Cloudflare-provided, coarse
  user_agent TEXT,
  referrer TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_visits_cert_slug ON visits (cert_slug);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits (created_at);
