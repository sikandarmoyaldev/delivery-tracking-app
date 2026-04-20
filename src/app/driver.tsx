import { Navbar } from "@/components/navbar";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DriverScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <Navbar title="Driver" showBack />
            <View className="flex-1 items-center justify-center">
                <Text className="text-foreground text-xl">🗺️ Driver Map Coming Next</Text>
            </View>
        </SafeAreaView>
    );
}
