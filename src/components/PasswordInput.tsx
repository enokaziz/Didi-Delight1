import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PasswordInputProps } from "../types/PasswordInputProps";

const PasswordInput = ({
  value,
  onChange,
  showPassword,
  toggleShowPassword,
  error,
}: PasswordInputProps) => (
  <View style={styles.inputContainer}>
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
    />
    <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
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
  inputIcon: { marginRight: 10 },
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

export default PasswordInput;