import { Product } from "../types/Product";
import { PaymentMethod } from "../types/PaymentMethod";
import { Order } from "../types/Order";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

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
  ResetPassword: undefined;
  ProductDetails: { product: Product };
};

export type ProductDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
export type CheckoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;
export type CartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Panier'>;

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
  ResetPassword: undefined;
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  Events: undefined;
};
