import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, Animated } from "react-native";
import { createProduct, updateProduct, deleteProduct, getProducts } from "../firebase/productService";
import { Product } from "../types/Product";
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { uploadImage } from '../firebase/storageService';
import { Button, IconButton, Card, Title, Paragraph, Modal } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import FastImage from 'react-native-fast-image';

const ProductManagementScreen: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [newProductName, setNewProductName] = useState<string>("");
    const [newProductPrice, setNewProductPrice] = useState<string>("");
    const [newProductImage, setNewProductImage] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [page, setPage] = useState(1);
    const productsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [newProductCategory, setNewProductCategory] = useState<string>("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Référence pour les valeurs animées
    const animatedValues = useRef<Animated.Value[]>([]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
            
            // Extraction des catégories depuis les produits
            const uniqueCategories = [...new Set(fetchedProducts
                .map(product => product.category)
                .filter(category => category !== undefined && category !== "")
            )];
            setCategories(uniqueCategories);

            // Initialisation des valeurs animées
            animatedValues.current = fetchedProducts.map(() => new Animated.Value(0));
        } catch (error) {
            console.error('Erreur Firestore:', error);
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Impossible de récupérer les produits.',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddProduct = async () => {
        if (!newProductName.trim() || !newProductPrice.trim() || !newProductCategory) {
            Toast.show({
                type: 'error',
                text1: 'Champs requis',
                text2: 'Tous les champs doivent être remplis',
            });
            return;
        }

        try {
            const price = parseFloat(newProductPrice.replace(',', '.'));
            if (isNaN(price) || price <= 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: 'Veuillez saisir un prix valide.',
                });
                return;
            }

            let imageUrl = "";
            if (newProductImage) {
                setIsImageLoading(true);
                imageUrl = await uploadImage(newProductImage, setUploadProgress);
                setIsImageLoading(false);
            }

            await createProduct({
                name: newProductName.trim(),
                price,
                image: imageUrl,
                description: "",
                category: newProductCategory
            });

            await fetchProducts();
            resetForm();
            Toast.show({
                type: 'success',
                text1: 'Produit ajouté !',
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: (error as Error).message,
            });
        }
    };

    const resetForm = () => {
        setNewProductName("");
        setNewProductPrice("");
        setNewProductImage(null);
        setNewProductCategory("");
        setIsModalVisible(false);
        setEditingProduct(null);
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await deleteProduct(productId);
            await fetchProducts();
            Toast.show({
                type: 'success',
                text1: 'Produit supprimé !',
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Impossible de supprimer le produit.',
            });
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setNewProductName(product.name);
        setNewProductPrice(String(product.price));
        setNewProductImage(product.image);
        setNewProductCategory(product.category);
        setIsModalVisible(true);
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct || !newProductCategory) return;

        try {
            const price = parseFloat(newProductPrice.replace(',', '.'));
            if (isNaN(price) || price <= 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: 'Veuillez saisir un prix valide.',
                });
                return;
            }

            let imageUrl = editingProduct.image;
            if (newProductImage && newProductImage !== editingProduct.image) {
                setIsImageLoading(true);
                imageUrl = await uploadImage(newProductImage, setUploadProgress);
                setIsImageLoading(false);
            }

            await updateProduct({ 
                ...editingProduct, 
                name: newProductName.trim(), 
                price, 
                image: imageUrl, 
                category: newProductCategory 
            });

            await fetchProducts();
            resetForm();
            Toast.show({
                type: 'success',
                text1: 'Produit mis à jour !',
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: (error as Error).message,
            });
        }
    };

    const selectImage = async () => {
        const result: ImagePickerResponse = await launchImageLibrary({ 
            mediaType: 'photo',
            quality: 0.8
        });

        if (!result.didCancel && result.assets?.[0]?.uri) {
            setNewProductImage(result.assets[0].uri);
        }
    };

    const filteredProducts = useMemo(() => {
        let filtered = products;
        if (searchQuery) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (categoryFilter) {
            filtered = filtered.filter(product => 
                product.category?.toLowerCase() === categoryFilter.toLowerCase()
            );
        }
        return filtered;
    }, [products, searchQuery, categoryFilter]);

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * productsPerPage;
        return filteredProducts.slice(start, start + productsPerPage);
    }, [filteredProducts, page]);

    const animateCard = (index: number) => {
        Animated.timing(animatedValues.current[index], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const renderProductItem = ({ item, index }: { item: Product; index: number }) => {
        if (!animatedValues.current[index]) {
            animatedValues.current[index] = new Animated.Value(0);
        }

        animateCard(index);

        const cardStyle = {
            opacity: animatedValues.current[index],
            transform: [{
                translateY: animatedValues.current[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                })
            }]
        };

        return (
            <Animated.View style={[styles.productContainer, cardStyle]}>
                <Card>
                    <Card.Content>
                        {item.image && (
                            <FastImage
                                source={{ uri: item.image }}
                                style={styles.imagePreview}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        )}
                        <Title style={styles.productText}>{item.name}</Title>
                        <Paragraph style={styles.priceText}>
                            Prix : {item.price.toFixed(2)} FCFA
                        </Paragraph>
                        <Paragraph>Catégorie : {item.category}</Paragraph>
                        <View style={styles.actionsContainer}>
                            <IconButton 
                                icon="pencil" 
                                onPress={() => handleEditProduct(item)} 
                                accessibilityLabel="Modifier le produit"
                            />
                            <IconButton
                                icon="delete"
                                onPress={() => handleDeleteProduct(item.id)}
                                accessibilityLabel="Supprimer le produit"
                            />
                        </View>
                    </Card.Content>
                </Card>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gestion des Produits</Text>

            <View style={styles.searchFilterContainer}>
                <TextInput
                    placeholder="Rechercher un produit"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchFilterInput}
                />
                <Picker
                    selectedValue={categoryFilter}
                    onValueChange={setCategoryFilter}
                    style={styles.filterPicker}>
                    <Picker.Item label="Toutes les catégories" value="" />
                    {categories.map(category => (
                        <Picker.Item key={category} label={category} value={category} />
                    ))}
                </Picker>
            </View>

            <Button 
                mode="contained" 
                onPress={() => setIsModalVisible(true)}
                style={styles.addButton}>
                Ajouter un produit
            </Button>

            <Modal 
                visible={isModalVisible} 
                onDismiss={() => setIsModalVisible(false)}
                contentContainerStyle={styles.modalContainer}>
                <TextInput
                    placeholder="Nom du produit"
                    value={newProductName}
                    onChangeText={setNewProductName}
                    style={styles.input}
                    accessibilityLabel="Nom du produit"
                />
                <TextInput
                    placeholder="Prix (ex: 12.99)"
                    value={newProductPrice}
                    onChangeText={setNewProductPrice}
                    style={styles.input}
                    keyboardType="decimal-pad"
                    accessibilityLabel="Prix du produit"
                />
                <Picker
                    selectedValue={newProductCategory}
                    onValueChange={setNewProductCategory}
                    style={styles.picker}
                    accessibilityLabel="Sélectionner une catégorie">
                    <Picker.Item label="Sélectionnez une catégorie" value="" />
                    {categories.map(category => (
                        <Picker.Item key={category} label={category} value={category} />
                    ))}
                </Picker>

                {newProductImage && (
                    <FastImage 
                        source={{ uri: newProductImage }} 
                        style={styles.imagePreview}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                )}

                <Button 
                    mode="outlined" 
                    onPress={selectImage}
                    style={styles.imageButton}>
                    {newProductImage ? "Changer l'image" : "Sélectionner une image"}
                </Button>

                {isImageLoading && <ActivityIndicator size="large" />}
                {uploadProgress > 0 && (
                    <Text style={styles.progressText}>
                        Téléchargement : {Math.round(uploadProgress)}%
                    </Text>
                )}

                <View style={styles.modalButtons}>
                    <Button 
                        mode="contained" 
                        onPress={editingProduct ? handleUpdateProduct : handleAddProduct}
                        disabled={isImageLoading}>
                        {editingProduct ? "Mettre à jour" : "Ajouter"}
                    </Button>
                    <Button 
                        mode="outlined" 
                        onPress={() => setIsModalVisible(false)}
                        style={styles.cancelButton}>
                        Annuler
                    </Button>
                </View>
            </Modal>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6347" />
                </View>
            ) : (
                <FlatList
                    data={paginatedProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProductItem}
                    ListFooterComponent={() => (
                        <View style={styles.paginationContainer}>
                            <Button 
                                mode="outlined" 
                                disabled={page === 1} 
                                onPress={() => setPage(p => p - 1)}>
                                Précédent
                            </Button>
                            <Text style={styles.pageText}>
                                Page {page} / {totalPages}
                            </Text>
                            <Button 
                                mode="outlined" 
                                disabled={page >= totalPages} 
                                onPress={() => setPage(p => p + 1)}>
                                Suivant
                            </Button>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Aucun produit trouvé</Text>
                    }
                />
            )}
            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: "#f5f5f5" 
    },
    title: { 
        fontSize: 24, 
        fontWeight: "bold", 
        marginBottom: 20, 
        color: "#2c3e50",
        textAlign: 'center'
    },
    searchFilterContainer: { 
        marginBottom: 20 
    },
    searchFilterInput: { 
        backgroundColor: 'white',
        borderWidth: 1, 
        borderColor: "#ddd", 
        borderRadius: 8, 
        padding: 12,
        marginBottom: 10,
        fontSize: 16
    },
    filterPicker: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 15
    },
    addButton: {
        marginVertical: 10,
        backgroundColor: '#3498db'
    },
    productContainer: {
        marginBottom: 15,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3
    },
    productText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginVertical: 5
    },
    priceText: {
        fontSize: 16,
        color: '#e74c3c',
        fontWeight: 'bold'
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginVertical: 10
    },
    imageButton: {
        marginVertical: 10,
        borderColor: '#3498db'
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 15
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16
    },
    picker: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 15
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    },
    cancelButton: {
        borderColor: '#e74c3c'
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        gap: 10
    },
    pageText: {
        fontSize: 16,
        color: '#7f8c8d'
    },
    progressText: {
        textAlign: 'center',
        color: '#3498db',
        marginVertical: 5
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#7f8c8d',
        marginTop: 20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10
    }
});

export default ProductManagementScreen;