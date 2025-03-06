import React from "react";
import { View, Text, StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";
import { ChatMessage } from "../../firebase/chatService";

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const isValidTimestamp = message.timestamp && !isNaN(message.timestamp);
  const formattedTime = isValidTimestamp
    ? new Date(message.timestamp).toLocaleTimeString()
    : "Heure inconnue";

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
      ]}
    >
      {message.message.startsWith("https://") ? (
        <FastImage
          source={{ uri: message.message }}
          style={styles.messageImage}
          resizeMode={FastImage.resizeMode.contain}
        />
      ) : (
        <Text style={styles.messageText}>{message.message}</Text>
      )}
      <Text style={styles.messageTime}>{formattedTime}</Text>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: "80%",
  },
  currentUserMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  otherUserMessage: {
    backgroundColor: "#ECECEC",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 5,
  },
});

export default MessageBubble;