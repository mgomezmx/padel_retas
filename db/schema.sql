CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    courts_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    court_index INTEGER NOT NULL,
    spot_index INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    player_token TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookings_match_id ON bookings(match_id);
