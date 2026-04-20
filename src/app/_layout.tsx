import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";

import { NAV_THEME } from "@/lib/theme";
import "./globals.css";

export default function RootLayout() {
    const colorScheme = useColorScheme() ?? "light";

    return (
        <ThemeProvider value={NAV_THEME[colorScheme]}>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

            {/* ✅ Apply bg-background to root View */}
            <View className="flex-1 bg-background">
                <Stack screenOptions={{ headerShown: false }} />
                <PortalHost />
            </View>
        </ThemeProvider>
    );
}
