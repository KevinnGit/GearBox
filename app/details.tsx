import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Image, Alert } from "react-native"
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native"
import { useCallback, useState } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import {
  getServicesByVehicleId,
  getVehiclesByCategory,
  updateVehiclePhoto,
  type Service,
} from "../database/db"
import { pickVehiclePhoto, saveVehiclePhoto, deleteVehiclePhotoFile } from "../utils/vehiclePhoto"

const DetailsScreen = () => {
  const route = useRoute()
  const navigation: any = useNavigation()
  const initialVehicle = (route.params as any)?.vehicle
  const category = (route.params as any)?.category || "Car"
  const [vehicle, setVehicle] = useState(initialVehicle)
  const [maintenance, setMaintenance] = useState<Service[]>([])

  const loadData = useCallback(() => {
    if (!initialVehicle?.id) return

    const services = getServicesByVehicleId(initialVehicle.id)
    setMaintenance(services)

    const vehicles = getVehiclesByCategory(category)
    const updatedVehicle = vehicles.find((v) => v.id === initialVehicle.id)
    if (updatedVehicle) {
      setVehicle(updatedVehicle)
    }
  }, [initialVehicle?.id, category])

  const handleUploadPhoto = async () => {
    if (!vehicle?.id) return

    const pickedUri = await pickVehiclePhoto()
    if (!pickedUri) return

    try {
      if (vehicle.photoUri) {
        deleteVehiclePhotoFile(vehicle.photoUri)
      }

      const savedUri = saveVehiclePhoto(vehicle.id, pickedUri)
      updateVehiclePhoto(vehicle.id, savedUri)
      setVehicle({ ...vehicle, photoUri: savedUri })
    } catch (error) {
      console.log(error)
      Alert.alert("Error", "Could not save photo")
    }
  }

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: "My Ride",
      })
      loadData()
    }, [navigation, loadData])
  )

  const handleLogService = () => {
    navigation.navigate("addService", {
      vehicle,
      category,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!vehicle) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <Text style={styles.noMaintenanceText}>Vehicle not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* My Ride Header */}
      <View style={styles.rideHeader}>
        <View style={styles.vehicleImageContainer}>
          {vehicle.photoUri ? (
            <Image source={{ uri: vehicle.photoUri }} style={styles.vehiclePhoto} />
          ) : (
            <MaterialIcons
              name={category === "Motorcycle" ? "two-wheeler" : "directions-car"}
              size={80}
              color="#e8e8e8"
            />
          )}
        </View>
        
        <View style={styles.vehicleDetails}>
          <Text style={styles.year}>{vehicle.year}</Text>
          <Text style={styles.make}>{vehicle.make}</Text>
          <Text style={styles.model}>{vehicle.model}</Text>
        </View>
      </View>

      {/* Odometer Section */}
      <View style={styles.odometerSection}>
        <Text style={styles.odometerLabel}>Current Odometer</Text>
        <Text style={styles.odometerValue}>{vehicle.odometer.toLocaleString()} mi</Text>
      </View>

      {/* Upload Photo Button */}
      <TouchableOpacity
        style={styles.uploadPhotoButton}
        onPress={handleUploadPhoto}
      >
        <MaterialIcons name="add-a-photo" size={20} color="#e8e8e8" />
        <Text style={styles.uploadPhotoButtonText}>
          {vehicle.photoUri ? "Change Vehicle Photo" : "Upload Vehicle Photo"}
        </Text>
      </TouchableOpacity>

      {/* Log Service Button */}
      <TouchableOpacity
        style={styles.logServiceButton}
        onPress={handleLogService}
      >
        <MaterialIcons name="add-circle" size={20} color="#3a3f47" />
        <Text style={styles.logServiceButtonText}>Log a Service</Text>
      </TouchableOpacity>

      {/* Maintenance Log Header */}
      <View style={styles.maintenanceHeader}>
        <Text style={styles.maintenanceTitle}>Maintenance Log</Text>
        <Text style={styles.maintenanceCount}>{maintenance.length} records</Text>
      </View>

      {/* Maintenance List */}
      <View style={styles.maintenanceList}>
        {maintenance.length > 0 ? (
          maintenance.map((item) => (
            <View key={item.id} style={styles.maintenanceItem}>
              <View style={styles.serviceIcon}>
                <MaterialIcons name="build" size={20} color="#e8e8e8" />
              </View>
              
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceName}>{item.serviceType}</Text>
                <View style={styles.serviceMetadata}>
                  <Text style={styles.serviceMeta}>
                    📍 {item.mileage.toLocaleString()} mi
                  </Text>
                  <Text style={styles.serviceMeta}>
                    📅 {formatDate(item.date)}
                  </Text>
                </View>
              </View>

              <View style={styles.costContainer}>
                <Text style={styles.cost}>₱{item.cost.toFixed(2)}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noMaintenanceText}>
            No maintenance records yet. Start logging!
          </Text>
        )}
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
  rideHeader: {
    backgroundColor: "#4a5057",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  vehicleImageContainer: {
    width: 140,
    height: 140,
    backgroundColor: "#3a3f47",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  vehiclePhoto: {
    width: "100%",
    height: "100%",
  },
  uploadPhotoButton: {
    backgroundColor: "#4a5057",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#5a6168",
  },
  uploadPhotoButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e8e8e8",
  },
  vehicleDetails: {
    alignItems: "center",
  },
  year: {
    fontSize: 14,
    color: "#b8b8b8",
    marginBottom: 4,
  },
  make: {
    fontSize: 24,
    fontWeight: "600",
    color: "#e8e8e8",
  },
  model: {
    fontSize: 18,
    fontWeight: "400",
    color: "#b8b8b8",
  },
  odometerSection: {
    backgroundColor: "#4a5057",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  odometerLabel: {
    fontSize: 14,
    color: "#b8b8b8",
    marginBottom: 8,
  },
  odometerValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#e8e8e8",
  },
  logServiceButton: {
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logServiceButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3a3f47",
  },
  maintenanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  maintenanceTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e8e8e8",
  },
  maintenanceCount: {
    fontSize: 14,
    color: "#b8b8b8",
  },
  maintenanceList: {
    gap: 12,
    paddingBottom: 40,
  },
  maintenanceItem: {
    backgroundColor: "#4a5057",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#3a3f47",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e8e8e8",
    marginBottom: 6,
  },
  serviceMetadata: {
    gap: 6,
  },
  serviceMeta: {
    fontSize: 12,
    color: "#b8b8b8",
  },
  costContainer: {
    alignItems: "flex-end",
  },
  cost: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e8e8e8",
  },
  noMaintenanceText: {
    fontSize: 14,
    color: "#b8b8b8",
    textAlign: "center",
    marginVertical: 20,
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
  },
})

export default DetailsScreen
