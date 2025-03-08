import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthButtonProps } from "../types/AuthButtonProps";

const AuthButton = ({ onPress, isLoading, isLogin }: AuthButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={isLoading}
    style={[styles.button, isLoading ? styles.buttonPressed : null]}
  >
    <LinearGradient
      colors={["#6366f1", "#4f46e5"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>
          {isLogin ? "Se connecter" : "Créer un compte"}
        </Text>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default AuthButton;