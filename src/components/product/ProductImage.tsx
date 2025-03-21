import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@theme/theme';

interface ProductImageProps {
  imageUrl: string;
  productName: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ imageUrl, productName }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, isZoomed && styles.zoomedImage]}
        resizeMode="cover"
        accessibilityLabel={`Image de ${productName}`}
      />
      <TouchableOpacity
        style={styles.zoomButton}
        onPress={() => setIsZoomed(!isZoomed)}
        accessibilityLabel={isZoomed ? "Réduire l'image" : "Agrandir l'image"}
      >
        <Ionicons
          name={isZoomed ? 'contract-outline' : 'expand-outline'}
          size={24}
          color={COLORS.text.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  zoomedImage: {
    transform: [{ scale: 1.5 }],
  },
  zoomButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.background.paper,
    padding: SPACING.sm,
    borderRadius: 20,
    shadowColor: COLORS.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ProductImage; 