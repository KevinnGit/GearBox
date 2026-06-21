# GearBox

GearBox is a React Native app for tracking vehicle maintenance. Pick a category (car or motorcycle), manage your vehicles, log service records, and attach photos so similar makes and models are easy to tell apart.

Built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation.

## Features

- **Category selection** — Choose between cars and motorcycles from the home screen.
- **Vehicle management** — Add, edit, and delete vehicles. Default sample vehicles are seeded on first launch.
- **Vehicle photos** — Upload a photo from the camera or photo library to identify similar units.
- **Service logging** — Record service type, mileage, cost, and date for each vehicle.
- **Maintenance history** — View all logged services on the vehicle details screen.
- **Local storage** — Vehicles and services are saved in SQLite. Photos are stored on the device.

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Home | `index` | Select Car or Motorcycle |
| Select Vehicle | `selectVehicle` | Browse and manage vehicles in a category |
| Details | `details` | View odometer, photo, and maintenance log |
| Add Service | `addService` | Log a new service record |

## Tech stack

- **Expo SDK 54** — React Native app framework
- **Expo Router** — File-based routing
- **expo-sqlite** — Local database for vehicles and services
- **expo-image-picker** — Camera and photo library access
- **expo-file-system** — Persistent storage for vehicle photos
- **TypeScript** — Type-safe development

## Project structure

```
GearBox/
├── app/                  # Screens (Expo Router)
│   ├── index.tsx         # Home — category selection
│   ├── selectVehicle.tsx # Vehicle list and editing
│   ├── details.tsx       # Vehicle details and maintenance log
│   ├── addService.tsx    # Log a service
│   └── _layout.tsx       # Navigation layout
├── database/
│   └── db.ts             # SQLite setup and queries
├── utils/
│   └── vehiclePhoto.ts   # Photo pick, save, and delete helpers
└── assets/               # Images and icons
```

## Get started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npx expo start
   ```

3. Open the app in Expo Go, an Android emulator, or an iOS simulator.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Expo dev server |
| `npm run android` | Start on Android |
| `npm run ios` | Start on iOS |
| `npm run web` | Start in the browser |
| `npm run lint` | Run ESLint |

## Permissions

GearBox requests the following permissions when you upload a vehicle photo:

- **Photo library** — Choose an existing photo
- **Camera** — Take a new photo

These are configured in `app.json` via the `expo-image-picker` plugin.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)