import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, TextInput } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { getAllChats, Chat } from "../../firebase/chatService";
import { format } from "date-fns";
import { AdminStackParamList } from "../../navigation/types";

type AdminChatListScreenNavigationProp = StackNavigationProp<AdminStackParamList, "AdminChats">;

const AdminChatListScreen = () => {
  const navigation = useNavigation<AdminChatListScreenNavigationProp>();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const chatList = await getAllChats();
      setChats(chatList);
      setFilteredChats(chatList);
    } catch (error) {
      setError("Impossible de récupérer les chats.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats();
  }, [fetchChats]);

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    setFilteredChats(chats.filter((chat) => chat.clientId.toLowerCase().includes(text.toLowerCase())));
  }, [chats]);

  const formatTimestamp = (timestamp: number) => format(new Date(timestamp), "dd/MM/yyyy HH:mm");

  if (error) return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchChats}>
        <Text style={styles.retryButtonText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats Clients</Text>
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={handleSearch}
        placeholder="Rechercher par ID client..."
      />
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : filteredChats.length === 0 ? (
        <Text style={styles.noChatsText}>Aucun chat disponible.</Text>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
  searchInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
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