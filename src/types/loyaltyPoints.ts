export interface LoyaltyPoints {
  id: string;
  userId: string;
  points: number;
  history: {
    date: Date;
    points: number;
    type: 'earn' | 'redeem';
    description: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
