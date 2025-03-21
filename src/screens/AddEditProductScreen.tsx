import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Product } from '../types/Product';
import { createProduct, updateProduct, uploadImage } from '../firebase/productService';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';

const COLORS = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#f5f5f5',
  text: '#333',
  border: '#ddd',
  error: 'red',
};

const AddEditProductScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'AddEditProduct'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddEditProduct'>>();
  const { product } = route.params || {};

  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price ? String(product.price) : '');
  const [category, setCategory] = useState(product?.category || '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const [description, setDescription] = useState(product?.description || '');
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour sélectionner une image
  const handleSelectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          Toast.show({
            type: 'info',
            text1: 'Annulé',
            text2: 'Aucune image sélectionnée.',
          });
        } else if (response.errorMessage) {
          Toast.show({
            type: 'error',
            text1: 'Erreur',
            text2: response.errorMessage,
          });
        } else if (response.assets && response.assets.length > 0) {
          if (!response.assets[0].uri) {
            Toast.show({
              type: 'error',
              text1: 'Erreur',
              text2: 'Échec du téléchargement de l\'image.',
            });
            return;
          }
          setImageUrl(response.assets[0].uri || '');
        }
      }
    );
  };

  // Validation du prix
  const isValidPrice = (value: string) => {
    const parsed = parseFloat(value.replace(',', '.'));
    return !isNaN(parsed) && parsed > 0;
  };

  const handleSave = async () => {
    if (!name || !price || !category) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez remplir tous les champs obligatoires.',
      });
      return;
    }

    if (!['Gâteaux', 'Plats', 'Jus'].includes(category)) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez sélectionner une catégorie valide.',
      });
      return;
    }

    if (!isValidPrice(price)) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Le prix doit être un nombre positif.',
      });
      return;
    }

    setIsLoading(true);
    try {
      let finalImageUrl = imageUrl;
      
      // Si une nouvelle image a été sélectionnée (URI local), l'uploader vers Firestore Storage
      if (imageUrl && imageUrl.startsWith('file://')) {
        finalImageUrl = await uploadImage(imageUrl);
      }

      const productData = {
        name,
        price: parseFloat(price.replace(',', '.')),
        category,
        imageUrl: finalImageUrl,
        description,
        stock: product?.stock || 0,
        rating: product?.rating || 0,
        reviews: product?.reviews || 0,
        isPromotional: product?.isPromotional || false,
        isPopular: product?.isPopular || false,
      };

      if (product) {
        await updateProduct({ ...product, ...productData });
        Toast.show({
          type: 'success',
          text1: 'Produit mis à jour !',
        });
      } else {
        await createProduct(productData);
        Toast.show({
          type: 'success',
          text1: 'Produit ajouté !',
        });
      }

      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du produit :', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Une erreur s\'est produite. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product ? 'Modifier le produit' : 'Ajouter un produit'}</Text>

      <TextInput
        placeholder="Nom du produit"
        value={name}
        onChangeText={setName}
        style={[styles.input, !name && { borderColor: COLORS.error }]}
        accessibilityLabel="Nom du produit"
      />

      <TextInput
        placeholder="Prix (ex: 12.99)"
        value={price}
        onChangeText={setPrice}
        style={styles.input}
        keyboardType="decimal-pad"
        accessibilityLabel="Prix du produit"
      />

      <TextInput
        placeholder="Catégorie"
        value={category}
        onChangeText={setCategory}
        style={[styles.input, !category && { borderColor: COLORS.error }]}
        accessibilityLabel="Catégorie du produit"
      />

      <TextInput
        placeholder="Description du produit"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        accessibilityLabel="Description du produit"
      />

      <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
        <Text style={styles.imageButtonText}>
          {imageUrl ? "Changer l'image" : "Sélectionner une image"}
        </Text>
      </TouchableOpacity>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.imagePreview} />}

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>
            {product ? 'Mettre à jour' : 'Ajouter'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Annuler</Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: COLORS.text,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddEditProductScreen;