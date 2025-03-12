import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { ChatMessage } from "../firebase/chatService";
import MessageRenderer from "./chat/MessageBubble";
import { commonStyles } from "../styles/commonStyles";

interface ChatComponentProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ messages, onSendMessage, currentUserId }) => {
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  }, [input, onSendMessage]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id || item.timestamp.toString()}
        renderItem={({ item }) => (
          <MessageRenderer message={item} isCurrentUser={item.senderId === currentUserId} />
        )}
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Écrire un message..."
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  messagesContainer: { padding: 10 },
  inputContainer: { flexDirection: "row", borderTopWidth: 1, borderColor: "#ccc", padding: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 10, marginRight: 10 },
  sendButton: { backgroundColor: "#007AFF", padding: 10, borderRadius: 8, justifyContent: "center" },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
});

export default ChatComponent;