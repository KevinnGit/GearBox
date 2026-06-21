import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useState } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { addVehicle } from "../database/db"

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

  const handleSave = () => {
    if (!make || !model || !year || !odometer) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    const yearValue = parseInt(year, 10)
    const odometerValue = parseInt(odometer, 10)

    if (isNaN(yearValue) || isNaN(odometerValue)) {
      Alert.alert("Error", "Year and odometer must be numbers")
      return
    }

    try {
      addVehicle({
        make,
        model,
        year: yearValue,
        odometer: odometerValue,
        color: selectedColor,
        category,
        photoUri: null,
      })

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

      {/* Make */}
      <View style={styles.section}>
        <Text style={styles.label}>Make</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="directions-car" size={20} color="#b8b8b8" />
          <TextInput
            style={styles.input}
            placeholder="e.g. Toyota"
            placeholderTextColor="#6c7278"
            value={make}
            onChangeText={setMake}
          />
        </View>
      </View>

      {/* Model */}
      <View style={styles.section}>
        <Text style={styles.label}>Model</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="info-outline" size={20} color="#b8b8b8" />
          <TextInput
            style={styles.input}
            placeholder="e.g. Supra"
            placeholderTextColor="#6c7278"
            value={model}
            onChangeText={setModel}
          />
        </View>
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
            onChangeText={setOdometer}
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