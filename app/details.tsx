import { ScrollView, Text, View, StyleSheet, Image, TouchableOpacity } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useEffect } from "react"

// Sample data for cars and motorcycles
const vehicleData = {
  car: [
    {
      id: 1,
      name: "Mitsubishi Evo 5",
      image: require("../assets/images/evo5.png"),
    },
    {
      id: 2,
      name: "Toyota Supra",
      image: require("../assets/images/evo5.png"),
    },
    {
      id: 3,
      name: "Nissan Skyline",
      image: require("../assets/images/evo5.png"),
    },
  ],
  motorcycle: [
    {
      id: 1,
      name: "Honda Fireblade",
      image: require("../assets/images/fireblade.png"),
    },
    {
      id: 2,
      name: "Yamaha YZF-R1",
      image: require("../assets/images/fireblade.png"),
    },
    {
      id: 3,
      name: "Kawasaki Ninja",
      image: require("../assets/images/fireblade.png"),
    },
  ],
}

const DetailsScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const category = (route.params as any)?.category || "car"

  const vehicles =
    category.toLowerCase() === "car"
      ? vehicleData.car
      : vehicleData.motorcycle

  useEffect(() => {
    navigation.setOptions({
      title: category,
    })
  }, [category, navigation])

  const handleAddVehicle = (vehicleId: number) => {
    console.log(`Added vehicle ${vehicleId} from ${category}`)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{category}</Text>
        <Text style={styles.subtitle}>
          {vehicles.length} {category.toLowerCase()}(s) available
        </Text>
      </View>

      <View style={styles.vehiclesContainer}>
        {vehicles.map((vehicle) => (
          <View key={vehicle.id} style={styles.vehicleCard}>
            <Image
              source={vehicle.image}
              style={styles.vehicleImage}
            />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddVehicle(vehicle.id)}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
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
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "500",
    color: "#e8e8e8",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#b8b8b8",
    marginTop: 8,
  },
  vehiclesContainer: {
    gap: 16,
    paddingBottom: 40,
  },
  vehicleCard: {
    backgroundColor: "#4a5057",
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  vehicleImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    resizeMode: "cover",
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e8e8e8",
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#6c7278",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e8e8e8",
  },
})

export default DetailsScreen
