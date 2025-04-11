import React, { useState } from 'react';
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
  ScrollView
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LoyaltyPoints } from '../../../types/loyaltyPoints';

interface UserPointsModalProps {
  visible: boolean;
  user: LoyaltyPoints | null;
  onClose: () => void;
  onAddPoints: (userId: string, points: number, description: string) => Promise<boolean>;
}

const UserPointsModal: React.FC<UserPointsModalProps> = ({
  visible,
  user,
  onClose,
  onAddPoints,
}) => {
  const [points, setPoints] = useState('');
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(true); // true = ajouter, false = retirer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setPoints('');
    setDescription('');
    setIsAdding(true);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    const pointsValue = parseInt(points);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      setError('Veuillez entrer un nombre valide de points');
      return;
    }

    if (!description.trim()) {
      setError('Veuillez entrer une description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Si on retire des points, on envoie une valeur négative
      const pointsToAdd = isAdding ? pointsValue : -pointsValue;
      const success = await onAddPoints(user.id, pointsToAdd, description);
      
      if (success) {
        handleClose();
      } else {
        setError('Une erreur est survenue lors de la modification des points');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la modification des points');
      console.error(err);
    } finally {
      setLoading(false);
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
              {isAdding ? 'Ajouter des points' : 'Retirer des points'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {user && (
              <View style={styles.userInfoContainer}>
                <Text style={styles.userName}>{user.userName || 'Utilisateur'}</Text>
                <Text style={styles.userEmail}>{user.userEmail || 'Aucun email'}</Text>
                <View style={styles.pointsInfoContainer}>
                  <Text style={styles.pointsInfoLabel}>Points actuels:</Text>
                  <Text style={styles.pointsInfoValue}>{user.points}</Text>
                </View>
              </View>
            )}

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, isAdding && styles.toggleButtonActive]}
                onPress={() => setIsAdding(true)}
              >
                <FontAwesome5 name="plus" size={16} color={isAdding ? 'white' : '#666'} />
                <Text style={[styles.toggleButtonText, isAdding && styles.toggleButtonTextActive]}>
                  Ajouter
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !isAdding && styles.toggleButtonActive]}
                onPress={() => setIsAdding(false)}
              >
                <FontAwesome5 name="minus" size={16} color={!isAdding ? 'white' : '#666'} />
                <Text style={[styles.toggleButtonText, !isAdding && styles.toggleButtonTextActive]}>
                  Retirer
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre de points</Text>
              <TextInput
                style={styles.input}
                value={points}
                onChangeText={setPoints}
                keyboardType="numeric"
                placeholder="Entrez le nombre de points"
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
                  {isAdding ? 'Ajouter les points' : 'Retirer les points'}
                </Text>
              )}
            </TouchableOpacity>
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
    maxHeight: '80%',
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
  userInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  pointsInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  pointsInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  pointsInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F04E98',
    marginLeft: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#F04E98',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 8,
  },
  toggleButtonTextActive: {
    color: 'white',
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
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default UserPointsModal;
