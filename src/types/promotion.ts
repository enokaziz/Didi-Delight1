export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  conditions?: string;
  minimumPurchase?: number;
  applicableProducts?: string[]; // IDs des produits
  applicableCategories?: string[]; // IDs des catégories
  usageLimit?: number;
  usageCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
