// src/types/Product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  quantity?: number;
  isPromotional?: boolean;
  isPopular?: boolean;
  image?: string;
}
