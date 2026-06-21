import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("gearbox.db");

export type Vehicle = {
  id: number;
  make: string;
  model: string;
  year: number;
  odometer: number;
  color: string | null;
  category: string;
  photoUri: string | null;
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

const migrateDatabase = () => {
  const columns = db.getAllSync<{ name: string }>("PRAGMA table_info(vehicles)");
  const hasPhotoUri = columns.some((column) => column.name === "photoUri");

  if (!hasPhotoUri) {
    db.execSync("ALTER TABLE vehicles ADD COLUMN photoUri TEXT;");
  }
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
        category TEXT NOT NULL,
        photoUri TEXT
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

    migrateDatabase();
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
      "INSERT INTO vehicles (make, model, year, odometer, color, category, photoUri) VALUES (?, ?, ?, ?, ?, ?, ?)",
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.odometer,
      vehicle.color,
      category,
      vehicle.photoUri ?? null
    );
  }

  return getVehiclesByCategory(category);
};

export const addVehicle = (vehicle: Omit<Vehicle, "id">): Vehicle => {
  const result = db.runSync(
    "INSERT INTO vehicles (make, model, year, odometer, color, category, photoUri) VALUES (?, ?, ?, ?, ?, ?, ?)",
    vehicle.make,
    vehicle.model,
    vehicle.year,
    vehicle.odometer,
    vehicle.color,
    vehicle.category,
    vehicle.photoUri ?? null
  );

  return db.getFirstSync<Vehicle>(
    "SELECT * FROM vehicles WHERE id = ?",
    result.lastInsertRowId
  )!;
};

export const updateVehicle = (vehicle: Vehicle) => {
  db.runSync(
    "UPDATE vehicles SET make = ?, model = ?, year = ?, odometer = ?, color = ?, photoUri = ? WHERE id = ?",
    vehicle.make,
    vehicle.model,
    vehicle.year,
    vehicle.odometer,
    vehicle.color,
    vehicle.photoUri ?? null,
    vehicle.id
  );
};

export const updateVehiclePhoto = (id: number, photoUri: string | null) => {
  db.runSync("UPDATE vehicles SET photoUri = ? WHERE id = ?", photoUri, id);
};

export const deleteVehicle = (id: number) => {
  db.runSync("DELETE FROM services WHERE vehicleId = ?", id);
  db.runSync("DELETE FROM vehicles WHERE id = ?", id);
};

export const addService = (service: Omit<Service, "id">): Service => {
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
    );
  }

  return db.getFirstSync<Service>(
    "SELECT * FROM services WHERE id = ?",
    result.lastInsertRowId
  )!;
};

export const getServicesByVehicleId = (vehicleId: number): Service[] => {
  return db.getAllSync<Service>(
    "SELECT * FROM services WHERE vehicleId = ? ORDER BY date DESC, id DESC",
    vehicleId
  );
};

export default db;
