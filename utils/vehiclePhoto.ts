import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Directory, File, Paths } from "expo-file-system";

const VEHICLE_PHOTOS_DIR = "vehicle-photos";

const ensurePhotosDirectory = () => {
  const dir = new Directory(Paths.document, VEHICLE_PHOTOS_DIR);
  if (!dir.exists) {
    dir.create({ idempotent: true });
  }
  return dir;
};

export const saveVehiclePhoto = (vehicleId: number, sourceUri: string): string => {
  const dir = ensurePhotosDirectory();
  const extension = sourceUri.split(".").pop()?.split("?")[0] || "jpg";
  const destination = new File(dir, `vehicle-${vehicleId}.${extension}`);

  if (destination.exists) {
    destination.delete();
  }

  const source = new File(sourceUri);
  source.copy(destination);

  return destination.uri;
};

export const deleteVehiclePhotoFile = (photoUri: string | null) => {
  if (!photoUri) return;

  const file = new File(photoUri);
  if (file.exists) {
    file.delete();
  }
};

const pickFromLibrary = async (): Promise<string | null> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Permission needed",
      "Please allow photo library access to upload a vehicle photo."
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
};

const pickFromCamera = async (): Promise<string | null> => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Permission needed",
      "Please allow camera access to take a vehicle photo."
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
};

export const pickVehiclePhoto = (): Promise<string | null> => {
  return new Promise((resolve) => {
    Alert.alert("Vehicle Photo", "Add a photo to tell similar units apart.", [
      {
        text: "Take Photo",
        onPress: async () => resolve(await pickFromCamera()),
      },
      {
        text: "Choose from Library",
        onPress: async () => resolve(await pickFromLibrary()),
      },
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => resolve(null),
      },
    ]);
  });
};
