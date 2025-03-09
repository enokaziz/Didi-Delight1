"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
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
  Pressable,
  Dimensions,
  Linking,
} from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { sendMessage, subscribeToChat, type ChatMessage } from "../firebase/chatService"
import * as ImagePicker from "expo-image-picker"
import * as DocumentPicker from "expo-document-picker"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { storage } from "../firebase/firebaseConfig"
import { SafeAreaView } from "react-native-safe-area-context"
import FastImage from "react-native-fast-image"
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"
import * as FileSystem from "expo-file-system"
import * as MediaLibrary from "expo-media-library"
import { StatusBar } from "expo-status-bar"

// Configurations
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"]
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const SCREEN_WIDTH = Dimensions.get("window").width

// Types
interface FilePreview {
  uri: string
  type: string
  name: string
  size: number
}

// Fonction utilitaire pour formater la date
const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else {
    return (
      date.toLocaleDateString([], { day: "numeric", month: "short" }) +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    )
  }
}

// Fonction pour vérifier le type de fichier
const isImageUrl = (url: string): boolean => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
  return imageExtensions.some((ext) => url.toLowerCase().includes(ext))
}

const isPdfUrl = (url: string): boolean => {
  return url.toLowerCase().includes(".pdf")
}

const getFileNameFromUrl = (url: string): string => {
  try {
    const urlParts = url.split("/")
    let fileName = urlParts[urlParts.length - 1]
    // Supprimer les paramètres d'URL si présents
    if (fileName.includes("?")) {
      fileName = fileName.split("?")[0]
    }
    // Décoder les caractères URL-encoded
    return decodeURIComponent(fileName)
  } catch (error) {
    return "fichier"
  }
}

const ChatScreen: React.FC = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null)
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false)
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null)

  const flatListRef = useRef<FlatList>(null)
  const inputRef = useRef<TextInput>(null)
  const adminName = "Support"

  const chatId = user ? `${user.uid}-admin` : "unknown-admin"

  // Charger les messages
  useEffect(() => {
    if (!user) return

    setLoading(true)
    setError(null)

    const unsubscribe = subscribeToChat(
      chatId,
      (newMessages) => {
        const validatedMessages = newMessages.map((message) => ({
          ...message,
          timestamp: message.timestamp || Date.now(),
        }))
        setMessages(validatedMessages)
        setLoading(false)

        // Scroll vers le bas seulement si on est déjà proche du bas
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 100)
      },
      (error) => {
        console.error("Error loading messages:", error)
        setError("Impossible de charger les messages. Veuillez réessayer.")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [chatId, user])

  // Rafraîchir les messages
  const handleRefresh = useCallback(() => {
    if (!user) return

    setRefreshing(true)

    // Réinitialiser et recharger les messages
    const unsubscribe = subscribeToChat(
      chatId,
      (newMessages) => {
        const validatedMessages = newMessages.map((message) => ({
          ...message,
          timestamp: message.timestamp || Date.now(),
        }))
        setMessages(validatedMessages)
        setRefreshing(false)
      },
      (error) => {
        console.error("Error refreshing messages:", error)
        setError("Impossible de rafraîchir les messages.")
        setRefreshing(false)
      },
    )

    // Nettoyer l'abonnement après le rafraîchissement
    setTimeout(() => {
      unsubscribe()
    }, 1000)
  }, [chatId, user])

  // Envoyer un message texte
  const handleSend = useCallback(async () => {
    try {
      if ((!input.trim() && !filePreview) || !user) return

      if (filePreview) {
        setIsUploading(true)

        try {
          const response = await fetch(filePreview.uri)
          const blob = await response.blob()

          // Vérifier la taille du fichier
          if (blob.size > MAX_FILE_SIZE) {
            Alert.alert(
              "Fichier trop volumineux",
              `La taille maximale autorisée est de ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            )
            return
          }

          const fileRef = ref(storage, `chat/${chatId}/${Date.now()}_${filePreview.name}`)

          await uploadBytes(fileRef, blob, {
            contentType: filePreview.type,
          })

          const url = await getDownloadURL(fileRef)
          await sendMessage(chatId, user.uid, "admin", url, filePreview.type)

          // Ajouter un message texte si présent
          if (input.trim()) {
            await sendMessage(chatId, user.uid, "admin", input, "text")
          }
        } catch (error) {
          console.error("Upload error:", error)
          Alert.alert("Erreur", "Impossible d'envoyer le fichier. Veuillez réessayer.")
        } finally {
          setFilePreview(null)
          setIsUploading(false)
        }
      } else {
        // Envoyer uniquement le message texte
        await sendMessage(chatId, user.uid, "admin", input, "text")
      }

      setInput("")

      // Focus sur l'input après envoi
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error("Send message error:", error)
      Alert.alert("Erreur", "Échec de l'envoi du message. Veuillez vérifier votre connexion et réessayer.")
    }
  }, [chatId, input, user, filePreview])

  // Annuler le fichier en prévisualisation
  const cancelFilePreview = () => {
    setFilePreview(null)
  }

  // Ouvrir le menu d'attachement
  const toggleAttachmentMenu = () => {
    setAttachmentMenuVisible(!attachmentMenuVisible)
  }

  // Sélectionner une image
  const handleImagePicker = async () => {
    try {
      if (!user) {
        setError("Vous devez être connecté pour envoyer des fichiers")
        return
      }

      // Fermer le menu d'attachement
      setAttachmentMenuVisible(false)

      // Vérifier les permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission requise", "Veuillez autoriser l'accès à votre galerie pour partager des images")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]

        // Vérifier le type de fichier
        if (!asset.type || !ALLOWED_IMAGE_TYPES.includes(asset.type)) {
          Alert.alert("Type de fichier non supporté", "Veuillez sélectionner une image JPG, PNG ou GIF")
          return
        }

        setFilePreview({
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
        })
      }
    } catch (error) {
      console.error("Image picker error:", error)
      Alert.alert("Erreur", "Impossible de sélectionner l'image")
    }
  }

  // Sélectionner un document
  const handleDocumentPicker = async () => {
    try {
      if (!user) {
        setError("Vous devez être connecté pour envoyer des fichiers")
        return
      }

      // Fermer le menu d'attachement
      setAttachmentMenuVisible(false)

      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_DOC_TYPES,
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]

        // Vérifier la taille du fichier
        if (asset.size && asset.size > MAX_FILE_SIZE) {
          Alert.alert("Fichier trop volumineux", `La taille maximale autorisée est de ${MAX_FILE_SIZE / 1024 / 1024}MB`)
          return
        }

        setFilePreview({
          uri: asset.uri,
          type: asset.mimeType || "application/octet-stream",
          name: asset.name,
          size: asset.size || 0,
        })
      }
    } catch (error) {
      console.error("Document picker error:", error)
      Alert.alert("Erreur", "Impossible de sélectionner le document")
    }
  }

  // Télécharger un fichier
  const downloadFile = async (url: string) => {
    try {
      // Vérifier les permissions
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission requise", "Veuillez autoriser l'accès à votre galerie pour télécharger des fichiers")
        return
      }

      setDownloadingFile(url)

      const fileName = getFileNameFromUrl(url)
      const fileUri = `${FileSystem.documentDirectory}${fileName}`

      const downloadResumable = FileSystem.createDownloadResumable(url, fileUri, {}, (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite
        // Vous pourriez ajouter une barre de progression ici
      })

      const downloadResult = await downloadResumable.downloadAsync()

      if (downloadResult && downloadResult.uri) {
        const { uri } = downloadResult

        if (isImageUrl(url)) {
          const asset = await MediaLibrary.createAssetAsync(uri)
          await MediaLibrary.createAlbumAsync("Chat", asset, false)
          Alert.alert("Succès", "Image enregistrée dans votre galerie")
        } else {
          // Pour les autres types de fichiers
          await MediaLibrary.createAssetAsync(uri)
          Alert.alert("Succès", "Fichier téléchargé avec succès")
        }
      } else {
        Alert.alert("Erreur", "Échec du téléchargement du fichier")
      }
    } catch (error) {
      console.error("Download error:", error)
      Alert.alert("Erreur", "Impossible de télécharger le fichier")
    } finally {
      setDownloadingFile(null)
    }
  }

  // Ouvrir l'image en plein écran
  const openImageViewer = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setImageViewerVisible(true)
  }

  // Ouvrir un PDF
  const openPdf = (url: string) => {
    Linking.openURL(url).catch((err) => {
      Alert.alert("Erreur", "Impossible d'ouvrir ce fichier")
    })
  }

  // Rendu d'un message
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isCurrentUser = item.senderId === user?.uid
      const isFileMessage = item.message.startsWith("https://")
      const isImage = isFileMessage && isImageUrl(item.message)
      const isPdf = isFileMessage && isPdfUrl(item.message)
      const isOtherFile = isFileMessage && !isImage && !isPdf
      const fileName = isFileMessage ? getFileNameFromUrl(item.message) : ""
      const isDownloading = downloadingFile === item.message

      return (
        <View style={[styles.messageContainer, isCurrentUser ? styles.clientMessage : styles.adminMessage]}>
          {!isCurrentUser && (
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{adminName.charAt(0)}</Text>
              </View>
            </View>
          )}

          <View style={[styles.messageBubble, isCurrentUser ? styles.clientBubble : styles.adminBubble]}>
            {isImage ? (
              <Pressable onPress={() => openImageViewer(item.message)}>
                <FastImage
                  source={{ uri: item.message }}
                  style={styles.messageImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <View style={styles.messageActions}>
                  <TouchableOpacity
                    style={styles.messageAction}
                    onPress={() => downloadFile(item.message)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="download-outline" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </Pressable>
            ) : isPdf ? (
              <Pressable style={styles.fileContainer} onPress={() => openPdf(item.message)}>
                <MaterialIcons name="picture-as-pdf" size={24} color="#E44D26" />
                <Text style={styles.fileName} numberOfLines={1}>
                  {fileName}
                </Text>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => downloadFile(item.message)}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <Ionicons name="download-outline" size={18} color="#007AFF" />
                  )}
                </TouchableOpacity>
              </Pressable>
            ) : isOtherFile ? (
              <Pressable style={styles.fileContainer} onPress={() => Linking.openURL(item.message)}>
                <MaterialIcons name="insert-drive-file" size={24} color="#4285F4" />
                <Text style={styles.fileName} numberOfLines={1}>
                  {fileName}
                </Text>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => downloadFile(item.message)}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <Ionicons name="download-outline" size={18} color="#007AFF" />
                  )}
                </TouchableOpacity>
              </Pressable>
            ) : (
              <Text style={styles.messageText}>{item.message}</Text>
            )}

            <Text style={styles.messageTime}>{formatMessageTime(item.timestamp)}</Text>
          </View>
        </View>
      )
    },
    [user, downloadingFile],
  )

  // Rendu de l'en-tête
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>{adminName}</Text>
        <Text style={styles.headerSubtitle}>Service client</Text>
      </View>
    </View>
  )

  // Rendu de la prévisualisation de fichier
  const renderFilePreview = () => {
    if (!filePreview) return null

    const isImage = filePreview.type.startsWith("image/")
    const isPdf = filePreview.type === "application/pdf"

    return (
      <View style={styles.previewContainer}>
        {isImage ? (
          <Image source={{ uri: filePreview.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.previewFile}>
            <MaterialIcons
              name={isPdf ? "picture-as-pdf" : "insert-drive-file"}
              size={24}
              color={isPdf ? "#E44D26" : "#4285F4"}
            />
            <Text style={styles.previewFileName} numberOfLines={1}>
              {filePreview.name}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.previewCancel} onPress={cancelFilePreview}>
          <Ionicons name="close-circle" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    )
  }

  // Rendu du menu d'attachement
  const renderAttachmentMenu = () => {
    if (!attachmentMenuVisible) return null

    return (
      <View style={styles.attachmentMenu}>
        <TouchableOpacity style={styles.attachmentOption} onPress={handleImagePicker}>
          <View style={[styles.attachmentIcon, { backgroundColor: "#4CD964" }]}>
            <Ionicons name="image" size={24} color="#fff" />
          </View>
          <Text style={styles.attachmentText}>Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.attachmentOption} onPress={handleDocumentPicker}>
          <View style={[styles.attachmentIcon, { backgroundColor: "#FF9500" }]}>
            <Ionicons name="document-text" size={24} color="#fff" />
          </View>
          <Text style={styles.attachmentText}>Document</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Rendu de la visionneuse d'image
  const renderImageViewer = () => {
    if (!imageViewerVisible || !selectedImage) return null

    return (
      <Modal visible={imageViewerVisible} transparent={true} onRequestClose={() => setImageViewerVisible(false)}>
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity style={styles.imageViewerClose} onPress={() => setImageViewerVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <Image source={{ uri: selectedImage }} style={styles.imageViewerImage} resizeMode="contain" />

          <TouchableOpacity
            style={styles.imageViewerDownload}
            onPress={() => {
              downloadFile(selectedImage)
              setImageViewerVisible(false)
            }}
          >
            <Ionicons name="download" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des messages...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
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
    )
  }

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
          keyExtractor={(item) => item.timestamp.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          }}
          onLayout={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="chat-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucun message. Commencez la conversation !</Text>
            </View>
          }
        />

        {renderFilePreview()}
        {renderAttachmentMenu()}

        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={toggleAttachmentMenu}
            style={styles.attachButton}
            accessibilityLabel="Ajouter un fichier"
            accessibilityRole="button"
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

      {renderImageViewer()}
    </SafeAreaView>
  )
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 5,
  },
  headerInfo: {
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  messagesList: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 5,
    maxWidth: "85%",
  },
  clientMessage: {
    alignSelf: "flex-end",
    marginLeft: 50,
  },
  adminMessage: {
    alignSelf: "flex-start",
    marginRight: 50,
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: "flex-end",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 18,
    maxWidth: "100%",
  },
  clientBubble: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  messageTime: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 4,
  },
  messageActions: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
  },
  messageAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  fileName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  downloadButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  attachButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
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
  sendButtonDisabled: {
    backgroundColor: "#B8B8B8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  previewFile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    flex: 1,
  },
  previewFileName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  previewCancel: {
    padding: 8,
  },
  attachmentMenu: {
    position: "absolute",
    bottom: 70,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  attachmentOption: {
    alignItems: "center",
    width: 80,
  },
  attachmentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  attachmentText: {
    fontSize: 12,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  imageViewerClose: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  imageViewerDownload: {
    position: "absolute",
    bottom: 40,
    right: 20,
    zIndex: 10,
  },
})

export default ChatScreen