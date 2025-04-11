import { useCallback } from "react";
import {
  OrderStatus,
  getOrderStatusConfig,
  getNextOrderStatus,
  getOrderStatusColor,
  getOrderStatusIcon,
  getOrderStatusIconColor,
  getOrderStatusDescription,
} from "../config/orderStatus";

export const useOrderStatus = (status: OrderStatus) => {
  const config = getOrderStatusConfig(status);

  const getNextStatus = useCallback(() => getNextOrderStatus(status), [status]);
  const getColor = useCallback(() => getOrderStatusColor(status), [status]);
  const getIcon = useCallback(() => getOrderStatusIcon(status), [status]);
  const getIconColor = useCallback(
    () => getOrderStatusIconColor(status),
    [status]
  );
  const getDescription = useCallback(
    () => getOrderStatusDescription(status),
    [status]
  );

  return {
    config,
    getNextStatus,
    getColor,
    getIcon,
    getIconColor,
    getDescription,
  };
};
