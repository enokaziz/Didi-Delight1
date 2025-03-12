import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Platform, Animated, Pressable } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import DeliveryTrackingScreen from "../screens/DeliveryTrackingScreen";
import ChatScreen from "../screens/ChatScreen";
import { CartStackNavigator } from "./CartStackNavigator";
import { SettingsStackNavigator } from "./SettingsStackNavigator";
import EventsNavigator from "./EventsNavigator";
import PaymentNavigator from './PaymentNavigator';

type IconConfigType = {
  [key in "Accueil" | "Panier" | "Commandes" | "Événements" | "Suivi Livraison" | "Paramètres" | "Chat" | "Paiement"]: {
    lib: typeof Ionicons | typeof MaterialIcons;
    name: string;
  };
};

const ICON_CONFIG: IconConfigType = {
  Accueil: { lib: Ionicons, name: Platform.select({ ios: "ios-home", android: "home-outline" })! },
  Panier: { lib: MaterialIcons, name: "shopping-cart" },
  Commandes: { lib: Ionicons, name: "list" },
  "Événements": { lib: MaterialIcons, name: "event" },
  "Suivi Livraison": { lib: MaterialIcons, name: "local-shipping" },
  Paramètres: { lib: Ionicons, name: "settings" },
  Chat: { lib: Ionicons, name: "chatbubble-ellipses" },
  Paiement: { lib: MaterialIcons, name: "payment" },
};

type IconLibrary = typeof Ionicons | typeof MaterialIcons;

const getIcon = (Lib: IconLibrary, name: string | undefined, color: string, size: number) => {
  const IconComponent = Lib;
  if (!name || !IconComponent) {
    console.warn(`Icône manquante pour ${name}`);
    return <MaterialIcons name="error-outline" size={size} color="red" />;
  }
  return <IconComponent name={name as any} size={size} color={color} />;
};

const Tab = createBottomTabNavigator();

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps & { routeName: keyof typeof ICON_CONFIG; iconScale: Animated.Value }> = React.memo(
  ({ focused, color, size, routeName, iconScale }) => {
    const { lib, name } = ICON_CONFIG[routeName];
    const iconSize = focused ? size * 1.2 : size;
    const iconColor = focused ? "#FF4952" : "gray";

    return (
      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        {name && getIcon(lib, name, iconColor, iconSize)}
      </Animated.View>
    );
  }
);

const ClientNavigator = () => {
  const iconScale = useRef(new Animated.Value(1)).current;
  const [focusedRouteName, setFocusedRouteName] = useState<string>("Accueil");
  const [currentRouteName, setCurrentRouteName] = useState<string>("Accueil");

  const handleTabPress = useCallback((routeName: string) => {
    Animated.sequence([
      Animated.timing(iconScale, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(iconScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setCurrentRouteName(routeName);
  }, [iconScale]);

  const screenOptions = useMemo(
    () => ({ route }: { route: RouteProp<any, any> }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }: TabBarIconProps) => (
        <TabBarIcon
          focused={focused}
          color={color}
          size={size}
          routeName={route.name as keyof typeof ICON_CONFIG}
          iconScale={iconScale}
        />
      ),
      tabBarActiveTintColor: "#FF4952",
      tabBarInactiveTintColor: "gray",
      tabBarStyle: {
        paddingBottom: 5,
        height: 60,
        elevation: 5,
        backgroundColor: '#FFFFFF',
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        paddingBottom: 3,
      },
      tabBarButton: (props: BottomTabBarButtonProps) => (
        <Pressable
          {...props}
          style={({ pressed }) => [
            pressed && { opacity: 0.7 },
            { flex: 1, justifyContent: 'center', alignItems: 'center' }
          ]}
          onPress={(event) => {
            if (props.onPress) props.onPress(event);
            handleTabPress(route.name);
          }}
          accessibilityRole="button"
        />
      ),
    }),
    [iconScale, handleTabPress]
  );

  useEffect(() => {
    if (currentRouteName) {
      setFocusedRouteName(currentRouteName);
    }
  }, [currentRouteName]);

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen 
        name="Accueil" 
        component={HomeScreen} 
        options={{ tabBarAccessibilityLabel: "Aller à l'accueil" }} 
      />
      <Tab.Screen 
        name="Panier" 
        component={CartStackNavigator} 
        options={{ tabBarAccessibilityLabel: "Voir le panier" }} 
      />
      <Tab.Screen 
        name="Commandes" 
        component={OrderHistoryScreen} 
        options={{ tabBarAccessibilityLabel: "Historique des commandes" }} 
      />
      <Tab.Screen
        name="Événements"
        component={EventsNavigator}
        options={{ tabBarAccessibilityLabel: "Gérer les événements" }}
      />
      <Tab.Screen
        name="Suivi Livraison"
        component={DeliveryTrackingScreen}
        options={{ tabBarAccessibilityLabel: "Suivre la livraison" }}
      />
      <Tab.Screen 
        name="Paramètres" 
        component={SettingsStackNavigator} 
        options={{ tabBarAccessibilityLabel: "Paramètres" }} 
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: "Support",
          tabBarAccessibilityLabel: "Ouvrir le chat avec le support client",
          tabBarBadge: 2,
          tabBarBadgeStyle: { 
            backgroundColor: "#FF4952", 
            color: "#fff",
            fontSize: 10,
          },
        }}
      />
      <Tab.Screen
        name="Paiement"
        component={PaymentNavigator}
        options={{ 
          title: "Paiement",
          tabBarAccessibilityLabel: "Gérer les méthodes de paiement" 
        }}
      />
    </Tab.Navigator>
  );
};

export default ClientNavigator;