import * as SQLite from "expo-sqlite"

let db: SQLite.SQLiteDatabase | null = null

export const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync("gearbox.db")
  }
  return db
}

export const initDatabase = () => {
  const db = getDb()

  db.execSync(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      odometer INTEGER NOT NULL DEFAULT 0,
      color TEXT,
      category TEXT NOT NULL,
      photoUri TEXT
    );
  `)

  db.execSync(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      serviceType TEXT NOT NULL,
      mileage INTEGER NOT NULL,
      cost REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
    );
  `)
}

// ... rest of your types and CRUD functions below