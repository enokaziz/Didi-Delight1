// src/types/navigation.ts
import { Product } from "../types/Product";

export type RootStackParamList = {
  Auth: undefined;
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
  
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminChats: undefined;
  AdminChat: { clientId: string };
  ProductManagement: undefined;
  AddEditProduct: { product?: Product };
  Auth: undefined;
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
};