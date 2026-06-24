import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useState } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { addVehicle, updateVehiclePhoto } from "../database/db"
import { pickVehiclePhoto, saveVehiclePhoto } from "../utils/vehiclePhoto"

const CAR_MAKES = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "BMW", "Buick", "Cadillac",
  "Chevrolet", "Chrysler", "Citroën", "Dodge", "Ferrari", "Fiat", "Ford",
  "Genesis", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep",
  "Kia", "Lamborghini", "Land Rover", "Lexus", "Maserati", "Mazda",
  "McLaren", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Porsche",
  "Ram", "Rolls-Royce", "Subaru", "Suzuki", "Tesla", "Toyota",
  "Volkswagen", "Volvo",
]

const MOTORCYCLE_MAKES = [
  "Aprilia", "BMW", "Ducati", "Harley-Davidson", "Honda", "Husqvarna",
  "Indian", "Kawasaki", "KTM", "Moto Guzzi", "Royal Enfield", "Suzuki",
  "Triumph", "Victory", "Yamaha", "Zero",
]

const VEHICLE_MODELS: Record<string, string[]> = {
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
  "Ducati": ["916", "999", "Diavel", "Hypermotard", "Monster", "Multistrada", "Panigale", "Scrambler", "Streetfighter", "SuperSport"],
  "Harley-Davidson": ["CVO", "Dyna", "Electra Glide", "Fat Boy", "Heritage Classic", "Iron 883", "LiveWire", "Low Rider", "Road Glide", "Road King", "Softail", "Sportster", "Street Glide", "Touring"],
  "Husqvarna": ["401", "701", "Enduro", "FE 350", "FS 450", "Norden", "Pilen", "Svartpilen", "TE 300", "Vitpilen"],
  "Indian": ["Challenger", "Chief", "Chieftain", "FTR", "Roadmaster", "Scout", "Springfield"],
  "Kawasaki": ["KX", "Ninja", "Vulcan", "W800", "Z H2", "Z1000", "Z125", "Z650", "Z900", "ZX-10R", "ZX-6R", "ZX-4R"],
  "KTM": ["125 Duke", "1290 Super Duke", "200 Duke", "390 Duke", "690 Duke", "790 Duke", "890 Duke", "EXC", "RC 390", "Super Adventure", "XC-W"],
  "Moto Guzzi": ["California", "Griso", "Le Mans", "MGX-21", "Stelvio", "V7", "V85 TT", "V9"],
  "Royal Enfield": ["Bullet", "Classic", "Continental GT", "Himalayan", "Interceptor", "Meteor", "Shotgun", "Super Meteor"],
  "Triumph": ["Bonneville", "Daytona", "Rocket 3", "Scrambler", "Speed Triple", "Speed Twin", "Street Triple", "Street Twin", "Tiger", "Thruxton", "Trident"],
  "Victory": ["Cross Country", "Cross Roads", "Gunner", "High-Ball", "Judge", "Kingpin", "Magnum", "Octane", "Vegas", "Vision"],
  "Yamaha": ["MT-07", "MT-09", "MT-10", "MT-125", "R1", "R125", "R15", "R3", "R6", "R7", "Super Tenere", "Ténéré 700", "Tracer 9", "VMAX", "WR450F", "XSR700", "XSR900", "YZF", "Stx125"],
  "Zero": ["DSR", "FX", "FXE", "SR", "SR/F", "SR/S", "SRS"],
}

const formatNumberWithCommas = (text: string) => {
  const digits = text.replace(/\D/g, "")
  if (!digits) return ""
  return Number(digits).toLocaleString()
}

const COLORS = [
  { label: "Red",    value: "#e74c3c" },
  { label: "Blue",   value: "#3498db" },
  { label: "Green",  value: "#1abc9c" },
  { label: "Yellow", value: "#f1c40f" },
  { label: "White",  value: "#e8e8e8" },
  { label: "Black",  value: "#2c2c2c" },
  { label: "Orange", value: "#e67e22" },
  { label: "Purple", value: "#9b59b6" },
]

const AddVehicleScreen = () => {
  const navigation: any = useNavigation()
  const route = useRoute()
  const category = (route.params as any)?.category || "Car"

  const [make, setMake] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [odometer, setOdometer] = useState("")
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value)
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [showMakeDropdown, setShowMakeDropdown] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)

  const makes = category === "Motorcycle" ? MOTORCYCLE_MAKES : CAR_MAKES
  const availableModels = make ? VEHICLE_MODELS[make] ?? [] : []

  const handlePickPhoto = async () => {
    const picked = await pickVehiclePhoto()
    if (picked) {
      setPhotoUri(picked)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoUri(null)
  }

  const handleSave = () => {
    if (!make || !model || !year || !odometer) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    const yearValue = parseInt(year, 10)
    const odometerValue = parseInt(odometer.replace(/,/g, ""), 10)

    if (isNaN(yearValue) || isNaN(odometerValue)) {
      Alert.alert("Error", "Year and odometer must be numbers")
      return
    }

    try {
      const insertedId = addVehicle({
        make,
        model,
        year: yearValue,
        odometer: odometerValue,
        color: selectedColor,
        category,
        photoUri: null,
      })

      if (photoUri) {
        const savedUri = saveVehiclePhoto(insertedId, photoUri)
        updateVehiclePhoto(insertedId, savedUri)
      }

      Alert.alert("Success", "Vehicle added!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (err) {
      console.log(err)
      Alert.alert("Error", "Could not add vehicle")
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add {category}</Text>
        <Text style={styles.subtitle}>Enter your vehicle details</Text>
      </View>

      {/* Photo Picker */}
      <View style={styles.photoContainer}>
        {photoUri ? (
          <View style={styles.photoPreviewWrapper}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <TouchableOpacity style={styles.removePhotoBadge} onPress={handleRemovePhoto}>
              <MaterialIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoPlaceholder} onPress={handlePickPhoto}>
            <MaterialIcons name="add-a-photo" size={32} color="#b8b8b8" />
            <Text style={styles.photoPlaceholderText}>Add Vehicle Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Make */}
      <View style={styles.section}>
        <Text style={styles.label}>Maker</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowMakeDropdown(!showMakeDropdown)}
        >
          <MaterialIcons name="directions-car" size={20} color="#b8b8b8" />
          <Text style={[styles.dropdownText, !make && { color: "#6c7278" }]}>
            {make || "Select a maker"}
          </Text>
          <MaterialIcons
            name={showMakeDropdown ? "expand-less" : "expand-more"}
            size={24}
            color="#b8b8b8"
          />
        </TouchableOpacity>

        {showMakeDropdown && (
          <View style={styles.dropdownMenu}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
              {makes.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMake(m)
                    setModel("")
                    setShowMakeDropdown(false)
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      make === m && styles.dropdownItemTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Model */}
      <View style={styles.section}>
        <Text style={styles.label}>Model</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            if (!make) {
              Alert.alert("Select Make", "Please select a make first.")
              return
            }
            setShowModelDropdown(!showModelDropdown)
          }}
        >
          <MaterialIcons name="info-outline" size={20} color="#b8b8b8" />
          <Text style={[styles.dropdownText, !model && { color: "#6c7278" }]}>
            {model || (make ? "Select a model" : "Select a make first")}
          </Text>
          <MaterialIcons
            name={showModelDropdown ? "expand-less" : "expand-more"}
            size={24}
            color="#b8b8b8"
          />
        </TouchableOpacity>

        {showModelDropdown && (
          <View style={styles.dropdownMenu}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
              {availableModels.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setModel(m)
                    setShowModelDropdown(false)
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      model === m && styles.dropdownItemTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Year */}
      <View style={styles.section}>
        <Text style={styles.label}>Year</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="calendar-today" size={20} color="#b8b8b8" />
          <TextInput
            style={styles.input}
            placeholder="e.g. 2020"
            placeholderTextColor="#6c7278"
            keyboardType="number-pad"
            value={year}
            onChangeText={setYear}
          />
        </View>
      </View>

      {/* Odometer */}
      <View style={styles.section}>
        <Text style={styles.label}>Odometer (miles)</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="speed" size={20} color="#b8b8b8" />
          <TextInput
            style={styles.input}
            placeholder="e.g. 45000"
            placeholderTextColor="#6c7278"
            keyboardType="number-pad"
            value={odometer}
            onChangeText={(text) => setOdometer(formatNumberWithCommas(text))}
          />
        </View>
      </View>

      {/* Color Picker */}
      <View style={styles.section}>
        <Text style={styles.label}>Color</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.colorSwatch,
                { backgroundColor: c.value },
                selectedColor === c.value && styles.colorSwatchSelected,
              ]}
              onPress={() => setSelectedColor(c.value)}
            >
              {selectedColor === c.value && (
                <MaterialIcons name="check" size={18} color={c.value === "#e8e8e8" ? "#3a3f47" : "#fff"} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Preview */}
        <View style={styles.previewRow}>
          <View style={[styles.previewIcon, { backgroundColor: selectedColor }]}>
            <MaterialIcons
              name={category === "Motorcycle" ? "two-wheeler" : "directions-car"}
              size={28}
              color={selectedColor === "#e8e8e8" ? "#3a3f47" : "#fff"}
            />
          </View>
          <Text style={styles.previewText}>
            {make || "Make"} {model || "Model"}
          </Text>
        </View>
      </View>

      {/* Save */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <MaterialIcons name="save" size={20} color="#3a3f47" />
        <Text style={styles.saveButtonText}>Add Vehicle</Text>
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3a3f47",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#e8e8e8",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#b8b8b8",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e8e8e8",
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: "#4a5057",
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dropdown: {
    backgroundColor: "#4a5057",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    color: "#e8e8e8",
    fontWeight: "500",
  },
  dropdownMenu: {
    backgroundColor: "#4a5057",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopColor: "#5a6168",
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3f47",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#b8b8b8",
  },
  dropdownItemTextActive: {
    color: "#e8e8e8",
    fontWeight: "600",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#e8e8e8",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: "#e8e8e8",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#4a5057",
    borderRadius: 10,
    padding: 14,
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  previewText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e8e8e8",
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoPreviewWrapper: {
    position: "relative",
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  removePhotoBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholder: {
    width: "100%",
    height: 140,
    backgroundColor: "#4a5057",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#5a6168",
    borderStyle: "dashed",
    gap: 8,
  },
  photoPlaceholderText: {
    color: "#b8b8b8",
    fontSize: 14,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3a3f47",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#6c7278",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 40,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#b8b8b8",
    textAlign: "center",
  },
})

export default AddVehicleScreen