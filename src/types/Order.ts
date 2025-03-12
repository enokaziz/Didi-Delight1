// types/Order.ts
import { Product } from "./Product";

export interface Order {
  id?: string;
  userId: string;
  items: Product[];
  total: number;
  status: "En attente" | "En cours" | "Livrée";
  createdAt: string;
  paymentMethod: string; // Rendue obligatoire
  shippingAddress: string; // Rendue obligatoire
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}