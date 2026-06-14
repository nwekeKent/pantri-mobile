import { View, Text } from "react-native";
import { SafeAreaView } from "@/components/ui/safe-area-view";

export default function RecipesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-4xl mb-4">📖</Text>
        <Text className="text-xl font-semibold text-foreground">Recipes</Text>
        <Text className="text-muted-foreground mt-2">Your recipes will appear here</Text>
      </View>
    </SafeAreaView>
  );
}
