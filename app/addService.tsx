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

const serviceTypes = [
  "Oil Change",
  "Tire Rotation",
  "Brake Pads",
  "Air Filter",
  "Battery",
  "Spark Plugs",
  "Coolant Flush",
  "Transmission Fluid",
  "Other",
]

const AddServiceScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const vehicle = (route.params as any)?.vehicle
  const category = (route.params as any)?.category || "Car"

  const [serviceType, setServiceType] = useState(serviceTypes[0])
  const [mileage, setMileage] = useState("")
  const [cost, setCost] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)

  const handleSaveService = () => {
    console.log("Service button pressed")
    
    if (!mileage || !cost || !date) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    console.log({
      serviceType,
      mileage: parseInt(mileage),
      cost: parseFloat(cost),
      date,
      vehicle: `${vehicle.make} ${vehicle.model}`,
      category,
    })

    Alert.alert("Success", "Service logged successfully!", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ])
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log a Service</Text>
        <Text style={styles.subtitle}>Track your {category} maintenance</Text>
      </View>

      {/* Service Type */}
      <View style={styles.section}>
        <Text style={styles.label}>Service Type</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowServiceDropdown(!showServiceDropdown)}
        >
          <Text style={styles.dropdownText}>{serviceType}</Text>
          <MaterialIcons
            name={showServiceDropdown ? "expand-less" : "expand-more"}
            size={24}
            color="#b8b8b8"
          />
        </TouchableOpacity>

        {showServiceDropdown && (
          <View style={styles.dropdownMenu}>
            {serviceTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.dropdownItem}
                onPress={() => {
                  setServiceType(type)
                  setShowServiceDropdown(false)
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    serviceType === type && styles.dropdownItemTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Mileage/Odometer */}
      <View style={styles.section}>
        <Text style={styles.label}>Mileage (miles)</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="speedometer" size={20} color="#b8b8b8" />
          <TextInput
            style={styles.input}
            placeholder="Enter current odometer reading"
            placeholderTextColor="#6c7278"
            keyboardType="number-pad"
            value={mileage}
            onChangeText={setMileage}
          />
        </View>
      </View>

      {/* Cost */}
      <View style={styles.section}>
        <Text style={styles.label}>Cost</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter service cost"
            placeholderTextColor="#6c7278"
            keyboardType="decimal-pad"
            value={cost}
            onChangeText={setCost}
          />
        </View>
      </View>

      {/* Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="calendar-today" size={20} color="#b8b8b8" />
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#6c7278"
            value={date}
            onChangeText={setDate}
          />
        </View>
        <Text style={styles.hint}>Format: YYYY-MM-DD (e.g., 2024-06-14)</Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveService}
      >
        <MaterialIcons name="save" size={20} color="#3a3f47" />
        <Text style={styles.saveButtonText}>Save Service</Text>
      </TouchableOpacity>

      {/* Cancel Button */}
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
  dropdown: {
    backgroundColor: "#4a5057",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 14,
    color: "#e8e8e8",
    fontWeight: "500",
  },
  dropdownMenu: {
    backgroundColor: "#4a5057",
    borderRadius: 8,
    marginTop: 4,
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
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#b8b8b8",
  },
  hint: {
    fontSize: 12,
    color: "#6c7278",
    marginTop: 6,
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

export default AddServiceScreen
