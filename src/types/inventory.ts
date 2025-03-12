export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  minimumQuantity: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'unité';
  expirationDate?: Date;
  location?: string;
  batchNumber?: string;
  lastRestockDate: Date;
  supplier?: {
    id: string;
    name: string;
    contact: string;
  };
  cost: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  type: 'restock' | 'sale' | 'loss' | 'adjustment';
  quantity: number;
  date: Date;
  reason?: string;
  performedBy: string;
  documentReference?: string; // Référence à une commande ou un document
  createdAt: Date;
}
