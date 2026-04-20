import { Navbar } from "@/components/navbar";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomerScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <Navbar title="Customer" showBack />
            <View className="flex-1 items-center justify-center">
                <Text className="text-foreground text-xl">📍 Tracking Coming in V2</Text>
            </View>
        </SafeAreaView>
    );
}
