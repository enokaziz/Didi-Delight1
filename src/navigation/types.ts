import { Product } from "../types/Product";
import { PaymentMethod } from "../types/PaymentMethod";

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
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  EditPaymentMethod: { paymentMethod: PaymentMethod };
  HelpCenter: undefined;
  OrderDetails: { orderId: string };
  ClientTabs: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminChats: undefined;
  AdminChat: { clientId: string };
  ProductManagement: undefined;
  AddEditProduct: { product?: Product };
  Auth: undefined;
  AuthScreen: undefined;
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
};
