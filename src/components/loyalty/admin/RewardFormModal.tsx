import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LoyaltyReward } from '../../../types/loyaltyPoints';
import { Picker } from '@react-native-picker/picker';

interface RewardFormModalProps {
  visible: boolean;
  reward: LoyaltyReward | null;
  onClose: () => void;
  onSave: (reward: Omit<LoyaltyReward, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
}

const RewardFormModal: React.FC<RewardFormModalProps> = ({
  visible,
  reward,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pointsCost, setPointsCost] = useState('');
  const [type, setType] = useState<LoyaltyReward['type']>('discount');
  const [discountValue, setDiscountValue] = useState('');
  const [productId, setProductId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialiser le formulaire avec les données de la récompense si elle existe
  useEffect(() => {
    if (reward) {
      setName(reward.name);
      setDescription(reward.description);
      setPointsCost(reward.pointsCost.toString());
      setType(reward.type);
      setDiscountValue(reward.discountValue?.toString() || '');
      setProductId(reward.productId || '');
      setImageUrl(reward.imageUrl || '');
      setActive(reward.active);
    } else {
      resetForm();
    }
  }, [reward, visible]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPointsCost('');
    setType('discount');
    setDiscountValue('');
    setProductId('');
    setImageUrl('');
    setActive(true);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDelete = () => {
    if (!onDelete) return;
    
    Alert.alert(
      'Supprimer la récompense',
      'Êtes-vous sûr de vouloir supprimer cette récompense ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const success = await onDelete();
              if (success) {
                handleClose();
              } else {
                setError('Une erreur est survenue lors de la suppression');
              }
            } catch (err) {
              setError('Une erreur est survenue lors de la suppression');
              console.error(err);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('Le nom est obligatoire');
      return false;
    }
    
    if (!description.trim()) {
      setError('La description est obligatoire');
      return false;
    }
    
    const cost = parseInt(pointsCost);
    if (isNaN(cost) || cost <= 0) {
      setError('Le coût en points doit être un nombre positif');
      return false;
    }
    
    if (type === 'discount') {
      const discount = parseInt(discountValue);
      if (isNaN(discount) || discount <= 0 || discount > 100) {
        setError('La valeur de réduction doit être un pourcentage entre 1 et 100');
        return false;
      }
    }
    
    if (type === 'freeProduct' && !productId.trim()) {
      setError('L\'ID du produit est obligatoire pour ce type de récompense');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const rewardData: Omit<LoyaltyReward, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        description,
        pointsCost: parseInt(pointsCost),
        type,
        active,
        ...(type === 'discount' && { discountValue: parseInt(discountValue) }),
        ...(type === 'freeProduct' && { productId }),
        ...(imageUrl.trim() && { imageUrl }),
      };
      
      const success = await onSave(rewardData);
      
      if (success) {
        handleClose();
      } else {
        setError('Une erreur est survenue lors de l\'enregistrement');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'enregistrement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (type) {
      case 'discount':
        return (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Valeur de la réduction (%)</Text>
            <TextInput
              style={styles.input}
              value={discountValue}
              onChangeText={setDiscountValue}
              keyboardType="numeric"
              placeholder="Entrez le pourcentage de réduction"
            />
          </View>
        );
      case 'freeProduct':
        return (
          <View style={styles.formGroup}>
            <Text style={styles.label}>ID du produit</Text>
            <TextInput
              style={styles.input}
              value={productId}
              onChangeText={setProductId}
              placeholder="Entrez l'ID du produit gratuit"
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {reward ? 'Modifier la récompense' : 'Créer une récompense'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Entrez le nom de la récompense"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Entrez une description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Coût en points</Text>
              <TextInput
                style={styles.input}
                value={pointsCost}
                onChangeText={setPointsCost}
                keyboardType="numeric"
                placeholder="Entrez le coût en points"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type de récompense</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={type}
                  onValueChange={(itemValue) => setType(itemValue as LoyaltyReward['type'])}
                  style={styles.picker}
                >
                  <Picker.Item label="Réduction" value="discount" />
                  <Picker.Item label="Produit gratuit" value="freeProduct" />
                  <Picker.Item label="Livraison gratuite" value="freeDelivery" />
                  <Picker.Item label="Offre exclusive" value="exclusive" />
                  <Picker.Item label="Événement" value="event" />
                </Picker>
              </View>
            </View>

            {renderTypeSpecificFields()}

            <View style={styles.formGroup}>
              <Text style={styles.label}>URL de l'image (optionnel)</Text>
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="Entrez l'URL de l'image"
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Récompense active</Text>
              <Switch
                value={active}
                onValueChange={setActive}
                trackColor={{ false: '#ddd', true: '#FEE7F2' }}
                thumbColor={active ? '#F04E98' : '#f4f3f4'}
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {reward ? 'Mettre à jour' : 'Créer la récompense'}
                </Text>
              )}
            </TouchableOpacity>

            {reward && onDelete && (
              <TouchableOpacity
                style={[styles.deleteButton, loading && styles.disabledButton]}
                onPress={handleDelete}
                disabled={loading}
              >
                <FontAwesome5 name="trash-alt" size={16} color="white" />
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
  },
  submitButton: {
    backgroundColor: '#F04E98',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
});

export default RewardFormModal;
