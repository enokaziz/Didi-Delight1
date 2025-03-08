// src/screens/admin/AdminChatListScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { getAllChats, Chat } from "../../firebase/chatService";
import { format } from "date-fns";
import { AdminStackParamList } from "navigation/types";

type AdminChatListScreenNavigationProp = StackNavigationProp<AdminStackParamList, "AdminChats">;

const AdminChatListScreen = () => {
  const navigation = useNavigation<AdminChatListScreenNavigationProp>();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les chats
  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const chatList = await getAllChats();
      console.log("Chats récupérés:", chatList);
      setChats(chatList);
    } catch (error) {
      console.error("Erreur complète:", error);
      setError("Impossible de récupérer les chats. Veuillez réessayer.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Effet pour charger les chats au montage du composant
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Fonction pour rafraîchir manuellement
  const handleRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  // Formatage de la date
  const formatTimestamp = (timestamp: number) => {
    return format(new Date(timestamp), "dd/MM/yyyy HH:mm");
  };

  // Affichage des erreurs
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchChats}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats Clients</Text>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Chargement des chats...</Text>
        </View>
      ) : chats.length === 0 ? (
        <Text style={styles.noChatsText}>Aucun chat disponible.</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => navigation.navigate("AdminChat", { clientId: item.clientId })}
            >
              <View style={styles.chatContent}>
                <Text style={styles.clientId}>Client : {item.clientId}</Text>
                <Text style={styles.lastMessage}>Dernier message : {item.lastMessage}</Text>
                <Text style={styles.timestamp}>Heure : {formatTimestamp(item.lastMessageTimestamp)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f4f4f4" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#007bff" },
  noChatsText: { textAlign: "center", marginTop: 20, color: "#666" },
  chatItem: { marginBottom: 10, backgroundColor: "#fff", borderRadius: 8, padding: 15 },
  chatContent: { flex: 1 },
  clientId: { fontSize: 16, fontWeight: "bold", color: "#333" },
  lastMessage: { fontSize: 14, color: "#666", marginTop: 5 },
  timestamp: { fontSize: 12, color: "#999", marginTop: 5 },
  errorText: { color: "red", textAlign: "center", marginTop: 20 },
  retryButton: { marginTop: 10, backgroundColor: "#007AFF", padding: 10, borderRadius: 8, alignSelf: "center" },
  retryButtonText: { color: "#fff", fontWeight: "bold" },
});

export default AdminChatListScreen;