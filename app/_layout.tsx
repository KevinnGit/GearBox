import { Stack } from "expo-router";
import { useEffect } from "react";
import { initDatabase } from "../database/db";

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);
  return <Stack>
    <Stack.Screen
      name = 'index'
      options = {{
        title: "Home",
        headerShown: false,
      }}
    >
      


    </Stack.Screen>

    <Stack.Screen
      name = 'selectVehicle'
      options = {{
        title: "Select Vehicle",
        headerShown: true,
        headerStyle: {
          backgroundColor: '#3a3f47',
        },
        headerTintColor: '#e8e8e8',
        headerTitleStyle: {
          color: '#e8e8e8',
          fontSize: 18,
          fontWeight: '600',
        },
      }}
    />

    <Stack.Screen
      name = 'details'
      options = {{
        title: "Details",
        headerShown: true,
        headerStyle: {
          backgroundColor: '#3a3f47',
        },
        headerTintColor: '#e8e8e8',
        headerTitleStyle: {
          color: '#e8e8e8',
          fontSize: 18,
          fontWeight: '600',
        },
      }}
    />

    <Stack.Screen
      name = 'addService'
      options = {{
        title: "Add Service",
        headerShown: true,
        headerStyle: {
          backgroundColor: '#3a3f47',
        },
        headerTintColor: '#e8e8e8',
        headerTitleStyle: {
          color: '#e8e8e8',
          fontSize: 18,
          fontWeight: '600',
        },
      }}
    />

  </Stack>;
}
