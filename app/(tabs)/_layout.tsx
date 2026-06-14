import { Tabs } from "expo-router/js-tabs";
import React from "react";
import { Platform } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  FridgeIcon,
  ShoppingCartCheck02Icon,
  CookingPotIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
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
            <HugeiconsIcon icon={FridgeIcon} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: "Lists",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon
              icon={ShoppingCartCheck02Icon}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={CookingPotIcon} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="household"
        options={{
          title: "Household",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={UserGroupIcon} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
