import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AttachmentMenuProps {
  visible: boolean;
  onImagePick: () => void;
  onDocPick: () => void;
  onClose: () => void;
}

const AttachmentMenu: React.FC<AttachmentMenuProps> = ({ visible, onImagePick, onDocPick, onClose }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.option} onPress={onImagePick}>
        <View style={[styles.icon, { backgroundColor: "#4CD964" }]}>
          <Ionicons name="image" size={24} color="#fff" />
        </View>
        <Text style={styles.text}>Image</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={onDocPick}>
        <View style={[styles.icon, { backgroundColor: "#FF9500" }]}>
          <Ionicons name="document-text" size={24} color="#fff" />
        </View>
        <Text style={styles.text}>Document</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 70,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  option: { alignItems: "center", width: 80 },
  icon: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  text: { fontSize: 12 },
  closeButton: { position: "absolute", top: 10, right: 10 },
});

export default AttachmentMenu;