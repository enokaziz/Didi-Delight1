import React, { memo } from 'react';
import { Animated, View, FlatList } from 'react-native';
import { ProductCard } from '@components/common';
import { styles as homeStyles } from '@styles/screens/home/styles';
import type { Product } from '../../types/Product';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  fadeAnim: Animated.Value;
}

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