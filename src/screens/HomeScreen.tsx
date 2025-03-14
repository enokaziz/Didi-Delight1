// screens/HomeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Animated,
  Platform,
} from "react-native";
import { useCart } from "../contexts/CartContext";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/common/ProductCard";
import SearchBar from "../components/common/SearchBar";
import CategoryFilter from "../components/home/CategoryFilter";
import SortPicker from "../components/home/SortPicker";
import EmptyState from "../components/common/EmptyState";
import HomeHeader from "../components/home/HomeHeader";
import SkeletonProductCard from "../components/common/SkeletonProductCard";
import { COLORS, SPACING } from "../theme/theme";

const HomeScreen = () => {
  const { addToCart } = useCart();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const {
    products,
    loading,
    error,
    refreshing,
    categories,
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    resetFilters,
    onRefresh,
    totalCount,
    loadMore,
    hasMore,
  } = useProducts();

  // Animation de fondu
  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, fadeAnim]);

  // Rendu du header avec la barre de recherche
  const renderHeader = () => (
    <>
      <HomeHeader 
        title="Catalogue" 
        productsCount={totalCount}
        onResetFilters={resetFilters}
        showReset={products.length > 0 && (!!selectedCategory || !!sortOption || !!searchQuery)}
      />
      
      {error ? (
        <EmptyState 
          type="error" 
          message={error} 
          onAction={onRefresh} 
        />
      ) : (
        <>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <SortPicker
            selectedValue={sortOption}
            onValueChange={(value) => setSortOption(value)}
          />
        </>
      )}
    </>
  );

  // Rendu du skeleton loading
  const renderSkeletonLoading = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.default} />
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.skeletonContainer}>
          {Array(6).fill(0).map((_, index) => (
            <SkeletonProductCard key={index} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );

  if (loading && !refreshing) {
    return renderSkeletonLoading();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.default} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ 
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  }) 
                }]
              }}
            >
              <ProductCard
                product={item}
                onAddToCart={addToCart}
              />
            </Animated.View>
          )}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary.main]}
              tintColor={COLORS.primary.main}
            />
          }
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState 
              type={searchQuery ? "search" : "empty"} 
              searchQuery={searchQuery}
              onAction={searchQuery ? () => setSearchQuery("") : onRefresh}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={
            products.length === 0 ? { flexGrow: 1 } : styles.listContent
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  row: {
    justifyContent: "space-between",
    marginHorizontal: SPACING.md,
  },
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
  },
});

export default HomeScreen;