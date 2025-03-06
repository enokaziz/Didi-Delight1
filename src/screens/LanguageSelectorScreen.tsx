import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LanguageSelectorScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Sélectionner la langue (écran temporaire)</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LanguageSelectorScreen;