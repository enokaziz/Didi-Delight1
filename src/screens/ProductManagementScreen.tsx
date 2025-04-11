"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import type { Product } from "../types/Product";
import {
  Button,
  IconButton,
  Searchbar,
  Menu,
  Divider,
  FAB,
  Portal,
  Dialog,
  Chip,
  ProgressBar,
  Switch,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import useProductManagement from "../hooks/useProductManagement";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import type { StackNavigationProp } from "@react-navigation/stack";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#F04E98",
  primaryDark: "#D03A7E",
  primaryLight: "#FFD6E7",
  secondary: "#6A3EA1",
  background: "#F9FAFC",
  surface: "#FFFFFF",
  text: "#333333",
  textLight: "#666666",
  border: "#EEEEEE",
  success: "#60D889",
  warning: "#FFBD3D",
  error: "#FF5C5C",
  info: "#5B93FF",
};

const ProductManagementScreen4: React.FC = () => {
  const { products, loading, fetchProducts, handleDeleteProduct } =
    useProductManagement();
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamList, "ProductManagement">
    >();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [showLowStock, setShowLowStock] = useState(true);
  const [expandedView, setExpandedView] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const handleAddProduct = () => {
    navigation.navigate("AddEditProduct", { product: undefined });
  };

  const handleEditProduct = (product: Product) => {
    navigation.navigate("AddEditProduct", { product });
  };

  const confirmDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      handleDeleteProduct(selectedProduct.id, fetchProducts);
      setDeleteDialogVisible(false);
      setSelectedProduct(null);
      Toast.show({
        type: "success",
        text1: "Produit supprimé",
        text2: `${selectedProduct.name} a été supprimé avec succès`,
      });
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((product) => product.category)),
    ];
    return ["all", ...uniqueCategories];
  }, [products]);

  const productStats = useMemo(() => {
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const inStock = products.filter((p) => p.stock > 5).length;
    const promotional = products.filter((p) => p.isPromotional).length;

    const categoryCounts = products.reduce(
      (acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: products.length,
      outOfStock,
      lowStock,
      inStock,
      promotional,
      categoryCounts,
    };
  }, [products]);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "stock":
          comparison = (a.stock || 0) - (b.stock || 0);
          break;
        case "popularity":
          comparison = (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [products, sortBy, sortOrder]);

  const filteredProducts = useMemo(() => {
    let filtered = sortedProducts;

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (!showOutOfStock) {
      filtered = filtered.filter((product) => product.stock !== 0);
    }

    if (!showLowStock) {
      filtered = filtered.filter(
        (product) => product.stock === 0 || product.stock > 5
      );
    }

    if (activeTab === "outOfStock") {
      filtered = filtered.filter((product) => product.stock === 0);
    } else if (activeTab === "lowStock") {
      filtered = filtered.filter(
        (product) => product.stock > 0 && product.stock <= 5
      );
    } else if (activeTab === "promotional") {
      filtered = filtered.filter((product) => product.isPromotional);
    }

    return filtered;
  }, [
    sortedProducts,
    searchQuery,
    selectedCategory,
    showOutOfStock,
    showLowStock,
    activeTab,
  ]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;

      if (translationY > 50 && !expandedView) {
        // Swipe down to expand
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.9,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        setExpandedView(true);
      } else if (translationY < -50 && expandedView) {
        // Swipe up to collapse
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        setExpandedView(false);
      } else {
        // Reset if not enough distance
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const renderProductCard = ({
    item,
    index,
  }: {
    item: Product;
    index: number;
  }) => {
    const isOutOfStock = item.stock === 0;
    const isLowStock = item.stock > 0 && item.stock <= 5;

    return (
      <Animated.View
        style={[
          styles.productCard,
          {
            transform: [
              {
                translateY: translateY.interpolate({
                  inputRange: [-300, 0, 300],
                  outputRange: [0, 0, 0],
                  extrapolate: "clamp",
                }),
              },
              { scale },
            ],
            opacity: opacity.interpolate({
              inputRange: [0.7, 1],
              outputRange: [0.7, 1],
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card,
            isOutOfStock && styles.outOfStockCard,
            isLowStock && styles.lowStockCard,
          ]}
          onPress={() => handleEditProduct(item)}
          activeOpacity={0.9}
        >
          <View style={styles.cardImageContainer}>
            <Image
              source={{
                uri: item.imageUrl || "/placeholder.svg?height=150&width=150",
              }}
              style={styles.cardImage}
            />
            {item.isPromotional && (
              <View style={styles.promotionalBadge}>
                <Text style={styles.promotionalText}>Promo</Text>
              </View>
            )}
            {item.isPopular && (
              <View style={styles.popularBadge}>
                <MaterialCommunityIcons name="star" size={12} color="white" />
              </View>
            )}
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.cardPrice}>
                {item.price.toLocaleString()} FCFA
              </Text>
            </View>

            <View style={styles.cardDetails}>
              <Chip
                style={[
                  styles.categoryChip,
                  { backgroundColor: COLORS.primaryLight },
                ]}
                textStyle={{ color: COLORS.primary, fontSize: 10 }}
                compact
              >
                {item.category}
              </Chip>

              <View style={styles.stockContainer}>
                <Text style={styles.stockLabel}>Stock:</Text>
                <ProgressBar
                  progress={Math.min((item.stock || 0) / 20, 1)}
                  color={
                    isOutOfStock
                      ? COLORS.error
                      : isLowStock
                        ? COLORS.warning
                        : COLORS.success
                  }
                  style={styles.stockProgress}
                />
                <Text
                  style={[
                    styles.stockValue,
                    isOutOfStock
                      ? styles.stockError
                      : isLowStock
                        ? styles.stockWarning
                        : styles.stockSuccess,
                  ]}
                >
                  {item.stock || 0}
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <IconButton
                icon="pencil"
                iconColor={COLORS.secondary}
                size={18}
                onPress={() => handleEditProduct(item)}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                iconColor={COLORS.error}
                size={18}
                onPress={() => confirmDelete(item)}
                style={styles.actionButton}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderStatsView = () => (
    <Animated.View
      style={[
        styles.statsContainer,
        {
          height: expandedView ? 300 : 120,
          transform: [
            {
              translateY: translateY.interpolate({
                inputRange: [-300, 0, 300],
                outputRange: [-50, 0, 50],
                extrapolate: "clamp",
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Aperçu des produits</Text>
        <TouchableOpacity
          onPress={() => setExpandedView(!expandedView)}
          style={styles.expandButton}
        >
          <MaterialCommunityIcons
            name={expandedView ? "chevron-up" : "chevron-down"}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.statsCards}>
        <TouchableOpacity
          style={[
            styles.statCard,
            activeTab === "all" && styles.activeStatCard,
          ]}
          onPress={() => setActiveTab("all")}
        >
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: COLORS.primary },
            ]}
          >
            <MaterialCommunityIcons
              name="package-variant"
              size={20}
              color="white"
            />
          </View>
          <Text style={styles.statValue}>{productStats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            activeTab === "outOfStock" && styles.activeStatCard,
          ]}
          onPress={() => setActiveTab("outOfStock")}
        >
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: COLORS.error },
            ]}
          >
            <MaterialCommunityIcons
              name="package-variant-closed-remove"
              size={20}
              color="white"
            />
          </View>
          <Text style={styles.statValue}>{productStats.outOfStock}</Text>
          <Text style={styles.statLabel}>Épuisés</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            activeTab === "lowStock" && styles.activeStatCard,
          ]}
          onPress={() => setActiveTab("lowStock")}
        >
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: COLORS.warning },
            ]}
          >
            <MaterialCommunityIcons
              name="package-variant-closed-alert"
              size={20}
              color="white"
            />
          </View>
          <Text style={styles.statValue}>{productStats.lowStock}</Text>
          <Text style={styles.statLabel}>Stock bas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            activeTab === "promotional" && styles.activeStatCard,
          ]}
          onPress={() => setActiveTab("promotional")}
        >
          <View
            style={[styles.statIconContainer, { backgroundColor: COLORS.info }]}
          >
            <MaterialCommunityIcons name="tag" size={20} color="white" />
          </View>
          <Text style={styles.statValue}>{productStats.promotional}</Text>
          <Text style={styles.statLabel}>Promos</Text>
        </TouchableOpacity>
      </View>

      {expandedView && (
        <View style={styles.expandedStats}>
          <Text style={styles.expandedStatsTitle}>
            Statistiques par catégorie
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(productStats.categoryCounts).map(
              ([category, count]) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryStatCard,
                    selectedCategory === category &&
                      styles.activeCategoryStatCard,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={styles.categoryStatValue}>{count}</Text>
                  <Text style={styles.categoryStatLabel}>{category}</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          <View style={styles.filterOptions}>
            <View style={styles.filterOption}>
              <Text style={styles.filterLabel}>Afficher produits épuisés</Text>
              <Switch
                value={showOutOfStock}
                onValueChange={setShowOutOfStock}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.filterOption}>
              <Text style={styles.filterLabel}>Afficher stock bas</Text>
              <Switch
                value={showLowStock}
                onValueChange={setShowLowStock}
                color={COLORS.primary}
              />
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gestion des Produits</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="refresh"
              iconColor={COLORS.primary}
              size={24}
              onPress={handleRefresh}
              disabled={loading || refreshing}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  iconColor={COLORS.primary}
                  size={24}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setSortBy("name");
                  setMenuVisible(false);
                }}
                title="Trier par nom"
                leadingIcon="sort-alphabetical-ascending"
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("price");
                  setMenuVisible(false);
                }}
                title="Trier par prix"
                leadingIcon="cash"
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("category");
                  setMenuVisible(false);
                }}
                title="Trier par catégorie"
                leadingIcon="tag"
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("stock");
                  setMenuVisible(false);
                }}
                title="Trier par stock"
                leadingIcon="package-variant"
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("popularity");
                  setMenuVisible(false);
                }}
                title="Trier par popularité"
                leadingIcon="star"
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  setMenuVisible(false);
                }}
                title={
                  sortOrder === "asc" ? "Ordre croissant" : "Ordre décroissant"
                }
                leadingIcon={
                  sortOrder === "asc" ? "sort-ascending" : "sort-descending"
                }
              />
            </Menu>
          </View>
        </View>
      </View>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        {renderStatsView()}
      </PanGestureHandler>

      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category &&
                    styles.categoryButtonTextActive,
                ]}
              >
                {category === "all" ? "Tous les produits" : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && filteredProducts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des produits...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.productGrid}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
        >
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="database-off"
                size={64}
                color={COLORS.primary}
              />
              <Text style={styles.emptyText}>Aucun produit trouvé</Text>
              <Button
                mode="contained"
                onPress={handleAddProduct}
                style={styles.emptyButton}
                buttonColor={COLORS.primary}
              >
                Ajouter un produit
              </Button>
            </View>
          ) : (
            <View style={styles.productsContainer}>
              <Text style={styles.resultsCount}>
                {filteredProducts.length} produit
                {filteredProducts.length > 1 ? "s" : ""} trouvé
                {filteredProducts.length > 1 ? "s" : ""}
              </Text>
              <View style={styles.productList}>
                {filteredProducts.map((product, index) => (
                  <React.Fragment key={product.id}>
                    {renderProductCard({ item: product, index })}
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddProduct}
        color="#FFFFFF"
      />

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Confirmer la suppression</Dialog.Title>
          <Dialog.Content>
            <Text>
              Êtes-vous sûr de vouloir supprimer "{selectedProduct?.name}" ?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Annuler
            </Button>
            <Button onPress={handleDeleteConfirm} textColor={COLORS.error}>
              Supprimer
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  headerActions: {
    flexDirection: "row",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  statsContainer: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  expandButton: {
    padding: 4,
  },
  statsCards: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    width: "23%",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeStatCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
  },
  expandedStats: {
    marginTop: 16,
  },
  expandedStatsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  categoryStatCard: {
    width: 100,
    height: 80,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCategoryStatCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  categoryStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  categoryStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 4,
  },
  filterOptions: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginRight: 8,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryScrollContent: {
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    color: COLORS.text,
  },
  categoryButtonTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.text,
  },
  productGrid: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 16,
  },
  emptyButton: {
    borderRadius: 8,
  },
  productsContainer: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  productList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outOfStockCard: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  lowStockCard: {
    borderColor: COLORS.warning,
    borderWidth: 1,
  },
  cardImageContainer: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#F0F0F0",
  },
  promotionalBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  promotionalText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  popularBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  cardDetails: {
    marginTop: 8,
  },
  categoryChip: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginRight: 4,
  },
  stockProgress: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stockValue: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  stockSuccess: {
    color: COLORS.success,
  },
  stockWarning: {
    color: COLORS.warning,
  },
  stockError: {
    color: COLORS.error,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  actionButton: {
    margin: 0,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
  },
});

export default ProductManagementScreen4;
