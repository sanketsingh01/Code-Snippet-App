import "react-native-reanimated";

import { AppProvider, useApp } from "@/context/app-context";
import { theme } from "@/theme";
import * as SystemUI from "expo-system-ui";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

function AppShell() {
  // Theme mode is reserved for future variants; the pastel palette stays the
  // same regardless of system scheme.
  useApp();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.bg);
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" options={{ presentation: "modal" }} />
        </Stack>
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
    >
      <SafeAreaProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
