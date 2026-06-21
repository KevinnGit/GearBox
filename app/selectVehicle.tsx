import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
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

const vehiclesData = {
  Car: [
    { make: "Mitsubishi", model: "Evo 5", year: 2001, odometer: 45200, color: "#e74c3c", photoUri: null },
    { make: "Toyota", model: "Supra", year: 1998, odometer: 67500, color: "#f39c12", photoUri: null },
  ],
  Motorcycle: [
    { make: "Honda", model: "Fireblade", year: 2008, odometer: 24500, color: "#e74c3c", photoUri: null },
    { make: "Yamaha", model: "R1", year: 2015, odometer: 12300, color: "#f39c12", photoUri: null },
  ],
}

const SelectVehicleScreen = () => {
  const route = useRoute()
  const navigation: any = useNavigation()
  const category = (route.params as any)?.category || "Car"

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

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
    const addVehicle = () => {
      navigation.navigate("addVehicle", { category })
    }
  }

  const deleteVehicle = (id: number) => {
    Alert.alert("Delete Vehicle", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          try {
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
    if (!editingVehicle?.photoUri) return

    Alert.alert("Remove Photo", "Remove this vehicle photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          deleteVehiclePhotoFile(editingVehicle.photoUri)
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

  useEffect(() => {
    navigation.setOptions({
      title: `Select Your ${category}`,
    })

    loadVehicles()
  }, [category])

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

            <TextInput
              placeholder="Make"
              value={editingVehicle?.make}
              onChangeText={(text) =>
                setEditingVehicle((prev) =>
                  prev ? { ...prev, make: text } : prev
                )
              }
              style={styles.input}
            />

            <TextInput
              placeholder="Model"
              value={editingVehicle?.model}
              onChangeText={(text) =>
                setEditingVehicle((prev) =>
                  prev ? { ...prev, model: text } : prev
                )
              }
              style={styles.input}
            />

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
              <Text style={{ marginTop: 10 }}>Cancel</Text>
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
    resizeMode: "cover",
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

  saveBtn: {
    backgroundColor: "#1abc9c",
    padding: 12,
    marginTop: 15,
    alignItems: "center",
    borderRadius: 8,
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
    resizeMode: "cover",
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
})

export default SelectVehicleScreen
