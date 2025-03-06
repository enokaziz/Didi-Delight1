import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    View,
    FlatList,
    Text,
    StyleSheet,
    ActivityIndicator,
    Animated,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    TextInput,
    Button,
    Platform,
} from "react-native";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import ProductCard from "../components/common/ProductCard";
import { Product } from "../types/Product";
import { useCart } from "../contexts/CartContext";
import { Picker } from "@react-native-picker/picker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const HomeScreen = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart } = useCart();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fonction pour valider les données Firestore
    const isProductValid = (data: any): data is Product => {
        return (
            typeof data?.name === "string" &&
            typeof data?.price === "number" &&
            typeof data?.category === "string" &&
            typeof data?.imageUrl === "string" &&
            typeof data?.description === "string"
        );
    };

    // Récupération des produits depuis Firestore
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "products"));
            const querySnapshot = await getDocs(q);
            console.log("Nombre de documents récupérés :", querySnapshot.size);
            if (querySnapshot.empty) {
                console.log("Aucun produit trouvé !");
            }
            const productList = querySnapshot.docs
                .map((doc) => {
                    const productData = doc.data();
                    if (!isProductValid(productData)) {
                        console.warn("Document invalide:", doc.id);
                        return null;
                    }
                    const { id, ...rest } = productData;
                    return { id: doc.id, ...rest } as Product; // Correction ici
                })
                .filter(Boolean) as Product[];
            setProducts(productList);
            const uniqueCategories = [...new Set(productList.map((product) => product.category))];
            setCategories(uniqueCategories);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();
        } catch (err: unknown) {
            console.error("Erreur lors de la récupération des produits :", err);
            setError("Impossible de charger les produits. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    }, [fadeAnim]);

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            fetchProducts();
        }
        return () => {
            isMounted = false;
        };
    }, [fetchProducts]);

    // Filtrage des produits par catégorie
    const filteredProducts = useMemo(() => {
        if (!selectedCategory) return products;
        return products.filter((product) => product.category === selectedCategory);
    }, [products, selectedCategory]);

    // Tri des produits
    const sortedProducts = useMemo(() => {
        let sorted = [...filteredProducts];
        if (sortOption === "priceAsc") {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortOption === "priceDesc") {
            sorted.sort((a, b) => b.price - a.price);
        }
        return sorted;
    }, [filteredProducts, sortOption]);

    // Recherche en temps réel
    const searchedProducts = useMemo(() => {
        if (!searchQuery) return sortedProducts;
        return sortedProducts.filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sortedProducts, searchQuery]);

    // Composant réutilisable pour les boutons de filtre
    const FilterButton = ({ label, isActive, onPress }: {
        label: string;
        isActive: boolean;
        onPress: () => void
    }) => (
        <TouchableOpacity
            style={[styles.filterButton, isActive && styles.activeFilter]}
            onPress={onPress}
            accessibilityLabel={`Filtrer par ${label}`}
        >
            <Text style={isActive ? styles.activeFilterText : styles.filterText}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    // Gestion du pull-to-refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProducts();
    }, [fetchProducts]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6347" />
                <Text style={styles.loadingText}>Chargement des produits...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <Text style={styles.title}>Catalogue</Text>
                {error && <Text style={styles.errorText}>{error}</Text>}

                {/* Barre de recherche */}
                <TextInput
                    style={styles.searchBar}
                    placeholder="Rechercher des produits..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    accessibilityLabel="Barre de recherche"
                />

                {/* Filtres par catégorie */}
                <FlatList
                    horizontal
                    data={['Tous', ...categories]}
                    renderItem={({ item }) => (
                        <FilterButton
                            label={item}
                            isActive={selectedCategory === (item === 'Tous' ? null : item)}
                            onPress={() => setSelectedCategory(item === 'Tous' ? null : item)}
                        />
                    )}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.categoryContainer}
                />

                {/* Sélecteur de tri */}
                <Picker
                    selectedValue={sortOption}
                    onValueChange={(value) => setSortOption(value)}
                    style={styles.picker}
                    accessibilityLabel="Trier les produits"
                >
                    <Picker.Item label="Trier par..." value={null} />
                    <Picker.Item label="Prix croissant" value="priceAsc" />
                    <Picker.Item label="Prix décroissant" value="priceDesc" />
                </Picker>

                {/* Liste des produits */}
                <FlatList
                    data={searchedProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onAddToCart={addToCart}
                            accessibilityLabel={`Produit : ${item.name}, Prix : ${item.price}€`}
                        />
                    )}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.noProductText}>Aucun produit disponible</Text>
                        </View>
                    }
                    initialNumToRender={8}
                    maxToRenderPerBatch={6}
                    windowSize={10}
                    removeClippedSubviews
                />
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    container: {
        flex: 1,
        padding: 15,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "gray",
    },
    noProductText: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 20,
        color: "gray",
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginTop: 10,
    },
    categoryContainer: {
        marginBottom: 10,
    },
    filterButton: {
        padding: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 5,
    },
    activeFilter: {
        backgroundColor: '#FF4952',
        borderColor: '#FF4952',
    },
    activeFilterText: {
        color: 'white',
        fontWeight: '600',
    },
    filterText: {
        color: 'black',
    },
    row: {
        flex: 1,
        justifyContent: "space-around",
        marginVertical: 5,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 10,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    searchBar: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
});

export default HomeScreen;