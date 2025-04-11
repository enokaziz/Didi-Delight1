import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#FF4952',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  productActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 8,
  },
});
