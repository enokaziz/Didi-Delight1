import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    Alert, 
    Button, 
    Linking, 
    Platform 
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps-expo";
import * as Location from "expo-location";
import type { LocationObjectCoords, LocationSubscription } from "expo-location";
import decode from "polyline-encoded";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface DeliveryInfo {
    eta: string;
    driverName: string;
    orderId: string;
}

const DeliveryTrackingScreen: React.FC = () => {
    const [location, setLocation] = useState<LocationObjectCoords | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [deliveryLocation, setDeliveryLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const mapRef = useRef<MapView>(null);
    const locationSubscription = useRef<LocationSubscription | null>(null);

    const handleLocationUpdate = useCallback((location: Location.LocationObject) => {
        setLocation(location.coords);
        setIsLoading(false);
    }, []);

    const handleLocationError = useCallback((error: any) => {
        console.error('Erreur de localisation:', error);
        setErrorMsg("Erreur de localisation");
        setIsLoading(false);
    }, []);

    const setupLocation = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission de localisation refusée");
                setIsLoading(false);
                return;
            }

            const initialLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced
            });
            setLocation(initialLocation.coords);

            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 5000,
                    distanceInterval: 10
                },
                handleLocationUpdate
            );
        } catch (error) {
            handleLocationError(error);
        }
    }, [handleLocationUpdate, handleLocationError]);

    const fetchDirections = useCallback(async () => {
        if (!location || !deliveryLocation) return;

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${deliveryLocation.latitude},${deliveryLocation.longitude}&key=YOUR_API_KEY`
            );
            const data = await response.json();

            if (data.routes?.[0]?.overview_polyline?.points) {
                const decodedPoints = decode(data.routes[0].overview_polyline.points);
                setRouteCoordinates(
                    decodedPoints.map((point) => ({
                        latitude: point[0],
                        longitude: point[1],
                    }))
                );
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'itinéraire:', error);
            Alert.alert('Erreur', 'Impossible de charger l\'itinéraire');
        }
    }, [location, deliveryLocation]);

    useEffect(() => {
        setupLocation();
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, [setupLocation]);

    useEffect(() => {
        if (errorMsg) {
            Alert.alert("Erreur", errorMsg);
        }
    }, [errorMsg]);

    useEffect(() => {
        // Simulation des données de livraison
        setDeliveryLocation({ latitude: 37.78825, longitude: -122.4324 });
        setDeliveryInfo({
            eta: "15 minutes",
            driverName: "John Doe",
            orderId: "12345"
        });
    }, []);

    useEffect(() => {
        if (location && deliveryLocation) {
            fetchDirections();
        }
    }, [location, deliveryLocation, fetchDirections]);

    const centerMapOnUser = useCallback(() => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        }
    }, [location]);

    const openSettings = useCallback(() => {
        Platform.OS === "ios" ? Linking.openURL("app-settings:") : Linking.openSettings();
    }, []);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                    <Text style={styles.loadingText}>Chargement de la localisation...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#4f46e5', '#3730a3']}
                style={styles.headerGradient}
            >
                <Text style={styles.title}>Suivi de la Livraison</Text>
            </LinearGradient>

            {location && (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                >
                    <Marker 
                        coordinate={location}
                        title="Ma position"
                    >
                        <View style={styles.markerContainer}>
                            <MaterialIcons name="my-location" size={24} color="#4f46e5" />
                        </View>
                    </Marker>
                    
                    {deliveryLocation && (
                        <Marker 
                            coordinate={deliveryLocation} 
                            title="Point de livraison"
                        >
                            <View style={styles.markerContainer}>
                                <MaterialIcons name="local-shipping" size={24} color="#3730a3" />
                            </View>
                        </Marker>
                    )}
                    
                    {routeCoordinates.length > 0 && (
                        <Polyline 
                            coordinates={routeCoordinates} 
                            strokeWidth={3} 
                            strokeColor="#4f46e5" 
                        />
                    )}
                </MapView>
            )}

            {deliveryInfo && (
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>Temps estimé : {deliveryInfo.eta}</Text>
                    <Text style={styles.infoText}>Livreur : {deliveryInfo.driverName}</Text>
                    <Text style={styles.infoText}>N° Commande : {deliveryInfo.orderId}</Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <Button 
                    title="Centrer sur moi" 
                    onPress={centerMapOnUser}
                    color="#4f46e5"
                />
                {errorMsg && (
                    <Button 
                        title="Paramètres" 
                        onPress={openSettings}
                        color="#3730a3"
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    headerGradient: {
        padding: 15,
        paddingTop: Platform.OS === 'ios' ? 50 : 15
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        textAlign: 'center'
    },
    map: {
        width: "100%",
        height: "60%"
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16
    },
    infoContainer: {
        margin: 10,
        padding: 15,
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
    },
    infoText: {
        fontSize: 16,
        color: "#333",
        marginVertical: 5
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10,
        marginTop: 'auto'
    },
    markerContainer: {
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#4f46e5',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
    }
});

export default React.memo(DeliveryTrackingScreen);