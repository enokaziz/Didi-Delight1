export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "user";
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
  address?: string;
  ordersCount?: number;
  totalSpent?: number;
  loyaltyPoints?: number;
  lastOrderDate?: string;
}
