// src/types/Product.ts
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isPopular?: boolean; // Ajout de la propriété isPopular
    isPromotional?: boolean; // Ajout de la propriété isPromotional

  }
