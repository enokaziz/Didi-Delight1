"use client"

import type React from "react"
import { useState } from "react"
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Image } from "react-native"
import type { Order, OrderStatus } from "../../types/Order"
import { Ionicons } from "@expo/vector-icons"
import { formatOrderTime } from "../../utils/orderUtils"

interface StatusOrdersModalProps {
  visible: boolean
  onClose: () => void
  orders: Order[]
  status: OrderStatus
  onOrderPress: (order: Order) => void
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void
}

const StatusOrdersModal: React.FC<StatusOrdersModalProps> = ({
  visible,
  onClose,
  orders,
  status,
  onOrderPress,
  onStatusChange,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const getStatusColor = (orderStatus: OrderStatus) => {
    switch (orderStatus) {
      case "En attente":
        return "#118AB2"
      case "En cours":
        return "#FFD166"
      case "Livrée":
        return "#4ECDC4"
      case "Annulée":
        return "#FF6B6B"
      default:
        return "#6c757d"
    }
  }

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isExpanded = expandedOrderId === item.id

    return (
      <View style={styles.orderItem}>
        <TouchableOpacity style={styles.orderHeader} onPress={() => toggleOrderExpand(item.id)} activeOpacity={0.7}>
          <View style={styles.orderHeaderTop}>
            <Text style={styles.orderNumber}>Commande #{item.id.slice(-6)}</Text>
            <Text style={styles.orderTime}>{formatOrderTime(item.createdAt)}</Text>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.userInfo}>
              <Ionicons name="person" size={16} color="#6c757d" style={styles.icon} />
              <Text style={styles.userName}>{item.userName || "Client"}</Text>
            </View>
            <Text style={styles.orderAmount}>{(item.totalAmount || 0).toLocaleString()} FCFA</Text>
          </View>

          <View style={styles.expandIconContainer}>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#6c757d" />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.productsTitle}>Produits commandés</Text>

            {item.items && item.items.length > 0 ? (
              <View style={styles.productsList}>
                {item.items.map((product, index) => (
                  <View key={index} style={styles.productItem}>
                    {product.imageUrl ? (
                      <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                    ) : (
                      <View style={[styles.productImage, styles.productImagePlaceholder]}>
                        <Ionicons name="image-outline" size={20} color="#ccc" />
                      </View>
                    )}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>
                        {product.price?.toLocaleString()} FCFA × {product.quantity || 1}
                      </Text>
                    </View>
                    <Text style={styles.productTotal}>
                      {((product.price || 0) * (product.quantity || 1)).toLocaleString()} FCFA
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noProductsText}>Aucun produit disponible</Text>
            )}

            <View style={styles.actionButtonsContainer}>
              {status === "En attente" && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#FFD166" }]}
                    onPress={() => onStatusChange(item.id, "En cours")}
                  >
                    <Ionicons name="time" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Marquer en cours</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#FF6B6B" }]}
                    onPress={() => onStatusChange(item.id, "Annulée")}
                  >
                    <Ionicons name="close-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Annuler</Text>
                  </TouchableOpacity>
                </>
              )}

              {status === "En cours" && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#4ECDC4" }]}
                    onPress={() => onStatusChange(item.id, "Livrée")}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Marquer terminée</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#FF6B6B" }]}
                    onPress={() => onStatusChange(item.id, "Annulée")}
                  >
                    <Ionicons name="close-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Annuler</Text>
                  </TouchableOpacity>
                </>
              )}

              {status === "Annulée" && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#118AB2" }]}
                  onPress={() => onStatusChange(item.id, "En attente")}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Restaurer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={[styles.container, { backgroundColor: getStatusColor(status) + "10" }]}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.header, { backgroundColor: getStatusColor(status) }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Commandes {status.toLowerCase()}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toLocaleString()} FCFA
            </Text>
            <Text style={styles.statLabel}>Montant</Text>
          </View>
        </View>

        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucune commande {status.toLowerCase()}</Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#118AB2",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  closeButton: {
    padding: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginRight: 8,
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  orderItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  orderHeader: {
    padding: 16,
  },
  orderHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
  },
  orderTime: {
    fontSize: 12,
    color: "#6c757d",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 4,
  },
  userName: {
    fontSize: 14,
    color: "#495057",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
  },
  expandIconContainer: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 12,
  },
  productsList: {
    marginBottom: 16,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  productImagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212529",
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 12,
    color: "#6c757d",
  },
  productTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
  },
  noProductsText: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
    marginBottom: 16,
    textAlign: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
})

export default StatusOrdersModal
