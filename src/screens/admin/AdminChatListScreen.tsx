import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from "react-native";
import { getAllChats, Chat } from "../../firebase/chatService";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { Button, Card, Title, Paragraph, Searchbar } from 'react-native-paper'; // Importez les composants de react-native-paper
import { format } from 'date-fns'; // Importez date-fns pour formater les dates

type AdminStackParamList = {
    AdminChats: undefined;
    AdminChat: { clientId: string };
};

type AdminChatListScreenNavigationProp = StackNavigationProp<AdminStackParamList, "AdminChats">;

const AdminChatListScreen = () => {
    const navigation = useNavigation<AdminChatListScreenNavigationProp>();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredChats, setFilteredChats] = useState<Chat[]>([]);

    const fetchChats = useCallback(async () => {
        setLoading(true);
        try {
            const chatList = await getAllChats();
            setChats(chatList);
            setFilteredChats(chatList); // Initialiser les chats filtrés
        } catch (error) {
            Alert.alert("Erreur", "Impossible de récupérer les chats.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filtered = chats.filter(chat =>
            chat.clientId.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredChats(filtered);
    };

    const formatTimestamp = (timestamp: number) => {
        return format(new Date(timestamp), "dd/MM/yyyy HH:mm");
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Chats Clients</Title>

            <Searchbar
                placeholder="Rechercher un client"
                onChangeText={handleSearch}
                value={searchQuery}
                style={styles.searchBar}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : filteredChats.length === 0 ? (
                <Text>Aucun chat disponible.</Text>
            ) : (
                <FlatList
                    data={filteredChats}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.chatItem}
                            onPress={() => navigation.navigate("AdminChat", { clientId: item.clientId })}
                        >
                            <Card>
                                <Card.Content>
                                    <Title>Client : {item.clientId}</Title>
                                    <Paragraph>Dernier message : {item.lastMessage}</Paragraph>
                                    <Paragraph>Heure : {formatTimestamp(item.lastMessageTimestamp)}</Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: "#f4f4f4" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
    chatItem: { marginBottom: 10 },
    searchBar: { marginBottom: 10 },
});

export default AdminChatListScreen;