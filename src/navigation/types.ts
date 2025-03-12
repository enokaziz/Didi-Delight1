import { Product } from "../types/Product";

export type RootStackParamList = {
  Auth: undefined; // Ajouté ici
  AuthScreen: undefined; // Déjà présent
  ClientApp: undefined;
  AdminApp: undefined;
  AddEditProduct: { product?: Product };
  Chat: undefined;
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
  HelpCenter: undefined;
  OrderDetails: { orderId: string };
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminChats: undefined;
  AdminChat: { clientId: string };
  ProductManagement: undefined;
  AddEditProduct: { product?: Product };
  Auth: undefined; // Garder cette ligne pour la compatibilité
  AuthScreen: undefined; // Ajouté ici
};

export type ClientStackParamList = {
  Accueil: undefined;
  Panier: undefined;
  Commandes: undefined;
  SuiviLivraison: undefined;
  Paramètres: undefined;
  Chat: undefined;
  Checkout: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  LanguageSelector: undefined;
  AddressesScreen: undefined;
  OrderHistory: undefined;
  PaymentMethods: undefined;
  HelpCenter: undefined;
};
