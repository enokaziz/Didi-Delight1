import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmailInputProps } from "../types/EmailInputProps";

const EmailInput: React.FC<EmailInputProps> = ({ value, onChange, error }) => (
  <View style={[styles.inputContainer, error ? styles.inputError : null]}>
    <Ionicons
      name="mail-outline"
      size={20}
      color="#6c757d"
      style={styles.inputIcon}
    />
    <TextInput
      placeholder="Adresse email"
      value={value}
      onChangeText={onChange}
      style={styles.input}
      placeholderTextColor="#6c757d"
      keyboardType="email-address"
      autoCapitalize="none"
      accessibilityLabel="Champ d'entrée de l'email"
      accessibilityHint="Entrez votre adresse email"
    />
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#dc3545",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: "#2d3436",
  },
});

export default React.memo(EmailInput);
