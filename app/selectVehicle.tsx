import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

// ---------------- TYPES ----------------
type Vehicle = {
  id: number
  make: string
  model: string
  year: number
  odometer: number
  color: string
}

// ---------------- SAMPLE DATA ----------------
const vehiclesData = {
  Car: [
    {
      id: 1,
      make: "Mitsubishi",
      model: "Evo 5",
      year: 2001,
      odometer: 45200,
      color: "#e74c3c",
    },
    {
      id: 2,
      make: "Toyota",
      model: "Supra",
      year: 1998,
      odometer: 67500,
      color: "#f39c12",
    },
    {
      id: 3,
      make: "Nissan",
      model: "Skyline R34",
      year: 1999,
      odometer: 52300,
      color: "#3498db",
    },
    {
      id: 4,
      make: "Honda",
      model: "Civic Type R",
      year: 2005,
      odometer: 38900,
      color: "#9b59b6",
    },
    {
      id: 5,
      make: "Subaru",
      model: "Impreza WRX",
      year: 2003,
      odometer: 72400,
      color: "#2ecc71",
    },
  ],
  Motorcycle: [
    {
      id: 1,
      make: "Honda",
      model: "Fireblade",
      year: 2008,
      odometer: 24500,
      color: "#e74c3c",
    },
    {
      id: 2,
      make: "Yamaha",
      model: "YZF-R1",
      year: 2015,
      odometer: 12300,
      color: "#f39c12",
    },
    {
      id: 3,
      make: "Kawasaki",
      model: "Ninja H2",
      year: 2020,
      odometer: 8900,
      color: "#2ecc71",
    },
    {
      id: 4,
      make: "Ducati",
      model: "Panigale V4",
      year: 2021,
      odometer: 5600,
      color: "#e91e63",
    },
  ],
}

// ---------------- COMPONENT ----------------
const SelectVehicleScreen = () => {
  const route = useRoute()
  const navigation: any = useNavigation()

  const category = (route.params as any)?.category || "Car"

  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const STORAGE_KEY = `vehicles_${category}`

  // ---------------- LOAD ----------------
  const loadVehicles = async () => {
    try {
      const savedVehicles = await AsyncStorage.getItem(STORAGE_KEY)

      if (savedVehicles) {
        setVehicles(JSON.parse(savedVehicles))
      } else {
        const defaultVehicles =
          vehiclesData[category as keyof typeof vehiclesData] || []

        setVehicles(defaultVehicles)

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(defaultVehicles)
        )
      }
    } catch (error) {
      console.log("Load Error:", error)
    }
  }

  // ---------------- ADD VEHICLE ----------------
  const handleAddVehicle = async () => {
    try {
      const newVehicle: Vehicle = {
        id: Date.now(),
        make: "Toyota",
        model: `Vehicle ${vehicles.length + 1}`,
        year: 2025,
        odometer: 0,
        color: "#1abc9c",
      }

      const updatedVehicles = [...vehicles, newVehicle]

      setVehicles(updatedVehicles)

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedVehicles)
      )
    } catch (error) {
      console.log("Save Error:", error)
    }
  }

  // ---------------- EFFECT ----------------
  useEffect(() => {
    navigation.setOptions({
      title: `Select Your ${category}`,
    })

    loadVehicles()
  }, [category])

  // ---------------- SELECT ----------------
  const handleSelectVehicle = (vehicle: Vehicle) => {
    navigation.navigate("details", {
      vehicle,
      category,
    })
  }

  // ---------------- UI ----------------
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My {category}s</Text>
        <Text style={styles.subtitle}>
          {vehicles.length} {category.toLowerCase()}(s) available
        </Text>
      </View>

      <View style={styles.vehiclesList}>
        {vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id.toString()}
            style={styles.vehicleCard}
            onPress={() => handleSelectVehicle(vehicle)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.vehicleIconContainer,
                { backgroundColor: vehicle.color || "#ccc" },
              ]}
            >
              <MaterialIcons
                name={
                  category === "Motorcycle"
                    ? "two-wheeler"
                    : "directions-car"
                }
                size={40}
                color="#fff"
              />
            </View>

            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleYear}>{vehicle.year}</Text>
              <Text style={styles.vehicleMake}>{vehicle.make}</Text>
              <Text style={styles.vehicleModel}>{vehicle.model}</Text>
              <Text style={styles.vehicleOdometer}>
                📍 {vehicle.odometer?.toLocaleString() || "0"} mi
              </Text>
            </View>

            <MaterialIcons
              name="arrow-forward-ios"
              size={20}
              color="#b8b8b8"
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.addNewButton}
        onPress={handleAddVehicle}
      >
        <MaterialIcons name="add-circle-outline" size={20} color="#3a3f47" />
        <Text style={styles.addNewButtonText}>
          Add New {category}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3a3f47",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#e8e8e8",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#b8b8b8",
  },
  vehiclesList: {
    gap: 12,
    marginBottom: 24,
  },
  vehicleCard: {
    backgroundColor: "#4a5057",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  vehicleIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: "center",
  },
  vehicleYear: {
    fontSize: 12,
    color: "#b8b8b8",
    marginBottom: 2,
  },
  vehicleMake: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e8e8e8",
  },
  vehicleModel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#b8b8b8",
    marginBottom: 6,
  },
  vehicleOdometer: {
    fontSize: 12,
    color: "#9b9b9b",
  },
  addNewButton: {
    backgroundColor: "#e8e8e8",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 40,
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3a3f47",
  },
})

export default SelectVehicleScreen