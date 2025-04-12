import { useRef, useState, useCallback } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  Animated,
  Pressable,
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import HomeScreen from "../screens/HomeScreen";
import { useAuth } from "../contexts/AuthContext";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import DeliveryTrackingScreen from "../screens/DeliveryTrackingScreen";
import ChatScreen from "../screens/ChatScreen";
import LoyaltyPointsScreen from "../screens/client/LoyaltyPointsScreen";
import { CartStackNavigator } from "./CartStackNavigator";
import { SettingsStackNavigator } from "./SettingsStackNavigator";
import EventsNavigator from "./EventsNavigator";
import PaymentNavigator from "./PaymentNavigator";
import CheckoutScreen from "../screens/CheckoutScreen"; // Ajouter l'import de CheckoutScreen
import { getAuth, signOut } from "firebase/auth";
import { CommonActions } from "@react-navigation/native";

type IconConfigType = {
  Accueil: {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
    color: string;
  };
  Panier: {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
    color: string;
  };
  Commandes: {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
    color: string;
  };
  Événements: {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
    color: string;
  };
  "Suivi Livraison": {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
    color: string;
  };
  Paramètres: {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
    color: string;
  };
  Chat: {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
    color: string;
  };
  Paiement: {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
    color: string;
  };
  Fidélité: {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
    color: string;
  };
  Checkout: {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
    color: string;
  };
  [key: string]: {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
    color: string;
  };
};

const ICON_CONFIG: IconConfigType = {
  Accueil: { lib: Ionicons, name: "home", color: "#FF6B6B" },
  Panier: { lib: Ionicons, name: "cart", color: "#4ECDC4" },
  Commandes: { lib: Ionicons, name: "list", color: "#FFD166" },
  Événements: { lib: Ionicons, name: "calendar", color: "#118AB2" },
  "Suivi Livraison": { lib: Ionicons, name: "bicycle", color: "#073B4C" },
  Paramètres: { lib: Ionicons, name: "settings", color: "#06D6A0" },
  Chat: { lib: Ionicons, name: "chatbubbles", color: "#FF9F1C" },
  Paiement: { lib: Ionicons, name: "card", color: "#8338EC" },
  Fidélité: { lib: Ionicons, name: "star", color: "#F04E98" },
  Checkout: { lib: Ionicons, name: "cart", color: "#4ECDC4" },
};

type IconLibrary = typeof Ionicons | typeof MaterialIcons;

const getIcon = (
  Lib: IconLibrary,
  name: string | undefined,
  color: string,
  size: number
) => {
  const IconComponent = Lib;
  if (!name || !IconComponent) {
    console.warn(`Icône manquante pour ${name}`);
    return <MaterialIcons name="error-outline" size={size} color="red" />;
  }
  return <IconComponent name={name as any} size={size} color={color} />;
};

const getRouteIcon = (route: string) => {
  const config = ICON_CONFIG[route as keyof IconConfigType];
  return config ? getIcon(config.lib, config.name, config.color, 24) : null;
};

const Drawer = createDrawerNavigator();

// Custom drawer content component
const CustomDrawerContent = ({ navigation, state }: any) => {
  const [activeRoute, setActiveRoute] = useState(state.routeNames[0]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(getAuth());
      navigation.getParent()?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "AuthNavigator" }],
        })
      );
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      Alert.alert("Erreur", "La déconnexion a échoué");
    }
  }, [navigation]);

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Didi-Delight</Text>
        <Text style={styles.drawerSubtitle}>Délices & Gourmandises</Text>
      </View>

      <View style={styles.drawerContent}>
        {/* Section Principale */}
        {state.routeNames.slice(0, 6).map((route: string) => (
          <Pressable
            key={route}
            style={[
              styles.drawerItem,
              activeRoute === route && styles.drawerItemFocused,
            ]}
            onPress={() => {
              navigation.navigate(route);
              setActiveRoute(route);
            }}
          >
            {getRouteIcon(route)}
            <Text style={styles.drawerItemText}>{route}</Text>
          </Pressable>
        ))}

        <View style={styles.divider} />

        {/* Section Secondaire */}
        {state.routeNames.slice(6).map((route: string) => (
          <Pressable
            key={route}
            style={[
              styles.drawerItem,
              activeRoute === route && styles.drawerItemFocused,
            ]}
            onPress={() => {
              navigation.navigate(route);
              setActiveRoute(route);
            }}
          >
            {getRouteIcon(route)}
            <Text style={styles.drawerItemText}>{route}</Text>
          </Pressable>
        ))}

        <View style={styles.divider} />

        {/* Bouton Déconnexion */}
        <Pressable
          style={[styles.drawerItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color="#dc3545" />
          <Text style={[styles.drawerItemText, styles.logoutText]}>
            Déconnexion
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const ClientNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Accueil"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => {
        const routeName = route.name as keyof typeof ICON_CONFIG;
        const { color } = ICON_CONFIG[routeName];

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
        };
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
      <Drawer.Screen
        name="Fidélité"
        component={LoyaltyPointsScreen}
        options={{
          drawerLabel: "Programme Fidélité",
        }}
      />
      <Drawer.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          drawerLabel: "Checkout",
        }}
      />
    </Drawer.Navigator>
  );
};

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
  divider: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#fff5f5",
  },
  logoutText: {
    color: "#dc3545",
    fontWeight: "600",
  },
});

export default ClientNavigator;
