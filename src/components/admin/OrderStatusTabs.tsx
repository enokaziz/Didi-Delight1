import React, { useRef, useEffect } from "react"
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Animated,
  Dimensions
} from "react-native"
import type { OrderStatus } from "../../types/Order"

interface OrderStatusTabsProps {
  currentStatus: OrderStatus
  onStatusChange: (status: OrderStatus) => void
  counts: {
    [key in OrderStatus]: number
  }
}

const OrderStatusTabs: React.FC<OrderStatusTabsProps> = ({
  currentStatus,
  onStatusChange,
  counts,
}) => {
  const statuses: OrderStatus[] = ["En attente", "En cours", "Livrée", "Annulée"]
  const scrollViewRef = useRef<ScrollView>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const screenWidth = Dimensions.get('window').width

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [])

  useEffect(() => {
    // Scroll to the active tab
    const index = statuses.findIndex(status => status === currentStatus)
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: (index * (screenWidth / 2.5)),
        animated: true,
      })
    }
  }, [currentStatus])

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "En attente":
        return "#FFD166"
      case "En cours":
        return "#118AB2"
      case "Livrée":
        return "#4ECDC4"
      case "Annulée":
        return "#FF6B6B"
      default:
        return "#6c757d"
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "En attente":
        return "⏱️"
      case "En cours":
        return "🔄"
      case "Livrée":
        return "✅"
      case "Annulée":
        return "❌"
      default:
        return "📋"
    }
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.tab,
              currentStatus === status && {
                backgroundColor: getStatusColor(status),
                borderColor: getStatusColor(status),
              },
            ]}
            onPress={() => onStatusChange(status)}
            accessibilityLabel={`Afficher les commandes ${status}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: currentStatus === status }}
          >
            <Text style={styles.statusIcon}>{getStatusIcon(status)}</Text>
            <Text
              style={[
                styles.tabText,
                currentStatus === status && styles.activeTabText,
              ]}
            >
              {status}
            </Text>
            <View
              style={[
                styles.countBadge,
                currentStatus === status && styles.activeCountBadge,
                counts[status] === 0 && styles.emptyCountBadge,
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  currentStatus === status && styles.activeCountText,
                ]}
              >
                {counts[status]}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.indicator}>
        <View 
          style={[
            styles.indicatorBar, 
            { 
              backgroundColor: getStatusColor(currentStatus),
              left: `${(statuses.findIndex(s => s === currentStatus) / statuses.length) * 100}%`,
              width: `${100 / statuses.length}%`
            }
          ]} 
        />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginRight: 12,
    minWidth: 120,
    justifyContent: "center",
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginRight: 8,
  },
  activeTabText: {
    color: "#fff",
  },
  countBadge: {
    backgroundColor: "#e9ecef",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  activeCountBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  emptyCountBadge: {
    opacity: 0.5,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
  },
  activeCountText: {
    color: "#fff",
  },
  indicator: {
    height: 3,
    backgroundColor: "#f0f0f0",
    marginTop: 8,
    position: "relative",
  },
  indicatorBar: {
    position: "absolute",
    height: "100%",
    borderRadius: 3,
    
  },
})

export default OrderStatusTabs