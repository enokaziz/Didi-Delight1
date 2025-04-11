import React, { memo } from 'react';
import { Animated, View, FlatList, StyleSheet } from 'react-native';
import { ProductCard } from '@components/common';
import type { Product } from '../../types/Product';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  fadeAnim: Animated.Value;
}

const homeStyles = StyleSheet.create({
  grid: {
    flex: 1,
    paddingHorizontal: 8,
  },
  gridContent: {
    paddingBottom: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardContainer: {
    // existing styles...
  },
});

const ProductGrid: React.FC<ProductGridProps> = memo(({ products, onAddToCart, fadeAnim }) => {
  return (
    <View style={homeStyles.grid}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              homeStyles.productCardContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ProductCard product={item} onAddToCart={onAddToCart} />
          </Animated.View>
        )}
        contentContainerStyle={homeStyles.gridContent}
      />
    </View>
  );
});

export default ProductGrid; 