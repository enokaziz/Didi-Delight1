import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { sendMessage, subscribeToChat, deleteMessage, ChatMessage } from "../../firebase/chatService";
import ChatCore from "../../components/chat/ChatCore";
import { AdminStackParamList } from "navigation/types";

type AdminChatScreenRouteProp = RouteProp<AdminStackParamList, "AdminChat">;

const AdminChatScreen: React.FC = () => {
  const route = useRoute<AdminChatScreenRouteProp>();
  const { clientId } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const chatId = `${clientId}-admin`;

  useEffect(() => {
    const unsubscribe = subscribeToChat(
      chatId,
      (newMessages) => {
        const validatedMessages = newMessages.map((message) => ({
          ...message,
          timestamp: message.timestamp || Date.now(),
          status: message.status || "sent",
        }));
        setMessages(validatedMessages);
      },
      (error) => Alert.alert("Erreur", error.message)
    );
    return () => unsubscribe();
  }, [chatId]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    setIsUploading(true);
    try {
      await sendMessage(chatId, "admin", clientId, input, "text");
      setInput("");
    } catch (error) {
      Alert.alert("Erreur", "Échec de l'envoi du message");
    } finally {
      setIsUploading(false);
    }
  }, [chatId, input]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(chatId, messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      Alert.alert("Erreur", "Impossible de supprimer le message.");
    }
  }, [chatId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat avec le client {clientId}</Text>
      <ChatCore
        messages={messages}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isAdmin
        currentUserId="admin"
        isUploading={isUploading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});

export default AdminChatScreen;