import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { 
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Portal,
  Dialog,
  List,
  Divider,
  IconButton,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event, EventType, EventProduct } from '../../types/event';
import { eventService } from '../../services/events/eventService';
import { useAuth } from '../../contexts/AuthContext';
import { EventsStackParamList } from '../../navigation/EventsNavigator';
import * as Localization from 'expo-localization';

type NavigationProps = StackNavigationProp<EventsStackParamList>;

const CreateEventScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProps>();
  const theme = useTheme();

  // États du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('wedding');
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [expectedGuests, setExpectedGuests] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [products, setProducts] = useState<EventProduct[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<EventProduct | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false); // Ajout pour le DatePicker

  // États de validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Gestion des produits
  const [currentProduct, setCurrentProduct] = useState<{
    productId: string;
    quantity: string;
    specialInstructions: string;
  }>({
    productId: '',
    quantity: '1',
    specialInstructions: '',
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    if (!description.trim()) {
      newErrors.description = 'La description est requise';
    }
    if (!location.trim()) {
      newErrors.location = 'Le lieu est requis';
    }
    if (!expectedGuests || isNaN(Number(expectedGuests))) {
      newErrors.expectedGuests = 'Le nombre d\'invités doit être un nombre valide';
    }
    if (!contactPhone.trim()) {
      newErrors.contactPhone = 'Le numéro de téléphone est requis';
    }
    if (contactEmail && !/\S+@\S+\.\S+/.test(contactEmail)) {
      newErrors.contactEmail = 'L\'email n\'est pas valide';
    }
    if (products.length === 0) {
      newErrors.products = 'Veuillez ajouter au moins un produit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEvent = async () => {
    if (!user || !validateForm()) return;

    try {
      const totalAmount = products.reduce((sum, product) => {
        const productPrice = 5000; // Prix fictif pour l'exemple
        return sum + (productPrice * product.quantity);
      }, 0);

      const eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        type,
        title,
        description,
        date,
        location,
        expectedGuests: Number(expectedGuests),
        products,
        status: 'pending',
        totalAmount,
        depositPaid: false,
        specialRequirements,
        contactPhone,
        contactEmail,
      };

      const eventId = await eventService.createEvent(eventData);
      navigation.navigate('EventDetails', { eventId });
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
    }
  };

  const handleAddProduct = () => {
    if (selectedProduct) {
      // Mode édition
      setProducts(products.map(p => 
        p.productId === selectedProduct.productId ? {
          productId: currentProduct.productId,
          quantity: Number(currentProduct.quantity),
          specialInstructions: currentProduct.specialInstructions
        } : p
      ));
    } else {
      // Nouveau produit
      setProducts([...products, {
        productId: currentProduct.productId,
        quantity: Number(currentProduct.quantity),
        specialInstructions: currentProduct.specialInstructions
      }]);
    }
    setShowProductDialog(false);
    setSelectedProduct(null);
    setCurrentProduct({
      productId: '',
      quantity: '1',
      specialInstructions: ''
    });
  };

  const handleEditProduct = (product: EventProduct) => {
    setSelectedProduct(product);
    setCurrentProduct({
      productId: product.productId,
      quantity: String(product.quantity),
      specialInstructions: product.specialInstructions || ''
    });
    setShowProductDialog(true);
  };

  const handleRemoveProduct = (productId: string) => {
    setProducts(products.filter(p => p.productId !== productId));
  };

  const formatDate = (date: Date) => {
    return format(date, 'PPP', { locale: fr });
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Créer un événement
      </Text>

      <TextInput
        label="Titre de l'événement"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
        error={!!errors.title}
      />
      <HelperText type="error" visible={!!errors.title}>
        {errors.title}
      </HelperText>

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
        error={!!errors.description}
      />
      <HelperText type="error" visible={!!errors.description}>
        {errors.description}
      </HelperText>

      <Text variant="bodyMedium" style={styles.label}>Type d'événement</Text>
      <SegmentedButtons
        value={type}
        onValueChange={value => setType(value as EventType)}
        buttons={[
          { value: 'wedding', label: 'Mariage' },
          { value: 'birthday', label: 'Anniversaire' },
          { value: 'ceremony', label: 'Cérémonie' },
          { value: 'other', label: 'Autre' },
        ]}
        style={styles.segmentedButtons}
      />

      {Platform.OS === 'ios' ? (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || date;
            setDate(currentDate);
          }}
          style={styles.datePicker}
        />
      ) : (
        <>
          <TextInput
            label="Date"
            value={formatDate(date)}
            style={styles.input}
            editable={false}
            right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
          />
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                const currentDate = selectedDate || date;
                setDate(currentDate);
              }}
            />
          )}
        </>
      )}

      <TextInput
        label="Lieu"
        value={location}
        onChangeText={setLocation}
        mode="outlined"
        style={styles.input}
        error={!!errors.location}
      />
      <HelperText type="error" visible={!!errors.location}>
        {errors.location}
      </HelperText>

      <TextInput
        label="Nombre d'invités"
        value={expectedGuests}
        onChangeText={setExpectedGuests}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        error={!!errors.expectedGuests}
      />
      <HelperText type="error" visible={!!errors.expectedGuests}>
        {errors.expectedGuests}
      </HelperText>

      <TextInput
        label="Exigences spéciales"
        value={specialRequirements}
        onChangeText={setSpecialRequirements}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <TextInput
        label="Téléphone de contact"
        value={contactPhone}
        onChangeText={setContactPhone}
        keyboardType="phone-pad"
        mode="outlined"
        style={styles.input}
        error={!!errors.contactPhone}
      />
      <HelperText type="error" visible={!!errors.contactPhone}>
        {errors.contactPhone}
      </HelperText>

      <TextInput
        label="Email de contact (optionnel)"
        value={contactEmail}
        onChangeText={setContactEmail}
        keyboardType="email-address"
        mode="outlined"
        style={styles.input}
        error={!!errors.contactEmail}
      />
      <HelperText type="error" visible={!!errors.contactEmail}>
        {errors.contactEmail}
      </HelperText>

      <View style={styles.productsSection}>
        <View style={styles.productHeader}>
          <Text variant="titleMedium">Produits</Text>
          <Button
            mode="contained"
            onPress={() => setShowProductDialog(true)}
            icon="plus"
          >
            Ajouter un produit
          </Button>
        </View>

        {products.map((product, index) => (
          <List.Item
            key={`${product.productId}-${index}`}
            title={`Produit ${product.productId}`}
            description={`Quantité: ${product.quantity}${product.specialInstructions ? `\n${product.specialInstructions}` : ''}`}
            right={props => (
              <View style={styles.productActions}>
                <IconButton
                  icon="pencil"
                  onPress={() => handleEditProduct(product)}
                />
                <IconButton
                  icon="delete"
                  onPress={() => handleRemoveProduct(product.productId)}
                />
              </View>
            )}
          />
        ))}
        {!!errors.products && (
          <HelperText type="error" visible={!!errors.products}>
            {errors.products}
          </HelperText>
        )}
      </View>

      <Button
        mode="contained"
        onPress={handleSaveEvent}
        style={styles.submitButton}
      >
        Créer l'événement
      </Button>

      <Portal>
        <Dialog visible={showProductDialog} onDismiss={() => setShowProductDialog(false)}>
          <Dialog.Title>
            {selectedProduct ? 'Modifier le produit' : 'Ajouter un produit'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="ID du produit"
              value={currentProduct.productId}
              onChangeText={value => setCurrentProduct({ ...currentProduct, productId: value })}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Quantité"
              value={currentProduct.quantity}
              onChangeText={value => setCurrentProduct({ ...currentProduct, quantity: value })}
              keyboardType="numeric"
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Instructions spéciales"
              value={currentProduct.specialInstructions}
              onChangeText={value => setCurrentProduct({ ...currentProduct, specialInstructions: value })}
              mode="outlined"
              multiline
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowProductDialog(false)}>Annuler</Button>
            <Button onPress={handleAddProduct}>
              {selectedProduct ? 'Modifier' : 'Ajouter'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  productsSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productActions: {
    flexDirection: 'row',
  },
  dialogInput: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  datePicker: {
    marginBottom: 16,
  },
});

export default CreateEventScreen;