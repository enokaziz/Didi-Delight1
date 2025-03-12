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
  Platform,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
  Linking,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { sendMessage, subscribeToChat, deleteMessage, fetchPreviousMessages, ChatMessage } from "../firebase/chatService";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import FastImage from "react-native-fast-image";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Notifications from "expo-notifications";
import AttachmentMenu from "../components/chat/AttachmentMenu";
import FilePreview from "../components/chat/FilePreview";
import MessageRenderer from "../components/chat/MessageRenderer";
import { commonStyles } from "../styles/commonStyles";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

// Configurations
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const SCREEN_WIDTH = Dimensions.get("window").width;

interface FilePreviewData {
  uri: string;
  type: string;
  name: string;
  size: number;
}

const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filePreview, setFilePreview] = useState<FilePreviewData | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const adminName = "Support";
  const chatId = user ? `${user.uid}-admin` : "unknown-admin";

  // Gestion de la connexion utilisateur
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) setError("Utilisateur déconnecté. Veuillez vous reconnecter.");
    });
    return () => unsubscribeAuth();
  }, []);

  // Abonnement aux messages et notifications
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToChat(
      chatId,
      (newMessages) => {
        const validatedMessages = newMessages.map((message) => ({
          ...message,
          timestamp: message.timestamp || Date.now(),
          status: message.status || "sent",
        }));
        setMessages(validatedMessages);
        setLoading(false);
        if (newMessages[newMessages.length - 1]?.senderId !== user.uid) {
          Notifications.scheduleNotificationAsync({
            content: { title: "Nouveau message", body: newMessages[newMessages.length - 1].message },
            trigger: null,
          });
        }
        if (!lastVisible) flatListRef.current?.scrollToEnd({ animated: true });
      },
      (err) => {
        console.error("Error loading messages:", err);
        setError("Impossible de charger les messages.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId, user, lastVisible]);

  // Chargement des messages précédents (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !lastVisible || !user) return;
    setLoadingMore(true);
    try {
      const previousMessages = await fetchPreviousMessages(chatId, lastVisible);
      setMessages((prev) => [...previousMessages.reverse(), ...prev]);
      setLastVisible(previousMessages[previousMessages.length - 1]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger plus de messages.");
    } finally {
      setLoadingMore(false);
    }
  }, [chatId, lastVisible, user, loadingMore]);

  // Rafraîchissement manuel
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setLastVisible(null); // Réinitialise pour recharger tout
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Validation des fichiers
  const validateFile = useCallback((file: FilePreviewData) => {
    if (file.size > MAX_FILE_SIZE) throw new Error(`Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
    if (![...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(file.type)) throw new Error("Type de fichier non supporté");
    return true;
  }, []);

  // Envoi de message ou fichier
  const handleSend = useCallback(async () => {
    if ((!input.trim() && !filePreview) || !user) return;

    setIsUploading(true);
    try {
      if (filePreview) {
        validateFile(filePreview);
        const response = await fetch(filePreview.uri);
        const blob = await response.blob();
        const fileRef = ref(storage, `chat/${chatId}/${Date.now()}_${filePreview.name}`);
        await uploadBytes(fileRef, blob, { contentType: filePreview.type });
        const url = await getDownloadURL(fileRef);
        await sendMessage(chatId, user.uid, "admin", url, filePreview.type);
      }
      if (input.trim()) {
        await sendMessage(chatId, user.uid, "admin", input, "text");
      }
      setInput("");
      setFilePreview(null);
      inputRef.current?.focus();
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message || "Échec de l'envoi.");
    } finally {
      setIsUploading(false);
    }
  }, [chatId, input, user, filePreview, validateFile]);

  // Sélection d'image
  const handleImagePicker = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Autorisez l'accès à la galerie.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setFilePreview({
        uri: asset.uri,
        type: asset.type || "image/jpeg",
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
      });
    }
    setAttachmentMenuVisible(false);
  }, []);

  // Sélection de document
  const handleDocumentPicker = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ALLOWED_DOC_TYPES });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setFilePreview({
        uri: asset.uri,
        type: asset.mimeType || "application/pdf",
        name: asset.name,
        size: asset.size || 0,
      });
    }
    setAttachmentMenuVisible(false);
  }, []);

  // Téléchargement de fichier
  const downloadFile = useCallback(async (url: string) => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Autorisez l'accès au stockage.");
      return;
    }
    setDownloadingFile(url);
    try {
      const fileName = url.split("/").pop()?.split("?")[0] || "file";
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      await MediaLibrary.createAssetAsync(uri);
      Alert.alert("Succès", "Fichier téléchargé dans votre galerie.");
    } catch (error) {
      Alert.alert("Erreur", "Échec du téléchargement.");
    } finally {
      setDownloadingFile(null);
    }
  }, []);

  // Suppression de message
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(chatId, messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      Alert.alert("Erreur", "Impossible de supprimer le message.");
    }
  }, [chatId]);

  // Rendu de l'en-tête
  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>{adminName}</Text>
        <Text style={styles.headerSubtitle}>Service client</Text>
      </View>
    </View>
  ), [adminName]);

  // États de chargement ou erreur
  if (loading) return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {renderHeader()}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des messages...</Text>
      </View>
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {renderHeader()}
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={styles.container}
      >
        {renderHeader()}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id || item.timestamp.toString()}
          renderItem={({ item }) => (
            <MessageRenderer
              message={item}
              isCurrentUser={item.senderId === user?.uid}
              onDownload={downloadFile}
              onDelete={handleDeleteMessage}
              downloadingFile={downloadingFile}
            />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => !lastVisible && flatListRef.current?.scrollToEnd({ animated: false })}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.1}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#007AFF" /> : null}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun message. Commencez la conversation !</Text>
            </View>
          }
        />
        <FilePreview file={filePreview} onCancel={() => setFilePreview(null)} />
        <AttachmentMenu
          visible={attachmentMenuVisible}
          onImagePick={handleImagePicker}
          onDocPick={handleDocumentPicker}
          onClose={() => setAttachmentMenuVisible(false)}
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={() => setAttachmentMenuVisible(true)}
            style={styles.attachButton}
            disabled={isUploading}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Écrire un message..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
            editable={!isUploading}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, !input.trim() && !filePreview && styles.sendButtonDisabled]}
            disabled={(!input.trim() && !filePreview) || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Modal visible={imageViewerVisible} transparent onRequestClose={() => setImageViewerVisible(false)}>
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity style={styles.imageViewerClose} onPress={() => setImageViewerVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <FastImage
            source={{ uri: selectedImage || "", cache: FastImage.cacheControl.web }}
            style={styles.imageViewerImage}
            resizeMode="contain"
            onError={() => setImageViewerVisible(false)}
          />
          <TouchableOpacity
            style={styles.imageViewerDownload}
            onPress={() => {
              if (selectedImage) downloadFile(selectedImage);
              setImageViewerVisible(false);
            }}
          >
            <Ionicons name="download" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: { padding: 5 },
  headerInfo: { marginLeft: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { fontSize: 14, color: "#666" },
  messagesList: { padding: 10, paddingBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  attachButton: { padding: 8, justifyContent: "center", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    backgroundColor: "#f9f9f9",
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { backgroundColor: "#B8B8B8" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { marginTop: 10, fontSize: 16, color: "#FF3B30", textAlign: "center" },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: { color: "#fff", fontWeight: "bold" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center" },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  imageViewerClose: { position: "absolute", top: 40, right: 20, zIndex: 10 },
  imageViewerDownload: { position: "absolute", bottom: 40, right: 20, zIndex: 10 },
});

export default ChatScreen;