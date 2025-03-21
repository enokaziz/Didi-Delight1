// screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
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
import { useCart } from "@contexts/CartContext";
import { useProducts } from "@hooks/useProducts";
import { 
  ProductCard, 
  SearchBar, 
  EmptyState, 
  SkeletonProductCard 
} from "@components/common";
import { 
  CategoryFilter, 
  SortPicker, 
  HomeHeader,
  ProductGrid
} from "@components/home";
import { COLORS, SPACING } from "@theme/theme";
import { styles as homeStyles } from '@styles/screens/home/styles';

const HomeScreen: React.FC = () => {
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

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, fadeAnim]);

  const renderHeader = useCallback(() => (
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
  ), [error, totalCount, products.length, selectedCategory, sortOption, searchQuery, categories, resetFilters, onRefresh, setSearchQuery, setSelectedCategory, setSortOption]);

  const renderSkeletonLoading = () => (
    <SafeAreaView style={homeStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.default} />
      <View style={homeStyles.container}>
        {renderHeader()}
        <View style={homeStyles.skeletonContainer}>
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
    <SafeAreaView style={homeStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.default} />
      <Animated.View style={[homeStyles.container, { opacity: fadeAnim }]}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductGrid
              products={[item]}
              onAddToCart={addToCart}
              fadeAnim={fadeAnim}
            />
          )}
          numColumns={3}
          columnWrapperStyle={null}
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
          initialNumToRender={9}
          maxToRenderPerBatch={6}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={
            products.length === 0 ? { flexGrow: 1 } : homeStyles.listContent
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default HomeScreen;