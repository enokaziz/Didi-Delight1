import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { List, Divider, Dialog, Portal, Button, Switch, Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types'; 

const SettingsScreen: React.FC = () => {
    const { logout } = useAuth();
    const [visible, setVisible] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error: any) {
            console.error("Erreur lors de la déconnexion :", error);
        } finally {
            hideDialog();
        }
    };

    return (
        <ScrollView style={styles.container}>
            <List.Section>
                <List.Subheader>Paramètres du compte</List.Subheader>
                <List.Item title="Modifier le profil" left={() => <List.Icon icon="account-edit" />} onPress={() => navigation.navigate('EditProfile')} />
                <List.Item title="Modifier le mot de passe" left={() => <List.Icon icon="lock-reset" />} onPress={() => navigation.navigate('ChangePasswordScreen')} />
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader>Paramètres de l'application</List.Subheader>
                <List.Item
                    title="Notifications"
                    left={() => <List.Icon icon="bell" />}
                    right={() => <Switch value={notificationsEnabled} onValueChange={() => setNotificationsEnabled(!notificationsEnabled)} />}
                />
                <List.Item title="Langue" left={() => <List.Icon icon="translate" />} onPress={() => navigation.navigate('LanguageSelector')} />
            </List.Section>

            <Divider />

            <List.Section>
                <List.Item title="Se déconnecter" left={() => <List.Icon icon="logout" />} onPress={showDialog} />
            </List.Section>

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Confirmer la déconnexion</Dialog.Title>
                    <Dialog.Content>
                        <Text>Êtes-vous sûr de vouloir vous déconnecter ?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Annuler</Button>
                        <Button onPress={handleLogout}>Confirmer</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 10 },
});

export default SettingsScreen;
