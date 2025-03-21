import type React from "react"
import { useState, useEffect } from "react"
import { View, ScrollView, SafeAreaView, TouchableOpacity, Linking, Platform, Alert } from "react-native"
import { useAuth } from "@contexts/AuthContext"
import {
  List,
  Dialog,
  Portal,
  Button,
  Switch,
  Text,
  Snackbar,
  useTheme,
  Divider,
} from "react-native-paper"
import { useNavigation, type NavigationProp } from "@react-navigation/native"
import type { RootStackParamList } from "@navigation/types"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import Constants from "expo-constants"
import * as LocalAuthentication from 'expo-local-authentication';
import { ProfileCard } from "@components/ProfileCard"
import { SettingsSection } from "@components/SettingsSection"
import { styles as settingsStyles } from '@styles/screens/settings/styles';

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
    <SafeAreaView style={settingsStyles.safeArea}>
      <ScrollView style={settingsStyles.container}>
        <ProfileCard 
          user={user} 
          onEditProfile={() => navigation.navigate("EditProfile")} 
        />

        {/* Paramètres du compte */}
        <SettingsSection
          title="Paramètres du compte"
          items={[
            {
              title: "Modifier le mot de passe",
              description: "Mettre à jour votre mot de passe pour plus de sécurité",
              icon: "lock-reset",
              onPress: () => navigation.navigate("ChangePasswordScreen"),
            },
            {
              title: "Adresses de livraison",
              description: "Gérer vos adresses de livraison",
              icon: "map-marker",
              onPress: () => navigation.navigate("AddressesScreen"),
            },
          ]}
        />

        <Divider />

        {/* Paramètres de l'application */}
        <SettingsSection
          title="Paramètres de l'application"
          items={[
            {
              title: "Notifications",
              description: "Recevoir des alertes sur les promotions et commandes",
              icon: "bell",
              right: (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  color={theme.colors.primary}
                />
              ),
            },
            {
              title: "Mode sombre",
              description: "Changer l'apparence de l'application",
              icon: darkModeEnabled ? "weather-night" : "white-balance-sunny",
              right: (
                <Switch value={darkModeEnabled} onValueChange={handleDarkModeToggle} color={theme.colors.primary} />
              ),
            },
            {
              title: "Langue",
              description: "Changer la langue de l'application",
              icon: "translate",
              onPress: () => navigation.navigate("LanguageSelector"),
              right: (
                <View style={settingsStyles.languageIndicator}>
                  <Text>FR</Text>
                  <List.Icon icon="chevron-right" />
                </View>
              ),
            },
            {
              title: "Authentification biométrique",
              description: "Se connecter avec empreinte digitale ou Face ID",
              icon: "fingerprint",
              right: (
                <Switch value={biometricEnabled} onValueChange={handleBiometricToggle} color={theme.colors.primary} />
              ),
            },
          ]}
        />

        <Divider />

        {/* Commandes et paiements */}
        <SettingsSection
          title="Commandes et paiements"
          items={[
            {
              title: "Historique des commandes",
              description: "Voir toutes vos commandes passées",
              icon: "history",
              onPress: () => navigation.navigate("OrderHistory"),
            },
            {
              title: "Méthodes de paiement",
              description: "Gérer vos cartes et options de paiement",
              icon: "credit-card",
              onPress: () => navigation.navigate("PaymentMethods"),
            },
          ]}
        />

        <Divider />

        {/* Support et aide */}
        <SettingsSection
          title="Support et aide"
          items={[
            {
              title: "Centre d'aide",
              description: "Questions fréquentes et guides",
              icon: "help-circle",
              onPress: () => navigation.navigate("HelpCenter"),
            },
            {
              title: "Contacter le support",
              description: "Obtenir de l'aide pour vos problèmes",
              icon: "email",
              onPress: contactSupport,
            },
            {
              title: "Politique de confidentialité",
              description: "Comment nous utilisons vos données",
              icon: "shield-account",
              onPress: openPrivacyPolicy,
            },
            {
              title: "Conditions d'utilisation",
              description: "Termes légaux d'utilisation du service",
              icon: "file-document",
              onPress: openTermsOfService,
            },
          ]}
        />

        <Divider />

        {/* Avancé */}
        <SettingsSection
          title="Avancé"
          items={[
            {
              title: "Vider le cache",
              description: "Libérer de l'espace et résoudre les problèmes",
              icon: "cached",
              onPress: handleClearCache,
            },
            {
              title: "Version de l'application",
              description: `Version ${APP_VERSION}`,
              icon: "information",
            },
          ]}
        />

        <Divider />

        {/* Déconnexion */}
        <SettingsSection
          title="Se déconnecter"
          items={[
            {
              title: "Se déconnecter",
              titleStyle: settingsStyles.logoutText,
              icon: "logout",
              iconColor: "#FF4952",
              onPress: showDialog,
            },
          ]}
        />

        {/* Espace en bas pour éviter que le dernier élément soit caché */}
        <View style={settingsStyles.bottomSpacer} />
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

export default SettingsScreen