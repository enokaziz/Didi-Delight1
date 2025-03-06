import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { sendMessage, subscribeToChat, ChatMessage } from "../firebase/chatService";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import { FirebaseError } from "@firebase/util";
import FastImage from "react-native-fast-image";


// Configurations
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const ChatScreen: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const adminName = "Support";

    const chatId = user ? `${user.uid}-admin` : "unknown-admin";

    useEffect(() => {
      if (!user) return;
      setLoading(true);
      setError(null);
      const unsubscribe = subscribeToChat(
        chatId,
        (newMessages) => {
          const validatedMessages = newMessages.map((message) => ({
            ...message,
            timestamp: message.timestamp || Date.now(), // Valeur par défaut si manquante
          }));
          setMessages(validatedMessages);
          setLoading(false);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        },
        (error) => {
          setError(error.message || "Erreur de chargement des messages.");
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }, [chatId, user]);
    const handleSend = useCallback(async () => {
      try {
        if (!input.trim() || !user) return;
  
        await sendMessage(chatId, user.uid, "admin", input);
        setInput("");
      } catch (error) {
        Alert.alert("Erreur", "Échec de l'envoi du message");
      }
    }, [chatId, input, user]);
  
    const handleImagePicker = async () => {
      try {
        if (!user) {
          setError("Vous devez être connecté pour envoyer des fichiers");
          return;
        }
  
      // Vérification des permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission requise", "Autorisez l'accès aux photos pour partager des images");
        return;
      }
  
      setIsUploading(true);
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], 
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const imageRef = ref(storage, `chat/${chatId}/${Date.now()}_${asset.fileName || "image"}`);
        await uploadBytes(imageRef, blob, {
          contentType: asset.type || "image/jpeg",
        });
        const url = await getDownloadURL(imageRef);
        await sendMessage(chatId, user.uid, "admin", url);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'envoyer l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentPicker = async () => {
    try {
      if (!user) return;
  
      setIsUploading(true);
      const res = await DocumentPicker.getDocumentAsync({});
      
      // Vérification corrigée
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0]; // Accès via le tableau assets
        
        const response = await fetch(asset.uri);
        const blob = await response.blob();
  
        // Nom de fichier unique
        const uniqueName = `${Date.now()}_${asset.name}`;
        const fileRef = ref(storage, `chat/${chatId}/${uniqueName}`);
  
        // Ajout du type MIME
        await uploadBytes(fileRef, blob, {
          contentType: asset.mimeType || "application/octet-stream",
        });
  
        const url = await getDownloadURL(fileRef);
        await sendMessage(chatId, user.uid, "admin", url);
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'envoyer le fichier");
    } finally {
      setIsUploading(false);
    }
  };
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <View
        style={[
          styles.messageContainer,
          item.senderId === user?.uid ? styles.clientMessage : styles.adminMessage,
        ]}
      >
        {item.message.startsWith("https://firebasestorage.googleapis.com") ? (
          <Image source={{ uri: item.message }} style={styles.messageImage} />
        ) : (
          <Text style={styles.messageText}>{item.message}</Text>
        )}
        <Text style={styles.messageTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      </View>
    ),
    [user]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={styles.container}
      >
        <Text style={styles.title}>Chat avec {adminName}</Text>
        <FlatList
  ref={flatListRef}
  data={messages}
  keyExtractor={(item) => item.timestamp.toString()} 
  renderItem={renderMessage}
  onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
  onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
/>
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={handleImagePicker}
            style={styles.attachButton}
            accessibilityLabel="Ajouter une image"
            accessibilityRole="button"
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.attachButtonText}>Image</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDocumentPicker}
            style={styles.attachButton}
            accessibilityLabel="Ajouter un fichier"
            accessibilityRole="button"
            disabled={isUploading}
          >
            <Text style={styles.attachButtonText}>Fichier</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Écrire un message..."
            editable={!isUploading}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={isUploading}>
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 10 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  messageContainer: { padding: 10, borderRadius: 8, marginVertical: 5, maxWidth: "80%" },
  clientMessage: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
  adminMessage: { backgroundColor: "#ECECEC", alignSelf: "flex-start" },
  messageText: { fontSize: 16 },
  messageTime: { fontSize: 12, color: "gray", marginTop: 5, alignSelf: "flex-end" },
  inputContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 10 },
  sendButton: { backgroundColor: "#007AFF", padding: 10, borderRadius: 8, marginLeft: 10, justifyContent: "center" },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red" },
  messageImage: { width: 200, height: 150, borderRadius: 8, marginTop: 5, resizeMode: "contain" },
  attachButton: { backgroundColor: "#f0f0f0", padding: 8, borderRadius: 5, marginRight: 5, justifyContent: "center" },
  attachButtonText: { fontSize: 12 },
});

export default ChatScreen;