export interface SubscriptionData {
  id: string;
  userId: string;
  status: string;
  planId: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}
