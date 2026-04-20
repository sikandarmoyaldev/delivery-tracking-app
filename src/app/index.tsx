import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { useAppStore } from "@/lib/store";
import { router } from "expo-router";

export default function HomeScreen() {
    const { setIsDriverMode } = useAppStore();

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Navbar title="Delivery Tracker V1" />

            <View className="flex-1 items-center justify-center gap-6 p-6">
                <Text className="text-2xl font-semibold text-foreground text-center">
                    Select Your Role
                </Text>

                <Button
                    className="w-full"
                    onPress={() => {
                        setIsDriverMode(true);
                        router.push("/driver");
                    }}
                >
                    <Text className="text-primary-foreground text-lg">🚚 Driver Mode</Text>
                </Button>

                <Button
                    variant="outline"
                    className="w-full"
                    onPress={() => {
                        setIsDriverMode(false);
                        router.push("/customer");
                    }}
                >
                    <Text className="text-foreground text-lg">👤 Customer Mode</Text>
                </Button>
            </View>
        </SafeAreaView>
    );
}
