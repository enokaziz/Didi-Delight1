import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface FilePreviewProps {
  file: { uri: string; type: string; name: string; size: number } | null;
  onCancel: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onCancel }) => {
  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  return (
    <View style={styles.container}>
      {isImage ? (
        <Image source={{ uri: file.uri }} style={styles.image} />
      ) : (
        <View style={styles.file}>
          <MaterialIcons name={isPdf ? "picture-as-pdf" : "insert-drive-file"} size={24} color={isPdf ? "#E44D26" : "#4285F4"} />
          <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Ionicons name="close-circle" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", padding: 8, borderTopWidth: 1, borderTopColor: "#e0e0e0" },
  image: { width: 60, height: 60, borderRadius: 8 },
  file: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 8, padding: 8, flex: 1 },
  fileName: { flex: 1, marginLeft: 8, fontSize: 14 },
  cancelButton: { padding: 8 },
});

export default FilePreview;