import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PasswordInputProps } from "../types/PasswordInputProps";

// Typage strict pour les icônes Ionicons utilisées
type IoniconsName = "lock-closed-outline" | "eye" | "eye-off";

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  showPassword,
  toggleShowPassword,
  error,
}) => (
  <View style={[styles.inputContainer, error ? styles.inputError : null]}>
    <Ionicons
      name="lock-closed-outline"
      size={20}
      color="#6c757d"
      style={styles.inputIcon}
    />
    <TextInput
      placeholder="Mot de passe"
      value={value}
      onChangeText={onChange}
      secureTextEntry={!showPassword}
      style={styles.input}
      placeholderTextColor="#6c757d"
      accessibilityLabel="Champ de mot de passe"
      accessibilityHint="Entrez votre mot de passe"
    />
    <TouchableOpacity
      onPress={toggleShowPassword}
      style={styles.eyeIcon}
      accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      accessibilityRole="button"
    >
      <Ionicons
        name={showPassword ? "eye-off" : "eye"}
        size={20}
        color={showPassword ? "#4f46e5" : "#6c757d"}
      />
    </TouchableOpacity>
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
    borderColor: "#dc3545", // Rouge pour indiquer une erreur
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: "#2d3436",
  },
  eyeIcon: {
    padding: 8,
  },
});

export default React.memo(PasswordInput);