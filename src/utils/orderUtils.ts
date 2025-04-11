import { OrderStatus } from "../types/Order";

type OrderStatusWithoutAll = Exclude<OrderStatus, "all">;

export const orderStatusColors = {
  "En attente": "#FFD166",
  "En cours": "#118AB2",
  Livrée: "#4ECDC4",
  Annulée: "#FF6B6B",
  default: "#6c757d",
} as const;

export const getStatusColor = (status: OrderStatus): string => {
  return status !== "all" && status in orderStatusColors
    ? orderStatusColors[status as OrderStatusWithoutAll]
    : orderStatusColors.default;
};

export const orderStatusOrder = {
  "En attente": 1,
  "En cours": 2,
  Livrée: 3,
  Annulée: 4,
} as const;

export const getNextStatus = (
  currentStatus: OrderStatus
): OrderStatus | null => {
  if (currentStatus === "all") return null;

  const currentOrder = orderStatusOrder[currentStatus as OrderStatusWithoutAll];

  if (currentOrder === undefined) return null;

  const nextStatus = Object.entries(orderStatusOrder).find(
    ([_, order]) => order === currentOrder + 1
  );

  return nextStatus ? (nextStatus[0] as OrderStatus) : null;
};

export const formatOrderTime = (date: any): string => {
  if (!date) return "Date inconnue";

  try {
    if (date.toDate && typeof date.toDate === "function") {
      return new Date(date.toDate()).toLocaleString("fr-FR");
    }
    if (typeof date === "string") {
      return new Date(date).toLocaleString("fr-FR");
    }
    if (date instanceof Date) {
      return date.toLocaleString("fr-FR");
    }
    return "Date inconnue";
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return "Date inconnue";
  }
};
