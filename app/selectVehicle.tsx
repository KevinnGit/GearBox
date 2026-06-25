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
  ActivityIndicator,
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
import { getCachedMakesSync, getCachedModelsSync, refreshMakes, refreshModels } from "../utils/vehicleApi"

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

  const [makes, setMakes] = useState<string[]>([])
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [makeSearch, setMakeSearch] = useState("")
  const [modelSearch, setModelSearch] = useState("")
  const [loadingMakes, setLoadingMakes] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)

  const filteredMakes = makeSearch
    ? makes.filter((m) => m.toLowerCase().includes(makeSearch.toLowerCase()))
    : makes

  const filteredModels = modelSearch
    ? availableModels.filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase()))
    : availableModels

  useEffect(() => {
    if (!modalVisible) return
    setMakeSearch("")
    setModelSearch("")
    setMakes(getCachedMakesSync(category))
    setLoadingMakes(false)
    refreshMakes(category).then((list) => {
      setMakes(list)
    })
  }, [modalVisible, category])

  useEffect(() => {
    if (!editingVehicle?.make) {
      setAvailableModels([])
      return
    }
    setModelSearch("")
    setAvailableModels(getCachedModelsSync(editingVehicle.make))
    setLoadingModels(false)
    refreshModels(editingVehicle.make).then((list) => {
      setAvailableModels(list)
    })
  }, [editingVehicle?.make])

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
                <View style={styles.modalSearchInputContainer}>
                  <MaterialIcons name="search" size={16} color="#999" />
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder="Search maker..."
                    placeholderTextColor="#999"
                    value={makeSearch}
                    onChangeText={setMakeSearch}
                    autoFocus
                  />
                </View>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  {loadingMakes ? (
                    <View style={styles.modalLoadingRow}>
                      <ActivityIndicator size="small" color="#999" />
                      <Text style={styles.modalLoadingText}>Loading makers...</Text>
                    </View>
                  ) : filteredMakes.length === 0 ? (
                    <Text style={styles.modalEmptyText}>No makers found</Text>
                  ) : (
                    filteredMakes.map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={styles.modalDropdownItem}
                        onPress={() => {
                          setEditingVehicle((prev) =>
                            prev ? { ...prev, make: m, model: "" } : prev
                          )
                          setMakeSearch("")
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
                    ))
                  )}
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
                <View style={styles.modalSearchInputContainer}>
                  <MaterialIcons name="search" size={16} color="#999" />
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder="Search model..."
                    placeholderTextColor="#999"
                    value={modelSearch}
                    onChangeText={setModelSearch}
                    autoFocus
                  />
                </View>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  {loadingModels ? (
                    <View style={styles.modalLoadingRow}>
                      <ActivityIndicator size="small" color="#999" />
                      <Text style={styles.modalLoadingText}>Loading models...</Text>
                    </View>
                  ) : filteredModels.length === 0 ? (
                    <Text style={styles.modalEmptyText}>No models found</Text>
                  ) : (
                    filteredModels.map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={styles.modalDropdownItem}
                        onPress={() => {
                          setEditingVehicle((prev) =>
                            prev ? { ...prev, model: m } : prev
                          )
                          setModelSearch("")
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
                    ))
                  )}
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
    maxHeight: 260,
  },
  modalSearchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    paddingVertical: 4,
  },

  modalLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalLoadingText: {
    fontSize: 13,
    color: "#999",
  },
  modalEmptyText: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#999",
    textAlign: "center",
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
