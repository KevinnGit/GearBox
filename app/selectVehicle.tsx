import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useEffect } from "react"
import { MaterialIcons } from "@expo/vector-icons"

// Sample vehicles data
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

const SelectVehicleScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const category = (route.params as any)?.category || "Car"

  const vehicles = vehiclesData[category as keyof typeof vehiclesData] || []

  useEffect(() => {
    navigation.setOptions({
      title: `Select Your ${category}`,
    })
  }, [category, navigation])

  const handleSelectVehicle = (vehicle: any) => {
    navigation.navigate("details", {
      vehicle,
      category,
    })
  }

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
            key={vehicle.id}
            style={styles.vehicleCard}
            onPress={() => handleSelectVehicle(vehicle)}
            activeOpacity={0.7}
          >
            {/* Vehicle Icon Circle */}
            <View
              style={[
                styles.vehicleIconContainer,
                { backgroundColor: vehicle.color },
              ]}
            >
              <MaterialIcons
                name={category === "Motorcycle" ? "two-wheeler" : "directions-car"}
                size={40}
                color="#fff"
              />
            </View>

            {/* Vehicle Info */}
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleYear}>{vehicle.year}</Text>
              <Text style={styles.vehicleMake}>{vehicle.make}</Text>
              <Text style={styles.vehicleModel}>{vehicle.model}</Text>
              <Text style={styles.vehicleOdometer}>
                📍 {vehicle.odometer.toLocaleString()} mi
              </Text>
            </View>

            {/* Arrow Icon */}
            <MaterialIcons
              name="arrow-forward-ios"
              size={20}
              color="#b8b8b8"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Add New Vehicle Button */}
      <TouchableOpacity style={styles.addNewButton}>
        <MaterialIcons name="add-circle-outline" size={20} color="#3a3f47" />
        <Text style={styles.addNewButtonText}>Add New {category}</Text>
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
