import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  IconButton, 
  FAB, 
  Dialog, 
  Portal, 
  TextInput,
  Snackbar,
  useTheme,
  Divider
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Type pour les adresses
type Address = {
  id: string;
  title: string;
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

const AddressesScreen = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Champs du formulaire
  const [title, setTitle] = useState('');
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  const navigation = useNavigation();
  const theme = useTheme();

  // Charger les adresses (simulation)
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données de test
        const mockAddresses: Address[] = [
          {
            id: '1',
            title: 'Domicile',
            fullName: 'Jean Dupont',
            street: '123 Rue de la Paix',
            city: 'Paris',
            postalCode: '75001',
            country: 'France',
            phone: '+33 6 12 34 56 78',
            isDefault: true
          },
          {
            id: '2',
            title: 'Bureau',
            fullName: 'Jean Dupont',
            street: '45 Avenue des Champs-Élysées',
            city: 'Paris',
            postalCode: '75008',
            country: 'France',
            phone: '+33 6 98 76 54 32',
            isDefault: false
          }
        ];
        
        setAddresses(mockAddresses);
      } catch (error) {
        console.error('Erreur lors du chargement des adresses:', error);
        showSnackbar('Erreur lors du chargement des adresses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddresses();
  }, []);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Ouvrir le dialogue d'ajout/modification
  const openAddressDialog = (address?: Address) => {
    if (address) {
      // Mode édition
      setIsEditing(true);
      setCurrentAddress(address);
      setTitle(address.title);
      setFullName(address.fullName);
      setStreet(address.street);
      setCity(address.city);
      setPostalCode(address.postalCode);
      setCountry(address.country);
      setPhone(address.phone);
      setIsDefault(address.isDefault);
    } else {
      // Mode ajout
      setIsEditing(false);
      setCurrentAddress(null);
      setTitle('');
      setFullName('');
      setStreet('');
      setCity('');
      setPostalCode('');
      setCountry('');
      setPhone('');
      setIsDefault(false);
    }
    
    setDialogVisible(true);
  };

  // Fermer le dialogue
  const closeDialog = () => {
    setDialogVisible(false);
  };

  // Valider le formulaire
  const validateForm = () => {
    if (!title || !fullName || !street || !city || !postalCode || !country || !phone) {
      showSnackbar('Veuillez remplir tous les champs');
      return false;
    }
    
    // Validation simple du code postal (format français)
    if (!/^\d{5}$/.test(postalCode)) {
      showSnackbar('Le code postal doit contenir 5 chiffres');
      return false;
    }
    
    // Validation simple du numéro de téléphone
    if (!/^(\+\d{1,3}\s?)?\d{8,}$/.test(phone.replace(/\s/g, ''))) {
      showSnackbar('Veuillez entrer un numéro de téléphone valide');
      return false;
    }
    
    return true;
  };

  // Sauvegarder l'adresse
  const saveAddress = () => {
    if (!validateForm()) return;
    
    if (isEditing && currentAddress) {
      // Mise à jour d'une adresse existante
      const updatedAddresses = addresses.map(addr => 
        addr.id === currentAddress.id 
          ? { 
              ...addr, 
              title, 
              fullName, 
              street, 
              city, 
              postalCode, 
              country, 
              phone, 
              isDefault 
            } 
          : isDefault ? { ...addr, isDefault: false } : addr
      );
      
      setAddresses(updatedAddresses);
      showSnackbar('Adresse mise à jour avec succès');
    } else {
      // Ajout d'une nouvelle adresse
      const newAddress: Address = {
        id: Date.now().toString(),
        title,
        fullName,
        street,
        city,
        postalCode,
        country,
        phone,
        isDefault
      };
      
      // Si la nouvelle adresse est définie par défaut, mettre à jour les autres
      const updatedAddresses = isDefault 
        ? addresses.map(addr => ({ ...addr, isDefault: false }))
        : [...addresses];
      
      setAddresses([...updatedAddresses, newAddress]);
      showSnackbar('Adresse ajoutée avec succès');
    }
    
    closeDialog();
  };

  // Confirmer la suppression
  const confirmDelete = (address: Address) => {
    setCurrentAddress(address);
    setDeleteDialogVisible(true);
  };

  // Supprimer l'adresse
  const deleteAddress = () => {
    if (!currentAddress) return;
    
    const updatedAddresses = addresses.filter(addr => addr.id !== currentAddress.id);
    setAddresses(updatedAddresses);
    
    // Si l'adresse supprimée était celle par défaut, définir la première adresse comme défaut
    if (currentAddress.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }
    
    showSnackbar('Adresse supprimée avec succès');
    setDeleteDialogVisible(false);
  };

  // Définir une adresse comme adresse par défaut
  const setDefaultAddress = (address: Address) => {
    if (address.isDefault) return;
    
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === address.id
    }));
    
    setAddresses(updatedAddresses);
    showSnackbar('Adresse par défaut mise à jour');
  };

  // Rendu d'une adresse
  const renderAddress = ({ item }: { item: Address }) => (
    <Card style={styles.addressCard}>
      <Card.Content>
        <View style={styles.addressHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.addressTitle}>{item.title}</Text>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Par défaut</Text>
              </View>
            )}
          </View>
          <View style={styles.actionButtons}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => openAddressDialog(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => confirmDelete(item)}
            />
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.addressName}>{item.fullName}</Text>
        <Text style={styles.addressDetail}>{item.street}</Text>
        <Text style={styles.addressDetail}>{item.postalCode} {item.city}</Text>
        <Text style={styles.addressDetail}>{item.country}</Text>
        <Text style={styles.addressDetail}>{item.phone}</Text>
        
        {!item.isDefault && (
          <Button
            mode="outlined"
            onPress={() => setDefaultAddress(item)}
            style={styles.defaultButton}
          >
            Définir comme adresse par défaut
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Mes adresses</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Chargement des adresses...</Text>
          </View>
        ) : (
          <>
            {addresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="location-off" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Aucune adresse enregistrée</Text>
                <Text style={styles.emptySubtext}>
                  Ajoutez une adresse pour faciliter vos commandes
                </Text>
                <Button 
                  mode="contained" 
                  onPress={() => openAddressDialog()}
                  style={styles.addButton}
                >
                  Ajouter une adresse
                </Button>
              </View>
            ) : (
              <FlatList
                data={addresses}
                renderItem={renderAddress}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.addressList}
              />
            )}
          </>
        )}
        
        {/* Bouton d'ajout flottant */}
        {addresses.length > 0 && (
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => openAddressDialog()}
            label="Ajouter"
          />
        )}
        
        {/* Dialogue d'ajout/modification d'adresse */}
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={closeDialog} style={styles.dialog}>
            <Dialog.Title>{isEditing ? 'Modifier l\'adresse' : 'Ajouter une adresse'}</Dialog.Title>
            <Dialog.Content>
              <ScrollView style={styles.dialogScroll}>
                <TextInput
                  label="Titre (ex: Domicile, Bureau)"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  mode="outlined"
                />
                
                <TextInput
                  label="Nom complet"
                  value={fullName}
                  onChangeText={setFullName}
                  style={styles.input}
                  mode="outlined"
                />
                
                <TextInput
                  label="Rue et numéro"
                  value={street}
                  onChangeText={setStreet}
                  style={styles.input}
                  mode="outlined"
                />
                
                <TextInput
                  label="Ville"
                  value={city}
                  onChangeText={setCity}
                  style={styles.input}
                  mode="outlined"
                />
                
                <TextInput
                  label="Code postal"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
                
                <TextInput
                  label="Pays"
                  value={country}
                  onChangeText={setCountry}
                  style={styles.input}
                  mode="outlined"
                />
                
                <TextInput
                  label="Téléphone"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="phone-pad"
                />
                
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setIsDefault(!isDefault)}
                >
                  <IconButton
                    icon={isDefault ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={24}
                    onPress={() => setIsDefault(!isDefault)}
                  />
                  <Text>Définir comme adresse par défaut</Text>
                </TouchableOpacity>
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={closeDialog}>Annuler</Button>
              <Button onPress={saveAddress}>Enregistrer</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
        {/* Dialogue de confirmation de suppression */}
        <Portal>
          <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
            <Dialog.Title>Confirmer la suppression</Dialog.Title>
            <Dialog.Content>
              <Text>Êtes-vous sûr de vouloir supprimer cette adresse ?</Text>
              {currentAddress?.isDefault && (
                <Text style={styles.warningText}>
                  Attention : c'est votre adresse par défaut.
                </Text>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDeleteDialogVisible(false)}>Annuler</Button>
              <Button onPress={deleteAddress} textColor="#FF4952">Supprimer</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
        {/* Snackbar pour les messages */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  addButton: {
    paddingHorizontal: 16,
  },
  addressList: {
    padding: 16,
  },
  addressCard: {
    marginBottom: 16,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    color: '#2e7d32',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  divider: {
    marginVertical: 8,
  },
  addressName: {
    fontSize: 16,
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  defaultButton: {
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogScroll: {
    maxHeight: 400,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  warningText: {
    color: '#FF4952',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default AddressesScreen;
