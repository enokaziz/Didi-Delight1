import type React from "react"
import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking, Platform, Alert } from "react-native"
import { useAuth } from "../contexts/AuthContext"
import {
  List,
  Divider,
  Dialog,
  Portal,
  Button,
  Switch,
  Text,
  Avatar,
  Card,
  Snackbar,
  useTheme,
} from "react-native-paper"
import { useNavigation, type NavigationProp } from "@react-navigation/native"
import type { RootStackParamList } from "../navigation/types"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import Constants from "expo-constants"
import * as LocalAuthentication from 'expo-local-authentication';

const APP_VERSION = (Constants.manifest as any)?.version || "1.0.0"

const SettingsScreen: React.FC = () => {
  const { logout, user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const theme = useTheme()

  // Charger les préférences utilisateur au démarrage
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem("notificationsEnabled")
        const storedDarkMode = await AsyncStorage.getItem("darkModeEnabled")
        const storedBiometric = await AsyncStorage.getItem("biometricEnabled")

        if (storedNotifications !== null) {
          setNotificationsEnabled(storedNotifications === "true")
        }

        if (storedDarkMode !== null) {
          setDarkModeEnabled(storedDarkMode === "true")
        }

        if (storedBiometric !== null) {
          setBiometricEnabled(storedBiometric === "true")
        }
      } catch (error) {
        console.error("Erreur lors du chargement des préférences :", error)
      }
    }

    loadUserPreferences()
    checkNotificationPermissions()
  }, [])

  // Vérifier les permissions de notification
  const checkNotificationPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } = await Notifications.getPermissionsAsync()
      setNotificationsEnabled(status === "granted")
    }
  }

  // Gérer le changement de notification
  const handleNotificationToggle = async () => {
    try {
      if (!notificationsEnabled) {
        // Demander la permission si elle n'est pas déjà accordée
        if (Platform.OS !== "web") {
          const { status } = await Notifications.requestPermissionsAsync()
          if (status !== "granted") {
            showSnackbar("Vous devez autoriser les notifications dans les paramètres de votre appareil")
            return
          }
        }
      }

      const newValue = !notificationsEnabled
      setNotificationsEnabled(newValue)
      await AsyncStorage.setItem("notificationsEnabled", newValue.toString())
      showSnackbar(newValue ? "Notifications activées" : "Notifications désactivées")
    } catch (error) {
      console.error("Erreur lors de la modification des notifications :", error)
      showSnackbar("Erreur lors de la modification des notifications")
    }
  }

  // Gérer le changement de thème
  const handleDarkModeToggle = async () => {
    try {
      const newValue = !darkModeEnabled
      setDarkModeEnabled(newValue)
      await AsyncStorage.setItem("darkModeEnabled", newValue.toString())
      showSnackbar(newValue ? "Mode sombre activé" : "Mode clair activé")
      // Ici, vous pourriez appeler une fonction pour changer le thème global
    } catch (error) {
      console.error("Erreur lors de la modification du thème :", error)
      showSnackbar("Erreur lors de la modification du thème")
    }
  }

  // Gérer le changement d'authentification biométrique
  const handleBiometricToggle = async () => {
    try {
      const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
      if (!isBiometricAvailable) {
        showSnackbar("L'authentification biométrique n'est pas disponible sur cet appareil.");
        return;
      }

      const newValue = !biometricEnabled;
      if (newValue) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authentifiez-vous pour activer la biométrie',
        });
        if (!result.success) {
          showSnackbar("Échec de l'authentification biométrique.");
          return;
        }
      }

      setBiometricEnabled(newValue);
      await AsyncStorage.setItem("biometricEnabled", newValue.toString());
      showSnackbar(newValue ? "Authentification biométrique activée" : "Authentification biométrique désactivée");
    } catch (error) {
      console.error("Erreur lors de la modification de l'authentification biométrique :", error);
      showSnackbar("Erreur lors de la modification des paramètres biométriques");
    }
  }

  const showDialog = () => setVisible(true)
  const hideDialog = () => setVisible(false)

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message)
    setSnackbarVisible(true)
  }

  const handleLogout = async () => {
    try {
      await logout()
      showSnackbar("Déconnexion réussie")
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion :", error)
      showSnackbar("Erreur lors de la déconnexion")
    } finally {
      hideDialog()
    }
  }

  const handleClearCache = () => {
    Alert.alert(
      "Vider le cache",
      "Êtes-vous sûr de vouloir vider le cache de l'application ? Cela peut résoudre certains problèmes de performance.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Confirmer",
          onPress: async () => {
            // Simuler le nettoyage du cache
            setTimeout(() => {
              showSnackbar("Cache vidé avec succès")
            }, 1000)
          },
        },
      ],
    )
  }

  const openPrivacyPolicy = () => {
    Linking.openURL("https://votre-site.com/politique-de-confidentialite")
  }

  const openTermsOfService = () => {
    Linking.openURL("https://votre-site.com/conditions-utilisation")
  }

  const contactSupport = () => {
    Linking.openURL("mailto:support@votre-site.com?subject=Demande%20d%27assistance")
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Profil utilisateur */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Image
              size={80}
              source={user?.photoURL ? { uri: user.photoURL } : require("../assets/icons/splash-icon.png")}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName || "Utilisateur"}</Text>
              <Text style={styles.profileEmail}>{user?.email || "Aucun email"}</Text>
              <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate("EditProfile")}>
                <Text style={styles.editProfileText}>Modifier le profil</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Paramètres du compte */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Paramètres du compte</List.Subheader>
          <List.Item
            title="Modifier le profil"
            description="Changer votre nom, photo et informations personnelles"
            left={() => <List.Icon icon="account-edit" color={theme.colors.primary} />}
            onPress={() => navigation.navigate("EditProfile")}
            right={() => <List.Icon icon="chevron-right" />}
          />
          <List.Item
            title="Modifier le mot de passe"
            description="Mettre à jour votre mot de passe pour plus de sécurité"
            left={() => <List.Icon icon="lock-reset" color={theme.colors.primary} />}
            onPress={() => navigation.navigate("ChangePasswordScreen")}
            right={() => <List.Icon icon="chevron-right" />}
          />
          <List.Item
            title="Adresses de livraison"
            description="Gérer vos adresses de livraison"
            left={() => <List.Icon icon="map-marker" color={theme.colors.primary} />}
            onPress={() => navigation.navigate("AddressesScreen")}
            right={() => <List.Icon icon="chevron-right" />}
          />
        </List.Section>

        <Divider />

        {/* Paramètres de l'application */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Paramètres de l'application</List.Subheader>
          <List.Item
            title="Notifications"
            description="Recevoir des alertes sur les promotions et commandes"
            left={() => <List.Icon icon="bell" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                color={theme.colors.primary}
              />
            )}
          />
          <List.Item
            title="Mode sombre"
            description="Changer l'apparence de l'application"
            left={() => (
              <List.Icon
                icon={darkModeEnabled ? "weather-night" : "white-balance-sunny"}
                color={theme.colors.primary}
              />
            )}
            right={() => (
              <Switch value={darkModeEnabled} onValueChange={handleDarkModeToggle} color={theme.colors.primary} />
            )}
          />
          <List.Item
            title="Langue"
            description="Changer la langue de l'application"
            left={() => <List.Icon icon="translate" color={theme.colors.primary} />}
            onPress={() => navigation.navigate("LanguageSelector")}
            right={() => (
              <View style={styles.languageIndicator}>
                <Text>FR</Text>
                <List.Icon icon="chevron-right" />
              </View>
            )}
          />
          <List.Item
            title="Authentification biométrique"
            description="Se connecter avec empreinte digitale ou Face ID"
            left={() => <List.Icon icon="fingerprint" color={theme.colors.primary} />}
            right={() => (
              <Switch value={biometricEnabled} onValueChange={handleBiometricToggle} color={theme.colors.primary} />
            )}
          />
        </List.Section>

        <Divider />

        {/* Commandes et paiements */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Commandes et paiements</List.Subheader>
          <List.Item
            title="Historique des commandes"
            description="Voir toutes vos commandes passées"
            left={() => <List.Icon icon="history" color={theme.colors.primary} />}
            onPress={() => navigation.navigate("OrderHistory")}
            right={() => <List.Icon icon="chevron-right" />}
          />
          <List.Item
            title="Méthodes de paiement"
            description="Gérer vos cartes et options de paiement"
            left={() => <List.Icon icon="credit-card" color={theme.colors.primary} />}
            onPress={() => navigation.navigate("PaymentMethods")}
            right={() => <List.Icon icon="chevron-right" />}
          />
        </List.Section>

        <Divider />

        {/* Support et aide */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Support et aide</List.Subheader>
          <List.Item
            title="Centre d'aide"
            description="Questions fréquentes et guides"
            left={() => <List.Icon icon="help-circle" color={theme.colors.primary} />}
            onPress={() => navigation.navigate("HelpCenter")}
            right={() => <List.Icon icon="chevron-right" />}
          />
          <List.Item
            title="Contacter le support"
            description="Obtenir de l'aide pour vos problèmes"
            left={() => <List.Icon icon="email" color={theme.colors.primary} />}
            onPress={contactSupport}
            right={() => <List.Icon icon="chevron-right" />}
          />
          <List.Item
            title="Politique de confidentialité"
            description="Comment nous utilisons vos données"
            left={() => <List.Icon icon="shield-account" color={theme.colors.primary} />}
            onPress={openPrivacyPolicy}
            right={() => <List.Icon icon="chevron-right" />}
          />
          <List.Item
            title="Conditions d'utilisation"
            description="Termes légaux d'utilisation du service"
            left={() => <List.Icon icon="file-document" color={theme.colors.primary} />}
            onPress={openTermsOfService}
            right={() => <List.Icon icon="chevron-right" />}
          />
        </List.Section>

        <Divider />

        {/* Avancé */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Avancé</List.Subheader>
          <List.Item
            title="Vider le cache"
            description="Libérer de l'espace et résoudre les problèmes"
            left={() => <List.Icon icon="cached" color={theme.colors.primary} />}
            onPress={handleClearCache}
          />
          <List.Item
            title="Version de l'application"
            description={`Version ${APP_VERSION}`}
            left={() => <List.Icon icon="information" color={theme.colors.primary} />}
          />
        </List.Section>

        <Divider />

        {/* Déconnexion */}
        <List.Section>
          <List.Item
            title="Se déconnecter"
            titleStyle={styles.logoutText}
            left={() => <List.Icon icon="logout" color="#FF4952" />}
            onPress={showDialog}
          />
        </List.Section>

        {/* Espace en bas pour éviter que le dernier élément soit caché */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Dialog de confirmation de déconnexion */}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Confirmer la déconnexion</Dialog.Title>
          <Dialog.Content>
            <Text>Êtes-vous sûr de vouloir vous déconnecter ?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Annuler</Button>
            <Button onPress={handleLogout} textColor="#FF4952">
              Confirmer
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar pour les notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileCard: {
    margin: 16,
    elevation: 2,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  editProfileButton: {
    marginTop: 8,
  },
  editProfileText: {
    color: "#FF4952",
    fontWeight: "500",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  logoutText: {
    color: "#FF4952",
  },
  bottomSpacer: {
    height: 20,
  },
  languageIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
})

export default SettingsScreen