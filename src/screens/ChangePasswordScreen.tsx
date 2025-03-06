import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChangePasswordScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Modifier le mot de passe (écran temporaire)</Text>
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

export default ChangePasswordScreen;