import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
  ScrollView,
} from "react-native"
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native"
import { useEffect, useState, useCallback } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { FlatList } from "react-native"
import {
  addVehicle as addVehicleToDb,
  deleteVehicle as deleteVehicleFromDb,
  getVehiclesByCategory,
  seedVehiclesIfEmpty,
  updateVehicle,
  type Vehicle,
} from "../database/db"
import {
  deleteVehiclePhotoFile,
  pickVehiclePhoto,
  saveVehiclePhoto,
} from "../utils/vehiclePhoto"

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
  "Yamaha": ["MT-07", "MT-09", "MT-10", "MT-125", "R1", "R125", "R15", "R3", "R6", "R7", "Super Tenere", "Ténéré 700", "Tracer 9", "VMAX", "WR450F", "XSR700", "XSR900", "YZF"],
  "Zero": ["DSR", "FX", "FXE", "SR", "SR/F", "SR/S", "SRS"],
}

const vehiclesData = {
  Car: [
    { make: "Mitsubishi", model: "Evo 5", year: 2001, odometer: 45200, color: "#e74c3c", photoUri: null, category: "Car" },
    { make: "Toyota", model: "Supra", year: 1998, odometer: 67500, color: "#f39c12", photoUri: null, category: "Car" },
  ],
  Motorcycle: [
    { make: "Honda", model: "Fireblade", year: 2008, odometer: 24500, color: "#e74c3c", photoUri: null, category: "Motorcycle" },
    { make: "Yamaha", model: "R1", year: 2015, odometer: 12300, color: "#f39c12", photoUri: null, category: "Motorcycle" },
  ],
}

const SelectVehicleScreen = () => {
  const route = useRoute()
  const navigation: any = useNavigation()
  const category = (route.params as any)?.category || "Car"

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [showMakeDropdown, setShowMakeDropdown] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)

  const makes = category === "Motorcycle" ? MOTORCYCLE_MAKES : CAR_MAKES
  const availableModels = editingVehicle?.make ? VEHICLE_MODELS[editingVehicle.make] ?? [] : []

  const loadVehicles = () => {
    try {
      const defaults = vehiclesData[category as keyof typeof vehiclesData] || []
      const data = seedVehiclesIfEmpty(category, defaults)
      setVehicles(data)
    } catch (err) {
      console.log(err)
    }
  }

  const addVehicle = () => {
    navigation.navigate("addVehicle", { category })
  }

  const deleteVehicle = (id: number) => {
    const vehicleToDelete = vehicles.find((v) => v.id === id)
    const photoUri = vehicleToDelete?.photoUri
    Alert.alert("Delete Vehicle", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          try {
            if (photoUri) {
              deleteVehiclePhotoFile(photoUri)
            }
            deleteVehicleFromDb(id)
            loadVehicles()
          } catch (err) {
            console.log(err)
            Alert.alert("Error", "Could not delete vehicle")
          }
        },
      },
    ])
  }

  const openEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setModalVisible(true)
  }

  const saveEdit = () => {
    if (!editingVehicle) return

    try {
      updateVehicle(editingVehicle)
      loadVehicles()
      setModalVisible(false)
      setEditingVehicle(null)
    } catch (err) {
      console.log(err)
      Alert.alert("Error", "Could not save changes")
    }
  }

  const handleUploadPhoto = async () => {
    if (!editingVehicle) return

    const pickedUri = await pickVehiclePhoto()
    if (!pickedUri) return

    try {
      const savedUri = saveVehiclePhoto(editingVehicle.id, pickedUri)
      setEditingVehicle({ ...editingVehicle, photoUri: savedUri })
    } catch (err) {
      console.log(err)
      Alert.alert("Error", "Could not save photo")
    }
  }

  const handleRemovePhoto = () => {
    const photoUri = editingVehicle?.photoUri
    if (!photoUri) return

    Alert.alert("Remove Photo", "Remove this vehicle photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          deleteVehiclePhotoFile(photoUri)
          setEditingVehicle({ ...editingVehicle, photoUri: null })
        },
      },
    ])
  }

  const renderVehicleThumbnail = (item: Vehicle) => {
    if (item.photoUri) {
      return <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
    }

    return (
      <View style={[styles.icon, { backgroundColor: item.color || "#1abc9c" }]}>
        <MaterialIcons
          name={category === "Motorcycle" ? "two-wheeler" : "directions-car"}
          size={30}
          color="#fff"
        />
      </View>
    )
  }

  const openDetails = (vehicle: Vehicle) => {
    navigation.navigate("details", { vehicle, category })
  }

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: `Select Your ${category}`,
      })
      loadVehicles()
    }, [category])
  )

  const renderItem = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity style={styles.card} onPress={() => openDetails(item)}>
      {renderVehicleThumbnail(item)}

      <View style={styles.info}>
        <Text style={styles.year}>{item.year}</Text>
        <Text style={styles.make}>{item.make}</Text>
        <Text style={styles.model}>{item.model}</Text>
        <Text style={styles.odometer}>
          📍 {item.odometer.toLocaleString()} mi
        </Text>
      </View>

      <TouchableOpacity onPress={() => openEdit(item)}>
        <MaterialIcons name="edit" size={22} color="#f1c40f" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => deleteVehicle(item.id)}>
        <MaterialIcons name="delete" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addVehicle}>
        <MaterialIcons name="add" size={20} color="#fff" />
        <Text style={{ color: "#fff", marginLeft: 6 }}>Add Vehicle</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>
              Edit Vehicle
            </Text>

            <TouchableOpacity
              style={styles.modalDropdown}
              onPress={() => setShowMakeDropdown(!showMakeDropdown)}
            >
              <Text style={[styles.modalDropdownText, !editingVehicle?.make && { color: "#999" }]}>
                {editingVehicle?.make || "Select make"}
              </Text>
              <MaterialIcons
                name={showMakeDropdown ? "expand-less" : "expand-more"}
                size={22}
                color="#999"
              />
            </TouchableOpacity>

            {showMakeDropdown && (
              <View style={styles.modalDropdownMenu}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  {makes.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={styles.modalDropdownItem}
                      onPress={() => {
                        setEditingVehicle((prev) =>
                          prev ? { ...prev, make: m, model: "" } : prev
                        )
                        setShowMakeDropdown(false)
                        setShowModelDropdown(false)
                      }}
                    >
                      <Text
                        style={[
                          styles.modalDropdownItemText,
                          editingVehicle?.make === m && styles.modalDropdownItemTextActive,
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalDropdown}
              onPress={() => {
                if (!editingVehicle?.make) {
                  Alert.alert("Select Make", "Please select a make first.")
                  return
                }
                setShowModelDropdown(!showModelDropdown)
              }}
            >
              <Text style={[styles.modalDropdownText, !editingVehicle?.model && { color: "#999" }]}>
                {editingVehicle?.model || (editingVehicle?.make ? "Select model" : "Select a make first")}
              </Text>
              <MaterialIcons
                name={showModelDropdown ? "expand-less" : "expand-more"}
                size={22}
                color="#999"
              />
            </TouchableOpacity>

            {showModelDropdown && (
              <View style={styles.modalDropdownMenu}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  {availableModels.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={styles.modalDropdownItem}
                      onPress={() => {
                        setEditingVehicle((prev) =>
                          prev ? { ...prev, model: m } : prev
                        )
                        setShowModelDropdown(false)
                      }}
                    >
                      <Text
                        style={[
                          styles.modalDropdownItemText,
                          editingVehicle?.model === m && styles.modalDropdownItemTextActive,
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.photoSection}>
              {editingVehicle?.photoUri ? (
                <Image
                  source={{ uri: editingVehicle.photoUri }}
                  style={styles.photoPreview}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <MaterialIcons name="photo-camera" size={28} color="#999" />
                  <Text style={styles.photoPlaceholderText}>
                    No photo yet
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.photoBtn}
                onPress={handleUploadPhoto}
              >
                <MaterialIcons name="add-a-photo" size={18} color="#fff" />
                <Text style={styles.photoBtnText}>Upload Photo</Text>
              </TouchableOpacity>

              {editingVehicle?.photoUri ? (
                <TouchableOpacity onPress={handleRemovePhoto}>
                  <Text style={styles.removePhotoText}>Remove Photo</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 10, textAlign: "center", color: "#666" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3a3f47",
    padding: 15,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4a5057",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
  },

  icon: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },

  info: {
    flex: 1,
  },

  year: { color: "#aaa", fontSize: 12 },
  make: { color: "#fff", fontSize: 16, fontWeight: "600" },
  model: { color: "#bbb" },
  odometer: { color: "#999", fontSize: 12 },

  addBtn: {
    flexDirection: "row",
    backgroundColor: "#1abc9c",
    padding: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
  },

  modalDropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
  },

  modalDropdownText: {
    fontSize: 14,
    color: "#333",
  },

  modalDropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
  },

  modalDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  modalDropdownItemText: {
    fontSize: 14,
    color: "#333",
  },

  modalDropdownItemTextActive: {
    color: "#1abc9c",
    fontWeight: "600",
  },

  photoSection: {
    marginTop: 14,
    alignItems: "center",
    gap: 10,
  },

  photoPreview: {
    width: "100%",
    height: 160,
    borderRadius: 8,
  },

  photoPlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  photoPlaceholderText: {
    color: "#999",
    fontSize: 13,
  },

  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3a3f47",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },

  photoBtnText: {
    color: "#fff",
    fontWeight: "600",
  },

  removePhotoText: {
    color: "#e74c3c",
    fontSize: 13,
  },

  saveBtn: {
    backgroundColor: "#1abc9c",
    padding: 12,
    marginTop: 15,
    alignItems: "center",
    borderRadius: 8,
  },
})

export default SelectVehicleScreen
