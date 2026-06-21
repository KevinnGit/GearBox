import * as SQLite from "expo-sqlite"

let db: SQLite.SQLiteDatabase | null = null

<<<<<<< HEAD
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
=======
export type Vehicle = {
  id: number;
  make: string;
  model: string;
  year: number;
  odometer: number;
  color: string | null;
  category: string;
};

export type Service = {
  id: number;
  vehicleId: number;
  serviceType: string;
  mileage: number;
  cost: number;
  date: string;
  notes: string | null;
};

export const initDatabase = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        odometer INTEGER NOT NULL,
        color TEXT,
        category TEXT NOT NULL
      );
    `);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        serviceType TEXT NOT NULL,
        mileage INTEGER NOT NULL,
        cost REAL NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY(vehicleId) REFERENCES vehicles(id)
      );
    `);

    console.log("Database initialized");
  } catch (error) {
    console.log("Database Error:", error);
  }
};

export const getVehiclesByCategory = (category: string): Vehicle[] => {
  return db.getAllSync<Vehicle>(
    "SELECT * FROM vehicles WHERE category = ? ORDER BY id ASC",
    category
  );
};

export const seedVehiclesIfEmpty = (
  category: string,
  defaults: Omit<Vehicle, "id" | "category">[]
) => {
  const existing = getVehiclesByCategory(category);
  if (existing.length > 0) return existing;

  for (const vehicle of defaults) {
    db.runSync(
      "INSERT INTO vehicles (make, model, year, odometer, color, category) VALUES (?, ?, ?, ?, ?, ?)",
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.odometer,
      vehicle.color,
      category
>>>>>>> parent of c9fe907 (add pic for unit is working)
    );
  `)

<<<<<<< HEAD
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
=======
  return getVehiclesByCategory(category);
};

export const addVehicle = (
  vehicle: Omit<Vehicle, "id">
): Vehicle => {
  const result = db.runSync(
    "INSERT INTO vehicles (make, model, year, odometer, color, category) VALUES (?, ?, ?, ?, ?, ?)",
    vehicle.make,
    vehicle.model,
    vehicle.year,
    vehicle.odometer,
    vehicle.color,
    vehicle.category
  );

  return db.getFirstSync<Vehicle>(
    "SELECT * FROM vehicles WHERE id = ?",
    result.lastInsertRowId
  )!;
};

export const updateVehicle = (vehicle: Vehicle) => {
  db.runSync(
    "UPDATE vehicles SET make = ?, model = ?, year = ?, odometer = ?, color = ? WHERE id = ?",
    vehicle.make,
    vehicle.model,
    vehicle.year,
    vehicle.odometer,
    vehicle.color,
    vehicle.id
  );
};

export const deleteVehicle = (id: number) => {
  db.runSync("DELETE FROM services WHERE vehicleId = ?", id);
  db.runSync("DELETE FROM vehicles WHERE id = ?", id);
};

export const addService = (
  service: Omit<Service, "id">
): Service => {
  const result = db.runSync(
    "INSERT INTO services (vehicleId, serviceType, mileage, cost, date, notes) VALUES (?, ?, ?, ?, ?, ?)",
    service.vehicleId,
    service.serviceType,
    service.mileage,
    service.cost,
    service.date,
    service.notes
  );

  if (service.mileage > 0) {
    db.runSync(
      "UPDATE vehicles SET odometer = ? WHERE id = ? AND odometer < ?",
      service.mileage,
      service.vehicleId,
      service.mileage
>>>>>>> parent of c9fe907 (add pic for unit is working)
    );
  `)
}

// ... rest of your types and CRUD functions below