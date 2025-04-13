import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, Alert } from "react-native";
import { resetPassword } from "../services/authService";
import {
  ActivityIndicator,
  Snackbar,
  Text,
  TextInput,
  Button,
} from "react-native-paper";
import * as Haptics from "expo-haptics";

const ResetPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email.trim());
  };

  const handleResetPassword = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEmailError("");
    setLoading(true);

    if (!validateEmail(email)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setEmailError("Veuillez entrer un email valide.");
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email);
      setSnackbarMessage("Un email de réinitialisation a été envoyé.");
      setSnackbarVisible(true);
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setSnackbarMessage("Une erreur s'est produite. Veuillez réessayer.");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Réinitialisation du mot de passe</Text>
        <Text style={styles.subtitle}>
          Entrez votre adresse email pour recevoir un lien de réinitialisation.
        </Text>

        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!emailError}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <Button
          mode="contained"
          onPress={handleResetPassword}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Envoyer le lien
        </Button>

        {loading && <ActivityIndicator size="large" color="#FF6347" />}
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#6c757d",
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FF6347",
  },
  snackbar: {
    backgroundColor: "#FF6347",
  },
});

export default ResetPasswordScreen;
