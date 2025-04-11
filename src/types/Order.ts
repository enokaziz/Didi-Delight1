// types/Order.ts
import { Timestamp } from "firebase/firestore";

export type OrderStatus =
  | "En attente"
  | "En cours"
  | "Livrée"
  | "Annulée"
  | "all";

export interface Product {
  quantity: number;
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock: number;
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
}

export interface OrderItem {
  imageUrl: string | undefined;
  notes: any;
  id: string;
  name: string;
  price: number;
  quantity: number;
  product: Product;
  specialInstructions?: string;
}

export interface OrderHistoryEntry {
  status: OrderStatus;
  timestamp: Timestamp;
  note?: string;
}

export interface Order {
  phone: any;
  deliveryNotes: any;
  isUrgent: any;
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: any; // Permettre différents types de date
  updatedAt: any; // Permettre différents types de date
  deliveryAddress: string;
  notes?: string;
  deliveryFee?: number;
  tax?: number;
  discount?: number;
  finalAmount?: number;
  history?: OrderHistoryEntry[];
}
