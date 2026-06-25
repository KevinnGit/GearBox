import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { addVehicle, updateVehiclePhoto } from "../database/db"
import { pickVehiclePhoto, saveVehiclePhoto } from "../utils/vehiclePhoto"
import { getCachedMakesSync, getCachedModelsSync, refreshMakes, refreshModels } from "../utils/vehicleApi"

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

  const [makes, setMakes] = useState<string[]>([])
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [makeSearch, setMakeSearch] = useState("")
  const [modelSearch, setModelSearch] = useState("")
  const [loadingMakes, setLoadingMakes] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)

  const filteredMakes = makeSearch
    ? makes.filter((m) => m.toLowerCase().includes(makeSearch.toLowerCase()))
    : makes

  const filteredModels = modelSearch
    ? availableModels.filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase()))
    : availableModels

  useEffect(() => {
    setMake("")
    setModel("")
    setMakeSearch("")
    setModelSearch("")
    setAvailableModels([])
    setMakes(getCachedMakesSync(category))
    setLoadingMakes(false)
    refreshMakes(category).then((list) => {
      setMakes(list)
    })
  }, [category])

  useEffect(() => {
    if (!make) {
      setAvailableModels([])
      return
    }
    setModel("")
    setModelSearch("")
    setAvailableModels(getCachedModelsSync(make))
    setLoadingModels(false)
    refreshModels(make).then((list) => {
      setAvailableModels(list)
    })
  }, [make])

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
            <View style={styles.searchInputContainer}>
              <MaterialIcons name="search" size={18} color="#6c7278" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search maker..."
                placeholderTextColor="#6c7278"
                value={makeSearch}
                onChangeText={setMakeSearch}
                autoFocus
              />
            </View>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
              {filteredMakes.length === 0 ? (
                <Text style={styles.emptyText}>No makers found</Text>
              ) : (
                filteredMakes.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setMake(m)
                      setMakeSearch("")
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
                ))
              )}
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
            <View style={styles.searchInputContainer}>
              <MaterialIcons name="search" size={18} color="#6c7278" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search model..."
                placeholderTextColor="#6c7278"
                value={modelSearch}
                onChangeText={setModelSearch}
                autoFocus
              />
            </View>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
              {loadingModels ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#b8b8b8" />
                  <Text style={styles.loadingText}>Loading models...</Text>
                </View>
              ) : filteredModels.length === 0 ? (
                <Text style={styles.emptyText}>No models found</Text>
              ) : (
                filteredModels.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setModel(m)
                      setModelSearch("")
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
                ))
              )}
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
    maxHeight: 260,
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopColor: "#5a6168",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#5a6168",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#e8e8e8",
    paddingVertical: 4,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  loadingText: {
    fontSize: 13,
    color: "#b8b8b8",
  },
  emptyText: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 13,
    color: "#6c7278",
    textAlign: "center",
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