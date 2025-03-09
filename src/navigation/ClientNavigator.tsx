import React, { useEffect, useRef, useState } from "react";
import { createBottomTabNavigator, BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Platform, Animated, Pressable } from "react-native";
import { RouteProp, useNavigation, ParamListBase, Theme, NavigationAction } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import DeliveryTrackingScreen from "../screens/DeliveryTrackingScreen";
import CartScreen from "../screens/CartScreen";
import ChatScreen from "../screens/ChatScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import LanguageSelectorScreen from "../screens/LanguageSelectorScreen";
import OrderHistory from "../screens/OrderHistory";
import PaymentMethods from "../screens/PaymentMethods";
import AddressesScreen from "../screens/AddressesScreen";
import HelpCenter from "../screens/HelpCenter";

const ICON_CONFIG = {
    Accueil: { lib: Ionicons, name: Platform.select({ ios: "ios-home", android: "home-outline" }) },
    Panier: { lib: MaterialIcons, name: "shopping-cart" as const },
    Commandes: { lib: Ionicons, name: "list" as const },
    "Suivi Livraison": { lib: MaterialIcons, name: "local-shipping" as const },
    Paramètres: { lib: Ionicons, name: "settings" as const },
    Chat: { lib: Ionicons, name: "chatbubble-ellipses" as const },
} as const;

type IconLibrary = typeof Ionicons | typeof MaterialIcons;

const getIcon = (Lib: IconLibrary, name: string, color: string, size: number) => {
    const IconComponent = Lib;
    return IconComponent ? (
        <IconComponent name={name as keyof typeof IconComponent.glyphMap} size={size} color={color} accessibilityLabel={`Aller à ${name}`} />
    ) : null;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CartStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CartMain" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
);

const SettingsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SettingsMain" component={SettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="LanguageSelector" component={LanguageSelectorScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistory} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
        <Stack.Screen name="HelpCenter" component={HelpCenter} />
        <Stack.Screen name="AddressesScreen" component={AddressesScreen} />
    </Stack.Navigator>
);

const ClientNavigator = () => {
    const iconScale = useRef(new Animated.Value(1)).current;
    const [focusedRouteName, setFocusedRouteName] = useState<string | undefined>(undefined);
    const [currentRouteName, setCurrentRouteName] = useState<string | undefined>(undefined);

    const handleIconPress = () => {
        Animated.sequence([
            Animated.spring(iconScale, { toValue: 1.2, useNativeDriver: true }),
            Animated.spring(iconScale, { toValue: 1, useNativeDriver: true }),
        ]).start();
    };

    useEffect(() => {
        if (currentRouteName) {
            setFocusedRouteName(currentRouteName);
        }
    }, [currentRouteName]);

    return (
        <Tab.Navigator
            screenOptions={({ route, navigation }: { route: RouteProp<ParamListBase, string>; navigation: BottomTabNavigationProp<ParamListBase, string, undefined>; theme: Theme; }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    const { lib, name } = ICON_CONFIG[route.name as keyof typeof ICON_CONFIG];
                    const iconSize = focused ? size * 1.2 : size;
                    const iconColor = focused ? "#FF4952" : "gray";

                    if (focused) {
                        setCurrentRouteName(route.name);
                    }

                    return (
                        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                            {name && getIcon(lib, name, iconColor, iconSize)}
                        </Animated.View>
                    );
                },
                tabBarActiveTintColor: "#FF4952",
                tabBarInactiveTintColor: "gray",
                tabBarStyle: { paddingBottom: 5, height: 60 },
                tabBarLabelStyle: { fontSize: 12 },
                tabBarButton: (props) => {
                    const navigation = useNavigation();

                    return (
                        <Pressable
                            {...props}
                            onPress={() => {
                                if (props.onPress) {
                                    (props.onPress as () => void)();
                                }
                                if (route.name === focusedRouteName) {
                                    handleIconPress();
                                }
                            }}
                        />
                    );
                },
                listeners: ({ navigation, route }: { navigation: BottomTabNavigationProp<ParamListBase>; route: RouteProp<ParamListBase, string> }) => ({
                    tabPress: (e: NavigationAction) => {
                        if (route.name === focusedRouteName) {
                            handleIconPress();
                        }
                    },
                }),
            })}
        >
            <Tab.Screen name="Accueil" component={HomeScreen} />
            <Tab.Screen name="Panier" component={CartStack} />
            <Tab.Screen name="Commandes" component={OrderHistoryScreen} />
            <Tab.Screen name="Suivi Livraison" component={DeliveryTrackingScreen} />
            <Tab.Screen name="Paramètres" component={SettingsStack} />
            <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: "Support", tabBarAccessibilityLabel: "Contacter le support" }} />
        </Tab.Navigator>
    );
};

export default ClientNavigator;