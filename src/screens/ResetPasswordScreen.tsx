import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { resetPassword } from "../services/authService";
import { ActivityIndicator, Snackbar } from "react-native-paper";

const ResetPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleResetPassword = async () => {
    setLoading(true);
    try {     
      await resetPassword(email);
     setSnackbarMessage("Un email de réinitialisation a été envoyé.");
     setSnackbarVisible(true);
    } catch (error: unknown) {
      setSnackbarMessage((error as Error).message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Entrez votre email"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Réinitialiser le mot de passe" onPress={handleResetPassword} />
      {loading && <ActivityIndicator size="large" color="#FF6347" />}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}      
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default ResetPasswordScreen;
