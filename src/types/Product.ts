// src/types/Product.ts
export interface Product {
  quantity: number;
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean; // Indique si le produit est populaire
  isPromotional?: boolean; // Indique si le produit est en promotion
}