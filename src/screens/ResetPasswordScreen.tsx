import React, { useState } from "react";
import { View, StyleSheet, Alert, SafeAreaView } from "react-native";
import { resetPassword } from "../services/authService";
import {
  ActivityIndicator,
  Snackbar,
  Text,
  TextInput,
  Button,
  useTheme,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import EmailInput from "../components/EmailInput";
import ErrorMessage from "../components/ErrorMessage";

const ResetPasswordScreen = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleResetPassword = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEmailError("");
    setLoading(true);

    if (!validateEmail(email)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setEmailError("Email invalide");
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email);
      setSnackbarMessage("Un email de réinitialisation a été envoyé.");
      setSnackbarVisible(true);
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setSnackbarMessage((error as Error).message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#f8f9fa", "#e9ecef", "#f8f9fa"]}
        style={styles.backgroundGradient}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Réinitialisation du mot de passe</Text>
        <Text style={styles.subtitle}>
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </Text>

        <View style={styles.form}>
          <EmailInput value={email} onChange={setEmail} error={emailError} />
          <ErrorMessage message={emailError} />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Envoyer le lien
          </Button>
        </View>
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
    backgroundColor: "#FFA3B5",
  },
  backgroundGradient: {
    position: "absolute",
    top: 2,
    left: 8,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2d3436",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    backgroundColor: "rgba(230, 211, 211, 0.9)",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFA3B5",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  snackbar: {
    backgroundColor: "#FFA3B5",
  },
});

export default ResetPasswordScreen;
