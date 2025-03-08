import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ErrorMessageProps } from "../types/ErrorMessageProps";

const ErrorMessage = ({ message }: ErrorMessageProps) =>
  message ? (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={16} color="#dc3545" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  ) : null;

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