import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

// 🏠 Destination: Your Home (Sikar, Rajasthan)
const HOME_COORDS = {
    latitude: 25.8356131,
    longitude: 72.2559479,
};

// 🌍 OSRM Public Demo Server (FREE, no key, no billing)
// ⚠️ Rate limit: ~1 req/sec — fine for dev, not for production
const OSRM_API = "https://router.project-osrm.org/route/v1/driving";

export default function DriverScreen() {
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
    const [routeInfo, setRouteInfo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const mapRef = useRef<MapView>(null);

    // 🚫 Throttle: only fetch if moved > 150m since last request
    const lastFetchRef = useRef<{ lat: number; lng: number } | null>(null);

    const fetchOSRMRoute = async (startLat: number, startLng: number) => {
        // Throttle check
        if (lastFetchRef.current) {
            const dist = Math.hypot(
                startLat - lastFetchRef.current.lat,
                startLng - lastFetchRef.current.lng,
            );
            if (dist < 0.0015) return; // ~150m threshold
        }

        setLoading(true);
        try {
            // OSRM URL format: /route/v1/{profile}/{startLng},{startLat};{endLng},{endLat}
            const url = `${OSRM_API}/${startLng},${startLat};${HOME_COORDS.longitude},${HOME_COORDS.latitude}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.code !== "Ok" || !data.routes?.length) {
                setErrorMsg("No route found — try moving a bit");
                return;
            }

            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(([lng, lat]: [number, number]) => ({
                latitude: lat,
                longitude: lng,
            }));

            setRouteCoords(coords);
            // Format distance (m → km) and duration (s → min)
            const distance = (route.distance / 1000).toFixed(1);
            const duration = Math.round(route.duration / 60);
            setRouteInfo(`${distance} km • ~${duration} min`);
            lastFetchRef.current = { lat: startLat, lng: startLng };
        } catch (err) {
            setErrorMsg("Route service unavailable — using mock path");
            console.warn("OSRM error:", err);
            // Fallback: generate simple curved mock route
            generateMockRoute({ latitude: startLat, longitude: startLng }, HOME_COORDS);
        } finally {
            setLoading(false);
        }
    };

    // 🎨 Fallback: curved mock route (if OSRM fails)
    const generateMockRoute = (
        start: { latitude: number; longitude: number },
        end: { latitude: number; longitude: number },
    ) => {
        const points = [];
        const steps = 25;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const curve = Math.sin(t * Math.PI) * 0.0004;
            points.push({
                latitude: start.latitude + (end.latitude - start.latitude) * t + curve,
                longitude: start.longitude + (end.longitude - start.longitude) * t,
            });
        }
        setRouteCoords(points);
        setRouteInfo("~2.5 km • ~8 min (mock)");
    };

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    setErrorMsg("Location permission denied");
                    return;
                }

                locationSubscription = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 10 },
                    (loc) => {
                        setCurrentLocation(loc);
                        fetchOSRMRoute(loc.coords.latitude, loc.coords.longitude);
                        // Fit map to show start + end
                        mapRef.current?.fitToCoordinates(
                            [
                                { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
                                HOME_COORDS,
                            ],
                            {
                                edgePadding: { top: 80, right: 50, bottom: 80, left: 50 },
                                animated: true,
                            },
                        );
                    },
                );
            } catch (error) {
                setErrorMsg("Failed to get location");
            }
        })();

        return () => locationSubscription?.remove();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Navbar title="Driver Mode" showBack />

            {errorMsg && !currentLocation ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-destructive text-center">{errorMsg}</Text>
                    <Button
                        variant="outline"
                        size="sm"
                        onPress={() => setErrorMsg(null)}
                        className="mt-4"
                    >
                        <Text className="text-foreground">Retry</Text>
                    </Button>
                </View>
            ) : !currentLocation ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-muted-foreground text-center">
                        Finding your location...
                    </Text>
                </View>
            ) : (
                <View className="flex-1 relative">
                    <MapView
                        ref={mapRef}
                        style={{ flex: 1 }}
                        showsMyLocationButton={false}
                        initialRegion={{
                            ...HOME_COORDS,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                        }}
                    >
                        {/* 📍 You */}
                        <Marker
                            coordinate={{
                                latitude: currentLocation.coords.latitude,
                                longitude: currentLocation.coords.longitude,
                            }}
                            title="You are here"
                            pinColor="#22C55E"
                        />
                        {/* 🏠 Home */}
                        <Marker coordinate={HOME_COORDS} title="Home" pinColor="#EF4444" />
                        {/* 🛣️ Route Line */}
                        {routeCoords.length > 1 && (
                            <Polyline
                                coordinates={routeCoords}
                                strokeColor="#3B82F6"
                                strokeWidth={5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}
                    </MapView>

                    {/* 📊 Route Info Card */}
                    <View className="absolute bottom-6 left-4 right-4 bg-background/95 p-4 rounded-xl border border-border shadow-sm">
                        <Text className="text-foreground font-semibold text-lg">
                            🎯 Route to Home
                        </Text>
                        {loading ? (
                            <Text className="text-muted-foreground mt-1">
                                Calculating best path...
                            </Text>
                        ) : routeInfo ? (
                            <Text className="text-muted-foreground mt-1">{routeInfo} • OSRM</Text>
                        ) : (
                            <Text className="text-muted-foreground mt-1">
                                Tap retry to load route
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
