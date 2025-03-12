import { useState } from "react";
import { ChatMessage } from "../firebase/chatService";

const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = (message: string, senderId: string, receiverId: string) => {
    const newMessage: ChatMessage = {
      senderId,
      receiverId,
      message,
      timestamp: Date.now(),
      type: "text",
      status: "pending",
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const deleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  return { messages, sendMessage, deleteMessage };
};

export default useChat;