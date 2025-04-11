export type OrderStatus = "PENDING" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED";

export const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: "En attente",
    color: "#FFD166",
    nextStatus: "IN_PROGRESS",
    icon: "time",
    iconColor: "#6c757d",
    description: "La commande est en attente de traitement",
  },
  IN_PROGRESS: {
    label: "En cours",
    color: "#118AB2",
    nextStatus: "DELIVERED",
    icon: "hourglass",
    iconColor: "#6c757d",
    description: "La commande est en cours de préparation",
  },
  DELIVERED: {
    label: "Livrée",
    color: "#4ECDC4",
    nextStatus: null,
    icon: "checkmark-circle",
    iconColor: "#6c757d",
    description: "La commande a été livrée avec succès",
  },
  CANCELLED: {
    label: "Annulée",
    color: "#FF6B6B",
    nextStatus: null,
    icon: "close-circle",
    iconColor: "#6c757d",
    description: "La commande a été annulée",
  },
} as const;

export const getOrderStatusConfig = (status: OrderStatus) => {
  return ORDER_STATUS_CONFIG[status];
};

export const getNextOrderStatus = (
  currentStatus: OrderStatus
): OrderStatus | null => {
  const config = ORDER_STATUS_CONFIG[currentStatus];
  return config.nextStatus ? config.nextStatus : null;
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  return ORDER_STATUS_CONFIG[status].color;
};

export const getOrderStatusIcon = (status: OrderStatus): string => {
  return ORDER_STATUS_CONFIG[status].icon;
};

export const getOrderStatusIconColor = (status: OrderStatus): string => {
  return ORDER_STATUS_CONFIG[status].iconColor;
};

export const getOrderStatusDescription = (status: OrderStatus): string => {
  return ORDER_STATUS_CONFIG[status].description;
};

export const ORDER_STATUS_OPTIONS = Object.keys(
  ORDER_STATUS_CONFIG
) as OrderStatus[];

export const ORDER_STATUS_LABELS = ORDER_STATUS_OPTIONS.reduce(
  (acc, status) => {
    acc[status] = ORDER_STATUS_CONFIG[status].label;
    return acc;
  },
  {} as Record<OrderStatus, string>
);
