import { getCachedMakes, setCachedMakes, getCachedModels, setCachedModels } from "../database/db"

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles"

// ─── Fallback Data ──────────────────────────────────────────────────────────

const CAR_MAKES_FALLBACK = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "BMW", "Buick", "Cadillac",
  "Chevrolet", "Chrysler", "Citroën", "Dodge", "Ferrari", "Fiat", "Ford",
  "Genesis", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep",
  "Kia", "Lamborghini", "Land Rover", "Lexus", "Maserati", "Mazda",
  "McLaren", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Porsche",
  "Ram", "Rolls-Royce", "Subaru", "Suzuki", "Tesla", "Toyota",
  "Volkswagen", "Volvo",
]

const MOTORCYCLE_MAKES_FALLBACK = [
  "Aprilia", "BMW", "Ducati", "Harley-Davidson", "Honda", "Husqvarna",
  "Indian", "Kawasaki", "KTM", "Moto Guzzi", "Royal Enfield", "Suzuki",
  "Triumph", "Victory", "Yamaha", "Zero",
]

const MODELS_FALLBACK: Record<string, string[]> = {
  Acura: ["ILX", "MDX", "NSX", "RDX", "RLX", "TLX", "Integra", "Legend", "RSX", "TSX"],
  "Alfa Romeo": ["4C", "Giulia", "Giulietta", "MiTo", "Spider", "Stelvio", "Tonale"],
  "Aston Martin": ["DB11", "DB5", "DB9", "DBS", "Rapide", "V8 Vantage", "Valkyrie", "Vanquish"],
  Audi: ["A3", "A4", "A5", "A6", "A7", "A8", "e-tron", "Q3", "Q5", "Q7", "Q8", "R8", "RS3", "RS7", "S3", "S4", "S5", "SQ5", "TT"],
  BMW: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "i3", "i4", "i7", "i8", "M2", "M3", "M4", "M5", "X1", "X3", "X5", "X6", "X7", "Z4"],
  Buick: ["Enclave", "Encore", "Envision", "LaCrosse", "LeSabre", "Regal", "Verano"],
  Cadillac: ["ATS", "CT5", "CT6", "CTS", "DeVille", "ELR", "Escalade", "SRX", "XT4", "XT5", "XT6", "XTS"],
  Chevrolet: ["Blazer", "Camaro", "Colorado", "Corvette", "Cruze", "Equinox", "Impala", "Malibu", "Silverado", "Spark", "Suburban", "Tahoe", "Trailblazer", "Traverse", "Volt"],
  Chrysler: ["200", "300", "Aspen", "Crossfire", "Pacifica", "PT Cruiser", "Sebring", "Town & Country", "Voyager"],
  Citroën: ["Berlingo", "C1", "C2", "C3", "C4", "C5", "C6", "C-Elysée", "DS3", "DS4", "DS5", "Grand C4 Picasso", "Jumper", "Saxo", "Xsara"],
  Dodge: ["Avenger", "Caliber", "Challenger", "Charger", "Dart", "Durango", "Grand Caravan", "Journey", "Neon", "Ram", "Viper"],
  Ferrari: ["296 GTB", "360 Modena", "488", "812 Superfast", "California", "Enzo", "F8 Tributo", "F430", "F50", "LaFerrari", "Portofino", "Roma", "SF90 Stradale"],
  Fiat: ["124 Spider", "500", "500L", "500X", "Bravo", "Doblo", "Ducato", "Fiorino", "Panda", "Punto", "Qubo", "Strada", "Tipo", "Uno"],
  Ford: ["Bronco", "Edge", "Escape", "Explorer", "F-150", "Fiesta", "Focus", "Fusion", "Galaxy", "Kuga", "Mondeo", "Mustang", "Ranger", "Taurus", "Territory", "Tourneo", "Transit"],
  Genesis: ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
  GMC: ["Acadia", "Canyon", "Hummer EV", "Safari", "Savana", "Sierra", "Terrain", "Yukon"],
  Honda: ["Accord", "Brio", "Civic", "CR-V", "CR-Z", "Fit", "HR-V", "Insight", "Jazz", "NSX", "Odyssey", "Passport", "Pilot", "Ridgeline", "S2000", "Vezel"],
  Hyundai: ["Accent", "Azera", "Elantra", "Genesis", "Getz", "Grandeur", "Ioniq", "Kona", "Santa Fe", "Sonata", "Tucson", "Veloster", "Venue"],
  Infiniti: ["EX35", "FX35", "G25", "G35", "G37", "JX35", "M35", "M37", "Q50", "Q60", "Q70", "QX50", "QX60", "QX80"],
  Jaguar: ["E-Pace", "F-Pace", "F-Type", "I-Pace", "S-Type", "XF", "XJ", "XK", "XKR"],
  Jeep: ["Cherokee", "CJ", "Compass", "Gladiator", "Grand Cherokee", "Liberty", "Patriot", "Renegade", "Wrangler"],
  Kia: ["Carnival", "Cerato", "Forte", "K5", "K900", "Niro", "Optima", "Picanto", "Rio", "Seltos", "Sorento", "Soul", "Sportage", "Stinger", "Telluride"],
  Lamborghini: ["Aventador", "Countach", "Diablo", "Gallardo", "Huracán", "Murciélago", "Revuelto", "Urus"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Evoque", "Freelander", "Range Rover", "Range Rover Sport", "Range Rover Velar"],
  Lexus: ["CT", "ES", "GS", "GX", "HS", "IS", "LC", "LFA", "LS", "LX", "NX", "RC", "RX", "UX"],
  Maserati: ["Ghibli", "GranTurismo", "Grecale", "Levante", "MC20", "Quattroporte"],
  Mazda: ["2", "3", "5", "6", "Az-1", "BT-50", "CX-3", "CX-30", "CX-5", "CX-50", "CX-60", "CX-9", "Miata", "MX-5", "RX-7", "RX-8"],
  McLaren: ["570S", "600LT", "650S", "720S", "750S", "Artura", "GT", "P1", "Senna", "Speedtail"],
  "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "CLA", "CLS", "E-Class", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLK", "GLS", "S-Class", "SL", "SLC", "SLK", "SLS", "V-Class"],
  Mini: ["Clubman", "Cooper", "Countryman", "Paceman"],
  Mitsubishi: ["3000GT", "ASX", "Colt", "Eclipse", "Eclipse Cross", "Evo", "Galant", "L200", "Lancer", "Mirage", "Montero", "Outlander", "Pajero", "Space Star"],
  Nissan: ["350Z", "370Z", "Almera", "Altima", "Armada", "Frontier", "GTR", "Juke", "Kicks", "Leaf", "Maxima", "Micra", "Murano", "Navara", "Pathfinder", "Qashqai", "Rogue", "Sentra", "Skyline", "Versa", "X-Trail", "Z"],
  Porsche: ["718 Boxster", "718 Cayman", "911", "924", "928", "944", "Boxster", "Cayenne", "Cayman", "Macan", "Panamera", "Taycan"],
  Ram: ["1500", "2500", "3500", "Chassis Cab", "ProMaster", "ProMaster City"],
  "Rolls-Royce": ["Cullinan", "Dawn", "Ghost", "Phantom", "Spectre", "Wraith"],
  Subaru: ["Baja", "BRZ", "Crosstrek", "Forester", "Impreza", "Legacy", "Levorg", "Outback", "SVX", "WRX", "XV", "XT"],
  Suzuki: ["Alto", "Baleno", "Celerio", "Ciaz", "Ertiga", "Grand Vitara", "Ignis", "Jimny", "Kizashi", "S-Cross", "Swift", "Vitara", "Wagon R"],
  Tesla: ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y", "Roadster"],
  Toyota: ["4Runner", "Alphard", "Camry", "Celica", "Corolla", "Fortuner", "GR86", "Hiace", "Highlander", "Hilux", "Innova", "Land Cruiser", "MR2", "Prado", "Prius", "RAV4", "Sequoia", "Sienna", "Supra", "Tacoma", "Tundra", "Vios", "Yaris"],
  Volkswagen: ["Amarok", "Arteon", "Beetle", "Caddy", "Crafter", "Golf", "ID.3", "ID.4", "ID. Buzz", "Jetta", "Passat", "Polo", "T-Cross", "T-Roc", "Taigo", "Tiguan", "Touareg", "Transporter", "Up"],
  Volvo: ["C30", "C40", "C70", "S40", "S60", "S80", "S90", "V40", "V60", "V90", "XC40", "XC60", "XC90"],

  "Aprilia": ["Dorsoduro", "Mana", "RS 125", "RS 660", "RSV4", "Shiver", "Tuareg", "Tuono"],
  Ducati: ["916", "999", "Diavel", "Hypermotard", "Monster", "Multistrada", "Panigale", "Scrambler", "Streetfighter", "SuperSport"],
  "Harley-Davidson": ["CVO", "Dyna", "Electra Glide", "Fat Boy", "Heritage Classic", "Iron 883", "LiveWire", "Low Rider", "Road Glide", "Road King", "Softail", "Sportster", "Street Glide", "Touring"],
  Husqvarna: ["401", "701", "Enduro", "FE 350", "FS 450", "Norden", "Pilen", "Svartpilen", "TE 300", "Vitpilen"],
  Indian: ["Challenger", "Chief", "Chieftain", "FTR", "Roadmaster", "Scout", "Springfield"],
  Kawasaki: ["KX", "Ninja", "Vulcan", "W800", "Z H2", "Z1000", "Z125", "Z650", "Z900", "ZX-10R", "ZX-6R", "ZX-4R"],
  KTM: ["125 Duke", "1290 Super Duke", "200 Duke", "390 Duke", "690 Duke", "790 Duke", "890 Duke", "EXC", "RC 390", "Super Adventure", "XC-W"],
  "Moto Guzzi": ["California", "Griso", "Le Mans", "MGX-21", "Stelvio", "V7", "V85 TT", "V9"],
  "Royal Enfield": ["Bullet", "Classic", "Continental GT", "Himalayan", "Interceptor", "Meteor", "Shotgun", "Super Meteor"],
  Triumph: ["Bonneville", "Daytona", "Rocket 3", "Scrambler", "Speed Triple", "Speed Twin", "Street Triple", "Street Twin", "Tiger", "Thruxton", "Trident"],
  Victory: ["Cross Country", "Cross Roads", "Gunner", "High-Ball", "Judge", "Kingpin", "Magnum", "Octane", "Vegas", "Vision"],
  Yamaha: ["MT-07", "MT-09", "MT-10", "MT-125", "R1", "R125", "R15", "R3", "R6", "R7", "Super Tenere", "Ténéré 700", "Tracer 9", "VMAX", "WR450F", "XSR700", "XSR900", "YZF"],
  Zero: ["DSR", "FX", "FXE", "SR", "SR/F", "SR/S", "SRS"],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toTitleCase(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (["a", "an", "the", "of", "for", "and", "or", "in", "on", "at", "to"].includes(word)) {
        return word
      }
      if (word.includes("-")) {
        return word.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("-")
      }
      if (word.includes("'")) {
        return word.split("'").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("'")
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
    .replace(/\bEv\b/g, "EV")
    .replace(/\bId\b/g, "ID")
}

// ─── NHTSA VPIC API ────────────────────────────────────────────────────────

const VEHICLE_TYPE_PARAM: Record<string, string> = {
  Car: "car",
  Motorcycle: "motorcycle",
}

async function fetchMakesFromApi(category: string): Promise<string[] | null> {
  const typeParam = VEHICLE_TYPE_PARAM[category]
  if (!typeParam) return null

  try {
    const response = await fetch(
      `${NHTSA_BASE}/GetMakesForVehicleType/${typeParam}?format=json`,
      { headers: { "User-Agent": "GearBox/1.0" } }
    )
    if (!response.ok) return null

    const data = await response.json()
    if (!data?.Results?.length) return null

    const makes: string[] = data.Results
      .map((r: any) => toTitleCase(r.MakeName))
      .filter((name: string) => name && name.trim())

    return [...new Set(makes)].sort()
  } catch {
    return null
  }
}

async function fetchModelsFromApi(make: string): Promise<string[] | null> {
  if (!make) return null

  try {
    const response = await fetch(
      `${NHTSA_BASE}/GetModelsForMake/${encodeURIComponent(make)}?format=json`,
      { headers: { "User-Agent": "GearBox/1.0" } }
    )
    if (!response.ok) return null

    const data = await response.json()
    if (!data?.Results?.length) return null

    const models: string[] = data.Results
      .map((r: any) => toTitleCase(r.Model_Name))
      .filter((name: string) => name && name.trim())

    return [...new Set(models)].sort()
  } catch {
    return null
  }
}

// ─── Sync cache (instant) ───────────────────────────────────────────────────

export function getCachedMakesSync(category: string): string[] {
  try {
    const cached = getCachedMakes(category)
    if (cached.length > 0) return cached
  } catch {}
  return category === "Motorcycle" ? MOTORCYCLE_MAKES_FALLBACK : CAR_MAKES_FALLBACK
}

export function getCachedModelsSync(make: string): string[] {
  try {
    const cached = getCachedModels(make)
    if (cached.length > 0) return cached
  } catch {}
  return MODELS_FALLBACK[make] ?? []
}

// ─── Background API refresh ─────────────────────────────────────────────────

export async function refreshMakes(category: string): Promise<string[]> {
  const result = await fetchMakesFromApi(category)
  if (result) {
    try { setCachedMakes(category, result) } catch {}
    return result
  }
  return getCachedMakesSync(category)
}

export async function refreshModels(make: string): Promise<string[]> {
  const result = await fetchModelsFromApi(make)
  if (result) {
    try { setCachedModels(make, result) } catch {}
    return result
  }
  return getCachedModelsSync(make)
}

// ─── Legacy async (waits for API, falls back) ───────────────────────────────

export async function fetchMakes(category: string): Promise<string[]> {
  return refreshMakes(category)
}

export async function fetchModels(make: string): Promise<string[]> {
  return refreshModels(make)
}
