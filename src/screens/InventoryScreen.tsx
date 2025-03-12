import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { inventoryService } from '../services/inventory/inventoryService';

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
}

const InventoryScreen = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchInventory = async () => {
      const items = await inventoryService.getLowStockItems();
      setInventoryItems(items);
    };
    fetchInventory();
  }, []);

  const productId = inventoryItems[0]?.productId;
  const quantity = inventoryItems[0]?.quantity;
  const id = inventoryItems[0]?.id;

  return (
    <View>
      <Text>Inventaire :</Text>
      <FlatList
        data={inventoryItems}
        renderItem={({ item }) => (
          <View>
            <Text>{item.productId}: {item.quantity} en stock</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default InventoryScreen;
