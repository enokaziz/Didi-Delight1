import type { RouteProp } from "@react-navigation/native";
import { NavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PaymentMethod } from "../types/PaymentMethod";
import { Product } from "../types/Product";

export type RootStackParamList = {
  Auth: undefined;
  AuthScreen: undefined;
  ClientApp: undefined;
  AdminApp: undefined;
  AddEditProduct: { product?: Product };
  Chat: { orderId?: string };
  Checkout: undefined;
  Commandes: undefined;
  EditProfile: undefined;
  LanguageSelector: undefined;
  Panier: undefined;
  Paramètres: undefined;
  ChangePasswordScreen: undefined;
  AddressesScreen: undefined;
  OrderHistory: undefined;
  ProductManagement: undefined;
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  EditPaymentMethod: { paymentMethod: PaymentMethod };
  HelpCenter: undefined;
  OrderDetails: { orderId: string };
  ClientTabs: undefined;
  ChangerPasswordScreen: undefined;
};

export type NavigationProps = NavigationProp<RootStackParamList>;

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminChats: undefined;
  AdminChat: { clientId: string };
  ProductManagement: undefined;
  AddEditProduct: { product?: Product };
  Auth: undefined;
  AuthScreen: undefined;
  EventManagement: undefined;
  PromotionManagement: undefined;
  InventoryManagement: undefined;
  LoyaltyPointsManagement: undefined;
  OrderDetails: { orderId: string };
  OrderList: undefined;
  SalesReport: undefined;
  OrdersInProgress: undefined;
  CompletedOrders: undefined;
  CustomerList: undefined;
  Reports: undefined;
  ProductList: undefined;
};

export type ClientStackParamList = {
  Accueil: undefined;
  Panier: undefined;
  Commandes: undefined;
  "Suivi Livraison": undefined;
  Paramètres: undefined;
  Chat: { orderId?: string };
  Checkout: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  LanguageSelector: undefined;
  AddressesScreen: undefined;
  OrderHistory: undefined;
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  EditPaymentMethod: { paymentMethod: PaymentMethod };
  HelpCenter: undefined;
  OrderDetails: { orderId: string };
  ProductDetails: { product: Product }; // Ajout de la route ProductDetails
};

export type PaymentStackParamList = {
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  EditPaymentMethod: { paymentMethod: PaymentMethod };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  BiometricAuth: undefined;
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  Events: undefined;
};

export type CartScreenNavigationProp = NativeStackNavigationProp<
  ClientStackParamList,
  "Panier"
>;
export type CheckoutScreenNavigationProp = NativeStackNavigationProp<
  ClientStackParamList,
  "Checkout"
>;
export type ProductDetailsScreenRouteProp = NativeStackNavigationProp<
  ClientStackParamList,
  "ProductDetails"
>;

export type ProductDetailsRouteProp = RouteProp<
  ClientStackParamList,
  "ProductDetails"
>;

export type ProductDetailsScreenNavigationProp = NativeStackNavigationProp<
  ClientStackParamList,
  "ProductDetails"
>;
