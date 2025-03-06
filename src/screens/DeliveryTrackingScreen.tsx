import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert, Button, Linking, Platform } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { LocationObjectCoords } from "expo-location";
import decode from "polyline-encoded";

const DeliveryTrackingScreen = () => {
    const [location, setLocation] = useState<LocationObjectCoords | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [deliveryLocation, setDeliveryLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [deliveryInfo, setDeliveryInfo] = useState<{ eta: string; driverName: string; orderId: string } | null>(null);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission refusée");
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);

            Location.watchPositionAsync(
                { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 5000, distanceInterval: 10 },
                (location) => {
                    setLocation(location.coords);
                },
                (error) => {
                    setErrorMsg("Erreur de localisation");
                }
            );
        })();
    }, []);

    useEffect(() => {
        if (errorMsg) {
            Alert.alert("Erreur", errorMsg);
        }
    }, [errorMsg]);

    useEffect(() => {
        // Simuler la position de livraison (remplacez par votre logique)
        setDeliveryLocation({ latitude: 37.78825, longitude: -122.4324 });

        // Simuler les informations de livraison (remplacez par votre logique)
        setDeliveryInfo({ eta: "15 minutes", driverName: "John Doe", orderId: "12345" });
    }, []);

    useEffect(() => {
        if (location && deliveryLocation) {
            fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${deliveryLocation.latitude},${deliveryLocation.longitude}&key=YOUR_API_KEY`
            )
                .then((response) => response.json())
                .then((data) => {
                    if (data.routes.length) {
                        const points = data.routes[0].overview_polyline.points;
                        const decodedPoints = decode(points);
                        setRouteCoordinates(
                            decodedPoints.map((point) => ({
                                latitude: point[0],
                                longitude: point[1],
                            }))
                        );
                    }
                });
        }
    }, [location, deliveryLocation]);

    const centerMapOnUser = () => {
        if (location) {
            mapRef.current?.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        }
    };

    const openSettings = () => {
        if (Platform.OS === "ios") {
            Linking.openURL("app-settings:");
        } else {
            Linking.openSettings();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Suivi de la Livraison</Text>
            {location ? (
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
                    <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
                    {deliveryLocation && (
                        <Marker coordinate={deliveryLocation} title="Livraison" pinColor="blue" />
                    )}
                    <Polyline coordinates={routeCoordinates} strokeWidth={3} strokeColor="red" />
                </MapView>
            ) : (
                <Text>Chargement de la localisation...</Text>
            )}

            {deliveryInfo && (
                <View style={styles.infoContainer}>
                    <Text>ETA : {deliveryInfo.eta}</Text>
                    <Text>Livreur : {deliveryInfo.driverName}</Text>
                    <Text>Commande : {deliveryInfo.orderId}</Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <Button title="Centrer sur moi" onPress={centerMapOnUser} />
                {errorMsg && <Button title="Ouvrir les paramètres" onPress={openSettings} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
    map: { width: "100%", height: "60%" }, // Réduit la hauteur de la carte
    infoContainer: { marginTop: 10, padding: 10, backgroundColor: "#f0f0f0", borderRadius: 5 },
    buttonContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
});

export default React.memo(DeliveryTrackingScreen);