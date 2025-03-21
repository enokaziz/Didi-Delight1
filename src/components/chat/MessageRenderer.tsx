import React, { useCallback } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Pressable, 
  Linking,
  Image // Ajout de Image
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ChatMessage } from "../../firebase/chatService";
import { commonStyles } from "../../styles/commonStyles";


interface MessageRendererProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  onDownload?: (url: string) => void;
  onDelete?: (messageId: string) => void;
  downloadingFile?: string | null;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ message, isCurrentUser, onDownload, onDelete, downloadingFile }) => {
  const isValidTimestamp = message.timestamp && !isNaN(message.timestamp);
  const formattedTime = isValidTimestamp ? new Date(message.timestamp).toLocaleTimeString() : "Heure inconnue";
  const isFileMessage = message.message.startsWith("https://");
  const isImage = isFileMessage && /\.(jpg|jpeg|png|gif|webp)$/i.test(message.message);
  const isPdf = isFileMessage && /\.pdf$/i.test(message.message);
  const isOtherFile = isFileMessage && !isImage && !isPdf;
  const fileName = isFileMessage ? message.message.split("/").pop()?.split("?")[0] || "fichier" : "";
  const isDownloading = downloadingFile === message.message;

  const handleOpenLink = useCallback(() => Linking.openURL(message.message), [message.message]);

  return (
    <View style={[commonStyles.messageContainer, isCurrentUser ? commonStyles.clientMessage : commonStyles.adminMessage]}>
      {isImage ? (
        <Pressable onPress={() => {}}>
          <Image 
            source={{ uri: message.message }} 
            style={styles.messageImage} 
            resizeMode="cover"
            defaultSource={require('../../assets/images/empty-search.png')}
          />
          {onDownload && (
            <TouchableOpacity 
              style={styles.downloadButton} 
              onPress={() => onDownload(message.message)} 
              disabled={isDownloading}
            >
              <Ionicons 
                name={isDownloading ? "hourglass-outline" : "download-outline"} 
                size={18} 
                color="#fff" 
              />
            </TouchableOpacity>
          )}
        </Pressable>
      ) : (
        <Text style={styles.messageText}>{message.message}</Text>
      )}
      <View style={styles.footer}>
        <Text style={styles.messageTime}>
          {formattedTime} {message.status === "pending" && "⏳"} {message.status === "sent" && "✓"} {message.status === "read" && "✓✓"}
        </Text>
        {onDelete && message.id && (
          <TouchableOpacity onPress={() => onDelete(message.id!)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageImage: { 
    width: 200, 
    height: 150, 
    borderRadius: 12,
     marginBottom: 4,
     backgroundColor: "#f0f0f0"
    },
  downloadButton: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 16, padding: 8 },
  fileContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", borderRadius: 8, padding: 8, marginBottom: 4 },
  fileName: { flex: 1, marginLeft: 8, fontSize: 14 },
  messageText: { fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  messageTime: { fontSize: 11, color: "#666", marginTop: 4 },
  deleteButton: { padding: 4 },
});

export default MessageRenderer;