import * as SQLite from "expo-sqlite"

// ─── DB Setup ───────────────────────────────────────────────────────────────

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

// ─── Types ───────────────────────────────────────────────────────────────────

export type Vehicle = {
  id: number
  make: string
  model: string
  year: number
  odometer: number
  color: string
  category: string
  photoUri?: string | null
}

export type Service = {
  id: number
  vehicleId: number
  serviceType: string
  mileage: number
  cost: number
  date: string
  notes: string | null
}

// ─── Vehicle CRUD ────────────────────────────────────────────────────────────

export const getVehiclesByCategory = (category: string): Vehicle[] => {
  const db = getDb()
  return db.getAllSync<Vehicle>(
    "SELECT * FROM vehicles WHERE category = ? ORDER BY id DESC",
    [category]
  )
}

export const addVehicle = (
  vehicle: Omit<Vehicle, "id">
): void => {
  const db = getDb()
  db.runSync(
    `INSERT INTO vehicles (make, model, year, odometer, color, category, photoUri)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.odometer,
      vehicle.color,
      vehicle.category,
      vehicle.photoUri ?? null,
    ]
  )
}

export const updateVehicle = (vehicle: Vehicle): void => {
  const db = getDb()
  db.runSync(
    `UPDATE vehicles SET make = ?, model = ?, year = ?, odometer = ?, color = ?, photoUri = ?
     WHERE id = ?`,
    [
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.odometer,
      vehicle.color,
      vehicle.photoUri ?? null,
      vehicle.id,
    ]
  )
}

export const deleteVehicle = (id: number): void => {
  const db = getDb()
  db.runSync("DELETE FROM vehicles WHERE id = ?", [id])
}

export const seedVehiclesIfEmpty = (
  category: string,
  defaults: Omit<Vehicle, "id">[]
): Vehicle[] => {
  const existing = getVehiclesByCategory(category)
  if (existing.length === 0) {
    for (const v of defaults) {
      addVehicle({ ...v, category })
    }
    return getVehiclesByCategory(category)
  }
  return existing
}

// ─── Service CRUD ────────────────────────────────────────────────────────────

export const getServicesByVehicleId = (vehicleId: number): Service[] => {
  const db = getDb()
  return db.getAllSync<Service>(
    "SELECT * FROM services WHERE vehicleId = ? ORDER BY date DESC",
    [vehicleId]
  )
}

export const addService = (
  service: Omit<Service, "id">
): void => {
  const db = getDb()
  db.runSync(
    `INSERT INTO services (vehicleId, serviceType, mileage, cost, date, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      service.vehicleId,
      service.serviceType,
      service.mileage,
      service.cost,
      service.date,
      service.notes ?? null,
    ]
  )
}

export const deleteService = (id: number): void => {
  const db = getDb()
  db.runSync("DELETE FROM services WHERE id = ?", [id])
}