// App.tsx
import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from "./src/contexts/AuthContext";
import { CartProvider } from "./src/contexts/CartContext";
import MainNavigator from "./src/navigation/MainNavigator";
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fr, registerTranslation } from 'react-native-paper-dates';
import { theme } from './src/theme';

registerTranslation('fr', fr);

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <SafeAreaProvider>
                <NavigationContainer>
                    <AuthProvider>
                        <CartProvider>
                            <MainNavigator />
                        </CartProvider>
                    </AuthProvider>
                </NavigationContainer>
            </SafeAreaProvider>
        </PaperProvider>
    );
}