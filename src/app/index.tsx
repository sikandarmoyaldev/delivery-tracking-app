// src/app/index.tsx
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
// 1. Import useColorScheme from nativewind
import { useColorScheme } from "nativewind";

export default function HomeScreen() {
    // 2. Use the nativewind hook instead of local state + Appearance
    const { colorScheme, setColorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const toggleTheme = () => {
        const next = isDark ? "light" : "dark";
        // 3. This updates both the UI classes and the internal theme state
        setColorScheme(next);
    };

    return (
        <View className="flex-1 bg-background justify-center items-center p-6 gap-4">
            <Text variant="h1" className="text-foreground text-center text-3xl font-bold">
                {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </Text>

            <Text className="text-muted-foreground text-center">
                Background, text, and navigation theme will switch instantly.
            </Text>

            <Button onPress={toggleTheme} className="mt-4 bg-primary">
                <Text className="text-primary-foreground font-semibold">
                    {isDark ? "Switch to Light" : "Switch to Dark"}
                </Text>
            </Button>
        </View>
    );
}
