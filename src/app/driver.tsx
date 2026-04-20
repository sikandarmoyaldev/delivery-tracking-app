import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

// 📍 Your Home Coordinates (Sikar, Rajasthan)
// Edit these values if you move or want to test elsewhere
const HOME_COORDS = {
    latitude: 25.8356131,
    longitude: 72.2559479,
    latitudeDelta: 0.01, // Zoom level: 0.01 = ~1km view, 0.005 = ~500m
    longitudeDelta: 0.01,
};

export default function DriverScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    setErrorMsg("Location permission denied. Please enable it in settings.");
                    return;
                }

                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 1000,
                        distanceInterval: 1,
                    },
                    (newLocation) => {
                        setLocation(newLocation);
                        setRoute((prev) => [
                            ...prev,
                            {
                                latitude: newLocation.coords.latitude,
                                longitude: newLocation.coords.longitude,
                            },
                        ]);
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

        return () => locationSubscription?.remove();
    }, []);

    const clearRoute = () => setRoute([]);

    // ✅ Test route injection (remove when GPS works reliably)
    const injectTestRoute = () => {
        setRoute([
            { latitude: HOME_COORDS.latitude, longitude: HOME_COORDS.longitude },
            { latitude: HOME_COORDS.latitude + 0.0002, longitude: HOME_COORDS.longitude + 0.0002 },
            { latitude: HOME_COORDS.latitude + 0.0004, longitude: HOME_COORDS.longitude + 0.0005 },
            { latitude: HOME_COORDS.latitude + 0.0006, longitude: HOME_COORDS.longitude + 0.0003 },
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Navbar title="Driver Mode" showBack />

            {errorMsg ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-destructive text-center">{errorMsg}</Text>
                </View>
            ) : !location ? (
                <View className="flex-1 items-center justify-center p-6 gap-4">
                    <Text className="text-muted-foreground text-center">
                        Acquiring GPS signal...
                    </Text>
                    <Button variant="outline" size="sm" onPress={injectTestRoute}>
                        <Text className="text-foreground">🧪 Load Test Route</Text>
                    </Button>
                </View>
            ) : (
                <View className="flex-1 relative">
                    <MapView
                        ref={mapRef}
                        style={{ flex: 1 }}
                        initialRegion={HOME_COORDS}
                        showsMyLocationButton={false}
                    >
                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            title="Driver"
                            description="Live tracking active"
                        />
                        {route.length > 1 && (
                            <Polyline coordinates={route} strokeColor="#3B82F6" strokeWidth={4} />
                        )}
                    </MapView>

                    <View className="absolute bottom-6 right-4 flex-row gap-2">
                        <Button variant="outline" size="sm" onPress={injectTestRoute}>
                            <Text className="text-foreground">🧪 Test</Text>
                        </Button>
                        <Button variant="outline" size="sm" onPress={clearRoute}>
                            <Text className="text-foreground">Clear</Text>
                        </Button>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
