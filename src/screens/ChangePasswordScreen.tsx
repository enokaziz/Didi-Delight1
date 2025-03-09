import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { TextInput, Button, Text, Snackbar, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ChangePasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const navigation = useNavigation();
  const { updatePassword } = useAuth();
  const theme = useTheme();

  // Validation du formulaire
  const validateForm = () => {
    if (!currentPassword) {
      showSnackbar('Veuillez entrer votre mot de passe actuel');
      return false;
    }
    
    if (!newPassword) {
      showSnackbar('Veuillez entrer un nouveau mot de passe');
      return false;
    }
    
    if (newPassword.length < 8) {
      showSnackbar('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      showSnackbar('Les mots de passe ne correspondent pas');
      return false;
    }
    
    return true;
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Simuler l'appel à l'API pour changer le mot de passe
      // Dans une application réelle, vous utiliseriez updatePassword de Firebase
      // await updatePassword(currentPassword, newPassword);
      
      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Succès',
        'Votre mot de passe a été mis à jour avec succès',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      showSnackbar(error.message || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Modifier le mot de passe</Text>
          </View>
          
          <Text style={styles.subtitle}>
            Créez un mot de passe fort avec au moins 8 caractères, incluant des lettres majuscules, 
            minuscules, des chiffres et des caractères spéciaux.
          </Text>
          
          <View style={styles.form}>
            {/* Mot de passe actuel */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Mot de passe actuel"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                style={styles.input}
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon={showCurrentPassword ? "eye-off" : "eye"}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                }
              />
            </View>
            
            {/* Nouveau mot de passe */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Nouveau mot de passe"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                style={styles.input}
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon={showNewPassword ? "eye-off" : "eye"}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  />
                }
              />
            </View>
            
            {/* Confirmation du nouveau mot de passe */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Confirmer le nouveau mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />
            </View>
            
            {/* Indicateur de force du mot de passe */}
            {newPassword.length > 0 && (
              <View style={styles.passwordStrength}>
                <Text style={styles.passwordStrengthText}>
                  Force du mot de passe: {getPasswordStrength(newPassword)}
                </Text>
                <View style={styles.strengthBar}>
                  <View 
                    style={[
                      styles.strengthIndicator, 
                      { width: `${getPasswordStrengthPercentage(newPassword)}%`, 
                      backgroundColor: getPasswordStrengthColor(newPassword) }
                    ]} 
                  />
                </View>
              </View>
            )}
            
            {/* Bouton de soumission */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              Mettre à jour le mot de passe
            </Button>
          </View>
        </ScrollView>
        
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Fonction pour évaluer la force du mot de passe
const getPasswordStrength = (password: string): string => {
  if (password.length < 6) return 'Faible';
  if (password.length < 10) return 'Moyen';
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  if (strength < 3) return 'Moyen';
  if (strength === 3) return 'Fort';
  return 'Très fort';
};

// Fonction pour obtenir le pourcentage de force du mot de passe
const getPasswordStrengthPercentage = (password: string): number => {
  if (password.length < 6) return 25;
  if (password.length < 10) return 50;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  if (strength < 3) return 50;
  if (strength === 3) return 75;
  return 100;
};

// Fonction pour obtenir la couleur de l'indicateur de force
const getPasswordStrengthColor = (password: string): string => {
  const strength = getPasswordStrength(password);
  
  switch (strength) {
    case 'Faible':
      return '#FF4952'; // Rouge
    case 'Moyen':
      return '#FFA500'; // Orange
    case 'Fort':
      return '#4CAF50'; // Vert
    case 'Très fort':
      return '#2E7D32'; // Vert foncé
    default:
      return '#FF4952';
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  passwordStrength: {
    marginBottom: 24,
  },
  passwordStrengthText: {
    fontSize: 14,
    marginBottom: 8,
  },
  strengthBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthIndicator: {
    height: '100%',
    borderRadius: 4,
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
});

export default ChangePasswordScreen;
