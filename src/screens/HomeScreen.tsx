import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    View,
    FlatList,
    Text,
    StyleSheet,
    ActivityIndicator,
    Animated,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    RefreshControl,
    StatusBar,
    Platform,
} from "react-native";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
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
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Fonction pour valider les données Firestore
    const isProductValid = (data: any): data is Product => {
        return (
            typeof data?.name === "string" &&
            typeof data?.price === "number" &&
            typeof data?.category === "string" &&
            typeof data?.image === "string" &&
            typeof data?.description === "string"
        );
    };

    // Récupération des produits depuis Firestore avec optimisation
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Optimisation: Utiliser des requêtes plus spécifiques si une catégorie est sélectionnée
            let q;
            if (selectedCategory) {
                q = query(
                    collection(db, "products"),
                    where("category", "==", selectedCategory)
                );
            } else {
                q = query(collection(db, "products"), limit(50)); // Limiter le nombre initial de produits
            }
            
            const querySnapshot = await getDocs(q);
            console.log("Nombre de documents récupérés :", querySnapshot.size);
      
            const productList = querySnapshot.docs
                .map((doc) => {
                    const productData = doc.data();
                    if (!isProductValid(productData)) {
                        console.warn("Document invalide:", doc.id, productData);
                        return null;
                    }
                    
                    // Correction de l'erreur de duplication de l'id
                    const { id: _, ...productDataWithoutId } = productData;
                    return { id: doc.id, ...productDataWithoutId } as Product;
                })
                .filter(Boolean) as Product[];
      
            setProducts(productList);
            
            // Extraire les catégories uniquement si nous n'avons pas déjà des catégories
            if (categories.length === 0) {
                const uniqueCategories = [...new Set(productList.map((product) => product.category))];
                setCategories(uniqueCategories);
            }
            
            // Animation de fondu
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500, // Réduit pour une meilleure réactivité
                useNativeDriver: true,
            }).start();
        } catch (err: unknown) {
            console.error("Erreur lors de la récupération des produits :", err);
            setError("Impossible de charger les produits. Veuillez réessayer.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [fadeAnim, selectedCategory, categories.length]);

    // Effet initial pour charger les produits
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
        } else if (sortOption === "nameAsc") {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        }
        return sorted;
    }, [filteredProducts, sortOption]);

    // Recherche en temps réel
    const searchedProducts = useMemo(() => {
        if (!searchQuery.trim()) return sortedProducts;
        const query = searchQuery.toLowerCase().trim();
        return sortedProducts.filter((product) =>
            product.name.toLowerCase().includes(query) || 
            product.description.toLowerCase().includes(query)
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

    // Réinitialiser les filtres
    const resetFilters = useCallback(() => {
        setSelectedCategory(null);
        setSortOption(null);
        setSearchQuery("");
    }, []);

    // Rendu du header avec la barre de recherche
    const renderHeader = () => (
        <>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Catalogue</Text>
                {products.length > 0 && (
                    <TouchableOpacity 
                        style={styles.resetButton} 
                        onPress={resetFilters}
                        accessibilityLabel="Réinitialiser les filtres"
                    >
                        <MaterialIcons name="refresh" size={20} color="#FF4952" />
                        <Text style={styles.resetText}>Réinitialiser</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Barre de recherche améliorée */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchBar}
                    placeholder="Rechercher des produits..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    accessibilityLabel="Barre de recherche"
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity 
                        onPress={() => setSearchQuery("")}
                        style={styles.clearButton}
                        accessibilityLabel="Effacer la recherche"
                    >
                        <Ionicons name="close-circle" size={20} color="#777" />
                    </TouchableOpacity>
                )}
            </View>

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
                showsHorizontalScrollIndicator={false}
            />

            {/* Sélecteur de tri amélioré */}
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={sortOption}
                    onValueChange={(value) => setSortOption(value)}
                    style={styles.picker}
                    accessibilityLabel="Trier les produits"
                >
                    <Picker.Item label="Trier par..." value={null} />
                    <Picker.Item label="Prix croissant" value="priceAsc" />
                    <Picker.Item label="Prix décroissant" value="priceDesc" />
                    <Picker.Item label="Nom (A-Z)" value="nameAsc" />
                </Picker>
            </View>
            
            {/* Affichage du nombre de résultats */}
            <Text style={styles.resultCount}>
                {searchedProducts.length} produit{searchedProducts.length !== 1 ? 's' : ''} trouvé{searchedProducts.length !== 1 ? 's' : ''}
            </Text>
        </>
    );

    // Rendu du composant vide
    const renderEmptyComponent = () => (
        <View style={styles.emptyListContainer}>
            {searchQuery ? (
                <>
                    <Ionicons name="search-outline" size={50} color="#ccc" />
                    <Text style={styles.noProductText}>
                        Aucun produit ne correspond à "{searchQuery}"
                    </Text>
                    <TouchableOpacity 
                        style={styles.clearSearchButton}
                        onPress={() => setSearchQuery("")}
                    >
                        <Text style={styles.clearSearchText}>Effacer la recherche</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <MaterialIcons name="shopping-basket" size={50} color="#ccc" />
                    <Text style={styles.noProductText}>Aucun produit disponible</Text>
                </>
            )}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF4952" />
                    <Text style={styles.loadingText}>Chargement des produits...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                {/* Liste des produits avec header */}
                <FlatList
                    data={searchedProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onAddToCart={addToCart}
                            accessibilityLabel={`Produit : ${item.name}, Prix : ${item.price} FCFA`}
                        />
                    )}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FF4952"]}
                            tintColor="#FF4952"
                        />
                    }
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmptyComponent}
                    initialNumToRender={8}
                    maxToRenderPerBatch={6}
                    windowSize={10}
                    removeClippedSubviews={Platform.OS === 'android'}
                    contentContainerStyle={
                        searchedProducts.length === 0 ? { flexGrow: 1 } : undefined
                    }
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
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 15,
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
        marginVertical: 10,
        paddingHorizontal: 15,
    },
    categoryContainer: {
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    filterButton: {
        padding: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        backgroundColor: 'white',
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
        color: '#333',
    },
    row: {
        flex: 1,
        justifyContent: "space-around",
        marginVertical: 5,
        paddingHorizontal: 10,
    },
    pickerContainer: {
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchBar: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    clearButton: {
        padding: 5,
    },
    resultCount: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 15,
        marginBottom: 10,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    resetText: {
        color: '#FF4952',
        marginLeft: 5,
        fontSize: 14,
    },
    clearSearchButton: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
    },
    clearSearchText: {
        color: '#FF4952',
        fontWeight: '500',
    },
});

export default HomeScreen;