import { Product } from "../types/Product";
import { PaymentMethod } from "../types/PaymentMethod";
import EventManagementScreen from 'screens/admin/EventManagementScreen';
import InventoryManagementScreen from 'screens/admin/InventoryManagementScreen';
import LoyaltyPointsManagementScreen from 'screens/admin/LoyaltyPointsManagementScreen';

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
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  Events : undefined;
};
