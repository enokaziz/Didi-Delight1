import React, { useCallback, useRef } from "react";
import { FlatList, TextInput, TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { ChatMessage } from "../../firebase/chatService";
import MessageRenderer from "../chat/MessageRenderer";
import { commonStyles } from "../../styles/commonStyles";

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

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageRenderer message={item} isCurrentUser={item.senderId === currentUserId} />
    ),
    [currentUserId]
  );

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id || item.timestamp.toString()}
        renderItem={renderItem}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        {!isAdmin && (
          <>
            <TouchableOpacity onPress={handleImagePicker} style={styles.attachButton} disabled={isUploading}>
              <Text style={styles.attachButtonText}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDocumentPicker} style={styles.attachButton} disabled={isUploading}>
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
        <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={isUploading}>
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: { flexDirection: "row", borderTopWidth: 1, borderColor: "#ccc", padding: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 10, marginRight: 10 },
  sendButton: { backgroundColor: "#007AFF", padding: 10, borderRadius: 8, justifyContent: "center" },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
  attachButton: { backgroundColor: "#f0f0f0", padding: 8, borderRadius: 5, marginRight: 5 },
  attachButtonText: { fontSize: 12 },
});

export default ChatCore;