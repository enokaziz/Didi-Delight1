"use client"

import { useRef, useState, useCallback } from "react"
import { createDrawerNavigator } from "@react-navigation/drawer"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Animated, Pressable, View, Text, StyleSheet } from "react-native"
import HomeScreen from "../screens/HomeScreen"
import OrderHistoryScreen from "../screens/OrderHistoryScreen"
import DeliveryTrackingScreen from "../screens/DeliveryTrackingScreen"
import ChatScreen from "../screens/ChatScreen"
import { CartStackNavigator } from "./CartStackNavigator"
import { SettingsStackNavigator } from "./SettingsStackNavigator"
import EventsNavigator from "./EventsNavigator"
import PaymentNavigator from "./PaymentNavigator"

// Style 7: Ludique et Coloré - Sidebar Version

type IconConfigType = {
  [key in "Accueil" | "Panier" | "Commandes" | "Événements" | "Suivi Livraison" | "Paramètres" | "Chat" | "Paiement"]: {
    lib: typeof Ionicons | typeof MaterialIcons
    name: string
    color: string
  }
}

const ICON_CONFIG: IconConfigType = {
  Accueil: { lib: Ionicons, name: "home", color: "#FF6B6B" },
  Panier: { lib: Ionicons, name: "cart", color: "#4ECDC4" },
  Commandes: { lib: Ionicons, name: "list", color: "#FFD166" },
  Événements: { lib: Ionicons, name: "calendar", color: "#118AB2" },
  "Suivi Livraison": { lib: Ionicons, name: "bicycle", color: "#073B4C" },
  Paramètres: { lib: Ionicons, name: "settings", color: "#06D6A0" },
  Chat: { lib: Ionicons, name: "chatbubbles", color: "#FF9F1C" },
  Paiement: { lib: Ionicons, name: "card", color: "#8338EC" },
}

type IconLibrary = typeof Ionicons | typeof MaterialIcons

const getIcon = (Lib: IconLibrary, name: string | undefined, color: string, size: number) => {
  const IconComponent = Lib
  if (!name || !IconComponent) {
    console.warn(`Icône manquante pour ${name}`)
    return <MaterialIcons name="error-outline" size={size} color="red" />
  }
  return <IconComponent name={name as any} size={size} color={color} />
}

const Drawer = createDrawerNavigator()

// Custom drawer content component
const CustomDrawerContent = ({ navigation, state }: any) => {
  const [focusedRouteName, setFocusedRouteName] = useState<string>("Accueil")
  const iconScale = useRef(new Animated.Value(1)).current

  const handleNavigation = useCallback(
    (routeName: string) => {
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 1.4, duration: 200, useNativeDriver: true }),
        Animated.timing(iconScale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
      setFocusedRouteName(routeName)
      navigation.navigate(routeName)
    },
    [navigation, iconScale],
  )

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Pâtisserie</Text>
        <Text style={styles.drawerSubtitle}>Délices & Gourmandises</Text>
      </View>

      <View style={styles.drawerContent}>
        {Object.entries(ICON_CONFIG).map(([routeName, { lib, name, color }]) => {
          const isFocused = routeName === focusedRouteName
          const iconColor = isFocused ? color : "#6c757d"
          const iconSize = isFocused ? 24 : 22

          // Check for chat notifications
          const hasBadge = routeName === "Chat"

          return (
            <Pressable
              key={routeName}
              style={[styles.drawerItem, isFocused && { ...styles.drawerItemFocused, backgroundColor: `${color}20` }]}
              onPress={() => handleNavigation(routeName)}
            >
              <View style={[styles.iconContainer, { backgroundColor: isFocused ? color : "#f8f9fa" }]}>
                <Animated.View style={{ transform: [{ scale: isFocused ? iconScale : 1 }] }}>
                  {getIcon(lib, name, isFocused ? "#fff" : color, iconSize)}
                </Animated.View>
              </View>
              <Text style={[styles.drawerItemText, isFocused && { ...styles.drawerItemTextFocused, color }]}>
                {routeName === "Chat" ? "Support" : routeName}
              </Text>
              {hasBadge && (
                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              )}
            </Pressable>
          )
        })}
      </View>

      <View style={styles.drawerFooter}>
        <Pressable style={styles.logoutButton}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>
      </View>
    </View>
  )
}

const ClientNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Accueil"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => {
        const routeName = route.name as keyof typeof ICON_CONFIG
        const { color } = ICON_CONFIG[routeName]

        return {
          headerShown: true,
          headerStyle: {
            backgroundColor: "#FFFFFF",
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          },
          headerTintColor: color,
          headerTitleStyle: {
            fontWeight: "600",
          },
          drawerStyle: {
            backgroundColor: "#FFFFFF",
            width: 300,
          },
          drawerType: "front",
          swipeEdgeWidth: 50,
          drawerActiveTintColor: color,
          drawerInactiveTintColor: "#6c757d",
        }
      }}
    >
      <Drawer.Screen
        name="Accueil"
        component={HomeScreen}
        options={{
          drawerLabel: "Accueil",
        }}
      />
      <Drawer.Screen
        name="Panier"
        component={CartStackNavigator}
        options={{
          drawerLabel: "Panier",
        }}
      />
      <Drawer.Screen
        name="Commandes"
        component={OrderHistoryScreen}
        options={{
          drawerLabel: "Commandes",
        }}
      />
      <Drawer.Screen
        name="Événements"
        component={EventsNavigator}
        options={{
          drawerLabel: "Événements",
        }}
      />
      <Drawer.Screen
        name="Suivi Livraison"
        component={DeliveryTrackingScreen}
        options={{
          drawerLabel: "Suivi Livraison",
        }}
      />
      <Drawer.Screen
        name="Paramètres"
        component={SettingsStackNavigator}
        options={{
          drawerLabel: "Paramètres",
        }}
      />
      <Drawer.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          drawerLabel: "Support",
        }}
      />
      <Drawer.Screen
        name="Paiement"
        component={PaymentNavigator}
        options={{
          drawerLabel: "Paiement",
        }}
      />
    </Drawer.Navigator>
  )
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    marginBottom: 10,
    alignItems: "center",
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 5,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  drawerContent: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 5,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  drawerItemFocused: {
    borderRadius: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 16,
    color: "#6c757d",
  },
  drawerItemTextFocused: {
    fontWeight: "600",
  },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 5,
  },
  drawerFooter: {
    padding: 20,
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "80%",
  },
  logoutText: {
    color: "#fff",
    marginLeft: 10,
    fontWeight: "600",
  },
})

export default ClientNavigator

