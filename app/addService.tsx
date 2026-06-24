import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useState } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { addService, updateVehicle } from "../database/db"

const formatNumberWithCommas = (text: string) => {
  const digits = text.replace(/\D/g, "")
  if (!digits) return ""
  return Number(digits).toLocaleString()
}

const formatCostWithCommas = (text: string) => {
  const cleaned = text.replace(/[^0-9.]/g, "")
  const dotCount = (cleaned.match(/\./g) || []).length
  if (dotCount > 1) return text

  const parts = cleaned.split(".")
  const integerPart = parts[0].replace(/,/g, "")
  const decimalPart = parts[1]

  if (!integerPart) return cleaned

  const formattedInteger = Number(integerPart).toLocaleString()

  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`
  }

  return formattedInteger
}

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
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)

  const onDateChange = (_event: DateTimePickerEvent, pickedDate?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false)
    if (pickedDate) {
      setSelectedDate(pickedDate)
      setDate(pickedDate.toISOString().split("T")[0])
    }
  }

  const handleSaveService = () => {
    if (!vehicle?.id) {
      Alert.alert("Error", "No vehicle selected")
      return
    }

    if (!mileage || !cost || !date) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    const rawMileage = mileage.replace(/,/g, "")
    const mileageValue = parseInt(rawMileage, 10)
    const costValue = parseFloat(cost.replace(/,/g, ""))

    if (isNaN(mileageValue) || isNaN(costValue)) {
      Alert.alert("Error", "Please enter valid mileage and cost values")
      return
    }

    if (mileageValue < vehicle.odometer) {
      Alert.alert(
        "Invalid Odometer",
        `Service mileage (${mileageValue.toLocaleString()} mi) cannot be less than the current odometer (${vehicle.odometer.toLocaleString()} mi).`
      )
      return
    }

    try {
      addService({
        vehicleId: vehicle.id,
        serviceType,
        mileage: mileageValue,
        cost: costValue,
        date,
        notes: null,
      })

      updateVehicle({ ...vehicle, odometer: mileageValue })

      Alert.alert("Success", "Service logged successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.log(error)
      Alert.alert("Error", "Could not save service. Please try again.")
    }
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
          <MaterialIcons name="speed" size={20} color="#b8b8b8" />
          <TextInput
            style={styles.input}
            placeholder="Enter current odometer reading"
            placeholderTextColor="#6c7278"
            keyboardType="number-pad"
            value={mileage}
            onChangeText={(text) => setMileage(formatNumberWithCommas(text))}
          />
        </View>
      </View>

      {/* Cost */}
      <View style={styles.section}>
        <Text style={styles.label}>Cost</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>₱</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter service cost"
            placeholderTextColor="#6c7278"
            keyboardType="decimal-pad"
            value={cost}
            onChangeText={(text) => setCost(formatCostWithCommas(text))}
          />
        </View>
      </View>

      {/* Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialIcons name="calendar-today" size={20} color="#b8b8b8" />
          <Text style={[styles.input, !date && { color: "#6c7278" }]}>
            {date ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Select date"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        {Platform.OS === "ios" && showDatePicker && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
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
  doneButton: {
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3a3f47",
  },
})

export default AddServiceScreen
