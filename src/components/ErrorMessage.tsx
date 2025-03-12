import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ErrorMessageProps } from "../types/ErrorMessageProps";

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [message, fadeAnim]);

  return message ? (
    <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={16} color="#dc3545" />
      <Text style={styles.errorText}>{message}</Text>
    </Animated.View>
  ) : null;
};

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginLeft: 5,
  },
});

export default ErrorMessage;