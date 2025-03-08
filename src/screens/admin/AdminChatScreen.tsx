import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { sendMessage, subscribeToChat, ChatMessage } from "../../firebase/chatService";
import ChatCore from "../../components/chat/ChatCore";
import { AdminStackParamList } from "navigation/types";


type AdminChatScreenRouteProp = RouteProp<AdminStackParamList, "AdminChat">;

const AdminChatScreen: React.FC = () => {
  const route = useRoute<AdminChatScreenRouteProp>();
  const { clientId } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Le chatId est constitué du clientId et de "admin"
  const chatId = `${clientId}-admin`;

  // Abonnement aux messages avec validation
  useEffect(() => {
    const unsubscribe = subscribeToChat(
      chatId,
      (newMessages) => {
        const validatedMessages = newMessages.map((message) => ({
          ...message,
          timestamp: message.timestamp || Date.now(), // Valeur par défaut si manquante
        }));
        setMessages(validatedMessages);
      },
      (error) => Alert.alert("Erreur", error.message)
    );
    return () => unsubscribe();
  }, [chatId]);

  // Envoi de message
  const handleSend = async () => {
    if (!input.trim()) return;
    setIsUploading(true);
    try {
      await sendMessage(chatId, "admin", clientId, input);
      setInput("");
    } catch (error) {
      Alert.alert("Erreur", "Échec de l'envoi du message");
      } finally {
      setIsUploading(false);
    }
  };

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

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});

export default AdminChatScreen;