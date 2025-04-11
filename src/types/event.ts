export type EventType = "wedding" | "birthday" | "ceremony" | "other";

export type EventStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

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
  status: EventStatus;
  totalAmount: number;
  deposit?: number;
  depositPaid: boolean;
  specialRequirements?: string;
  contactPhone: string;
  contactEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
  adminActions?: {
    action: "approved" | "rejected" | "modified";
    date: Date;
    adminId: string;
    reason?: string;
  }[];
}
