import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '@theme/theme';

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
}

interface ProductReviewsProps {
  reviews: Review[];
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avis clients</Text>
      {reviews.length === 0 ? (
        <Text style={styles.noReviews}>Aucun avis pour le moment</Text>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.reviewContainer}>
            <View style={styles.reviewHeader}>
              <Text style={styles.author}>{review.author}</Text>
              <Text style={styles.date}>{review.date}</Text>
            </View>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < review.rating ? 'star' : 'star-outline'}
                  size={16}
                  color={COLORS.primary.main}
                />
              ))}
            </View>
            <Text style={styles.comment}>{review.comment}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.background.paper,
    borderRadius: 8,
  },
  title: {
    ...TYPOGRAPHY.title,
    marginBottom: SPACING.md,
  },
  noReviews: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    padding: SPACING.md,
  },
  reviewContainer: {
    marginBottom: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  author: {
    ...TYPOGRAPHY.subtitle,
  },
  date: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  comment: {
    ...TYPOGRAPHY.body,
  },
});

export default ProductReviews; 