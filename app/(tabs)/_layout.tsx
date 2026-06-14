import { Tabs } from "expo-router/js-tabs";
import React from "react";
import { Platform } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  FridgeIcon,
  ClipboardIcon,
  BookOpen01Icon as BookOpenIcon,
  Settings01Icon as SettingsIcon,
} from "@hugeicons/core-free-icons";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="pantry"
        options={{
          title: "Pantry",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={FridgeIcon} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: "Lists",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={ClipboardIcon} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={BookOpenIcon} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={SettingsIcon} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
