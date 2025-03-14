import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { TextInput, Button, Avatar, Text, useTheme, Appbar, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { uploadImage } from '../firebase/storageService';

const EditProfileScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const theme = useTheme();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatar, setAvatar] = useState<string | null>(user?.photoURL || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhoneNumber(user.phoneNumber || '');
      setAvatar(user.photoURL || null);
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission d\'accès à la galerie refusée');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!displayName.trim()) {
      setError('Le nom complet est requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userRef = doc(db, 'users', user.uid);

      let photoURL = avatar;
      if (avatar && !avatar.startsWith('http')) {
        photoURL = await uploadImage(
          avatar,
          `users/${user.uid}/profile`,
          (progress: number) => setUploadProgress(progress)
        );
      }

      // Mise à jour du profil Firebase Auth
      await updateProfile(user, { displayName, photoURL });

      // Création/Mise à jour du document utilisateur dans Firestore
      await setDoc(userRef, {
        displayName,
        photoURL,
        phoneNumber,
        updatedAt: new Date(),
        email: user.email,
        uid: user.uid,
      }, { merge: true }); // merge: true permet de mettre à jour ou créer si n'existe pas

      setSnackbarVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
      console.error('Erreur de mise à jour du profil:', err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
};

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Modifier le profil" />
      </Appbar.Header>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.content}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Avatar.Image size={120} source={{ uri: avatar }} />
            ) : (
              <Avatar.Icon size={120} icon="account" />
            )}
            <Button
              mode="outlined"
              onPress={pickImage}
              style={styles.changePhotoButton}
              accessibilityLabel="Changer la photo de profil"
            >
              Changer la photo
            </Button>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <View style={styles.progressContainer}>
                <Text>Chargement: {Math.round(uploadProgress)}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                </View>
              </View>
            )}
          </View>

          <TextInput
            label="Nom complet"
            value={displayName}
            onChangeText={setDisplayName}
            mode="outlined"
            style={styles.input}
            accessibilityLabel="Nom complet"
          />
          <TextInput
            label="Numéro de téléphone"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            accessibilityLabel="Numéro de téléphone"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
          >
            Enregistrer les modifications
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        Profil mis à jour avec succès
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  avatarContainer: { alignItems: 'center', marginVertical: 20 },
  changePhotoButton: { marginTop: 12 },
  input: { marginBottom: 16 },
  saveButton: { marginTop: 8, marginBottom: 24 },
  errorText: { color: '#FF4952', marginBottom: 16, textAlign: 'center' },
  progressContainer: { marginTop: 12, alignItems: 'center' },
  progressBar: { width: '80%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#007AFF', borderRadius: 4 },
});

export default EditProfileScreen;