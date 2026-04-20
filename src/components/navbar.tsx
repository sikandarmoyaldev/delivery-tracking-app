import { router } from "expo-router";
import { ArrowLeft, Moon, Sun } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

interface NavbarProps {
    title?: string;
    showBack?: boolean;
    onToggleTheme?: () => void;
}

export function Navbar({
    title = "Delivery Tracker",
    showBack = false,
    onToggleTheme,
}: NavbarProps) {
    const { colorScheme, setColorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const handleToggle = () => {
        const next = isDark ? "light" : "dark";
        setColorScheme(next);
        onToggleTheme?.();
    };

    return (
        <View className="flex-row items-center justify-between px-4 py-3 bg-background border-b border-border">
            {/* Left: Back Button (conditional) */}
            {showBack && (
                <Button variant="ghost" size="icon" onPress={() => router.back()} className="mr-2">
                    <Icon as={ArrowLeft} className="text-foreground" size={20} />
                </Button>
            )}

            {/* Center: Title */}
            <Text className="text-foreground text-lg font-semibold flex-1 text-center">
                {title}
            </Text>

            {/* Right: Theme Toggle */}
            <Button
                variant="ghost"
                size="icon"
                onPress={handleToggle}
                className="p-2"
                aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
                <Icon as={isDark ? Sun : Moon} className="text-foreground" size={20} />
            </Button>
        </View>
    );
}
