import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { Navbar } from "@/components/navbar";
import { Text } from "@/components/ui/text";

export default function DriverScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        (async () => {
            try {
                // 1. Request permission
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    setErrorMsg("Location permission denied");
                    return;
                }

                // 2. Start watching position
                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 1000, // Update every 1 second
                        distanceInterval: 1, // Update every 1 meter moved
                    },
                    (newLocation) => {
                        setLocation(newLocation);
                        // Smoothly animate camera to new position
                        mapRef.current?.animateCamera({
                            center: {
                                latitude: newLocation.coords.latitude,
                                longitude: newLocation.coords.longitude,
                            },
                        });
                    },
                );
            } catch (error) {
                setErrorMsg("Failed to get location");
                console.error(error);
            }
        })();

        // Cleanup on unmount
        return () => {
            locationSubscription?.remove();
        };
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Navbar title="Driver Mode" showBack />

            {errorMsg ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-destructive text-center">{errorMsg}</Text>
                </View>
            ) : !location ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-muted-foreground text-center">
                        Acquiring GPS signal...
                    </Text>
                </View>
            ) : (
                <View className="flex-1">
                    <MapView
                        ref={mapRef}
                        style={{ flex: 1 }}
                        initialRegion={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                        showsUserLocation
                        showsMyLocationButton
                    >
                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            title="Driver Location"
                            description="Live tracking active"
                        />
                    </MapView>
                </View>
            )}
        </SafeAreaView>
    );
}
