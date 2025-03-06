import React, { useCallback, useRef } from "react";
import {
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  Text, // Assurez-vous d'importer Text
} from "react-native";
import { ChatMessage } from "../../firebase/chatService"; // Assurez-vous du bon chemin
import FastImage from "react-native-fast-image";

interface ChatCoreProps {
  messages: ChatMessage[];
  input: string;
  setInput: (text: string) => void;
  handleSend: () => void;
  isAdmin?: boolean;
  currentUserId: string;
  isUploading?: boolean;
  handleImagePicker?: () => void;
  handleDocumentPicker?: () => void;
}

const ChatCore: React.FC<ChatCoreProps> = ({
  messages,
  input,
  setInput,
  handleSend,
  isAdmin = false,
  currentUserId,
  isUploading,
  handleImagePicker,
  handleDocumentPicker,
}) => {
  const flatListRef = useRef<FlatList>(null);

  const renderMessage = useCallback(
  ({ item }: { item: ChatMessage }) => {
    const isValidTimestamp = item.timestamp && !isNaN(item.timestamp);
    const formattedTime = isValidTimestamp
      ? new Date(item.timestamp).toLocaleTimeString()
      : "Heure inconnue";

    return (
      <View
        style={[
          styles.messageContainer,
          item.senderId === currentUserId ? styles.clientMessage : styles.adminMessage,
        ]}
      >
        {item.message.startsWith("https://") ? (
          <FastImage
            source={{ uri: item.message }}
            style={styles.messageImage}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : (
          <Text style={styles.messageText}>{item.message}</Text>
        )}
        <Text style={styles.messageTime}>{formattedTime}</Text>
      </View>
    );
  },
  [currentUserId]
);
  return (
    <>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id || item.timestamp.toString()}
        renderItem={renderMessage}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        {!isAdmin && (
          <>
            <TouchableOpacity
              onPress={handleImagePicker}
              style={styles.attachButton}
              disabled={isUploading}
            >
              <Text style={styles.attachButtonText}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDocumentPicker}
              style={styles.attachButton}
              disabled={isUploading}
            >
              <Text style={styles.attachButtonText}>📁</Text>
            </TouchableOpacity>
          </>
        )}

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Écrire un message..."
          editable={!isUploading}
        />

        <TouchableOpacity
          onPress={handleSend}
          style={styles.sendButton}
          disabled={isUploading}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: "80%",
  },
  clientMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  adminMessage: {
    backgroundColor: "#ECECEC",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  attachButton: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
    justifyContent: "center",
  },
  attachButtonText: {
    fontSize: 12,
  },
});

export default ChatCore;