// Types pour les méthodes de paiement
export type PaymentMethodType = 'mobile_money' | 'card';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  isDefault: boolean;
  userId: string;
  // Champs spécifiques pour Mobile Money
  phoneNumber?: string;
  provider?: 'orange' | 'moov';
  // Champs pour d'autres types de paiement peuvent être ajoutés ici
  createdAt: Date;
  updatedAt: Date;
}
