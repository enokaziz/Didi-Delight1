import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const LanguageSelectorScreen = () => {
    const [language, setLanguage] = useState('fr');

    const changeLanguage = (lang: string) => {
        setLanguage(lang);
        // Logique pour changer la langue de l'application
    };

    return (
        <View style={styles.container}>
            <Text>Sélectionner la langue :</Text>
            <Button title="Français" onPress={() => changeLanguage('fr')} />
            <Button title="English" onPress={() => changeLanguage('en')} />
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
