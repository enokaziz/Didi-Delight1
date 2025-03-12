import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ChatMessage } from '../../firebase/chatService'; // Assurez-vous d'importer le bon chemin
import MessageBubble from './MessageBubble'; // Utilisez le composant MessageBubble que nous avons créé

interface ChatComponentProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ messages, onSendMessage, currentUserId }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id || item.timestamp.toString()}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.senderId === currentUserId}
          />
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

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatComponent;