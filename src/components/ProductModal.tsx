import React from 'react';
import { Modal, TextInput, Button, StyleSheet, View, Text } from 'react-native';
import { Product } from '../types/Product';

interface ProductModalProps {
  isVisible: boolean;
  onDismiss: () => void;
  newProductName: string;
  setNewProductName: (name: string) => void;
  newProductPrice: string;
  setNewProductPrice: (price: string) => void;
  newProductCategory: string;
  setNewProductCategory: (category: string) => void;
  handleAddProduct: () => void;
  handleUpdateProduct: () => void;
  editingProduct: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isVisible,
  onDismiss,
  newProductName,
  setNewProductName,
  newProductPrice,
  setNewProductPrice,
  newProductCategory,
  setNewProductCategory,
  handleAddProduct,
  handleUpdateProduct,
  editingProduct,
}) => {
  return (
    <Modal visible={isVisible} onRequestClose={onDismiss} transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
          </Text>
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
          <TextInput
            placeholder="Catégorie"
            value={newProductCategory}
            onChangeText={setNewProductCategory}
            style={styles.input}
            accessibilityLabel="Catégorie du produit"
          />
          <View style={styles.modalButtons}>
            <Button
              title={editingProduct ? 'Mettre à jour' : 'Ajouter'}
              onPress={editingProduct ? handleUpdateProduct : handleAddProduct}
              accessibilityLabel={editingProduct ? 'Mettre à jour le produit' : 'Ajouter le produit'}
            />
            <Button
              title="Annuler"
              onPress={onDismiss}
              accessibilityLabel="Annuler"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
});

export default ProductModal;