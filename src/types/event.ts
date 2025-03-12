export type EventType = 'wedding' | 'birthday' | 'ceremony' | 'other';

export interface EventProduct {
  productId: string;
  quantity: number;
  specialInstructions?: string;
}

export interface Event {
  id: string;
  userId: string;
  type: EventType;
  title: string;
  description: string;
  date: Date;
  location: string;
  expectedGuests: number;
  products: EventProduct[];
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  totalAmount: number;
  deposit?: number;
  depositPaid: boolean;
  specialRequirements?: string;
  contactPhone: string;
  contactEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}
