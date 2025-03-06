// App.tsx
import React from "react";
import { AuthProvider } from "./src/contexts/AuthContext";
import { CartProvider } from "./src/contexts/CartContext";
import MainNavigator from "./src/navigation/MainNavigator";
import { Provider as PaperProvider } from 'react-native-paper'; // Import PaperProvider
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Import SafeAreaProvider

export default function App() {
    return (
        <PaperProvider> {/* Enveloppez avec PaperProvider */}
            <SafeAreaProvider> {/* Enveloppez avec SafeAreaProvider */}
                <AuthProvider>
                    <CartProvider>
                        <MainNavigator />
                    </CartProvider>
                </AuthProvider>
            </SafeAreaProvider>
        </PaperProvider>
    );
}