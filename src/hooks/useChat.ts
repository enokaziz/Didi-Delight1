import { useState } from 'react';
import { ChatMessage } from '../firebase/chatService';

const useChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const sendMessage = (message: string, senderId: string, receiverId: string) => {
        const newMessage: ChatMessage = {
            senderId,
            receiverId,
            message,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, newMessage]);
    };

    return { messages, sendMessage };
};

export default useChat;