import { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, SafeAreaView, Alert } from "react-native";
import {
  Text,
  Appbar,
  Card,
  IconButton,
  FAB,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { PaymentMethod } from "../types/PaymentMethod";
import { ClientStackParamList } from "../navigation/types";

type NavigationProps = NavigationProp<ClientStackParamList>;

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuth();
  const theme = useTheme();

  // Fonction pour supprimer une méthode de paiement
  const deletePaymentMethod = async (methodId: string) => {
    try {
      await deleteDoc(doc(db, "paymentMethods", methodId));
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
    } catch (error) {
      console.error("Erreur lors de la suppression de la méthode de paiement:", error);
      Alert.alert("Erreur", "Impossible de supprimer la méthode de paiement");
    }
  };

  // Fonction pour gérer la confirmation de suppression
  const handleDeleteConfirmation = (method: PaymentMethod) => {
    Alert.alert(
      "Supprimer la méthode de paiement",
      "Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          onPress: () => deletePaymentMethod(method.id),
          style: "destructive"
        }
      ]
    );
  };

  // Fonction pour récupérer les méthodes de paiement depuis Firestore
  const fetchPaymentMethods = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "paymentMethods"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const methods: PaymentMethod[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        methods.push({
          id: doc.id,
          type: data.type,
          name: data.name,
          isDefault: data.isDefault,
          userId: data.userId,
          phoneNumber: data.phoneNumber,
          provider: data.provider,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
      });

      setPaymentMethods(methods);
    } catch (error) {
      console.error("Erreur lors de la récupération des méthodes de paiement:", error);
      Alert.alert("Erreur", "Impossible de charger les méthodes de paiement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  const renderItem = ({ item }: { item: PaymentMethod }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text variant="titleMedium">{item.name}</Text>
            <Text variant="bodyMedium">
              {item.type === "mobile_money" ? "Mobile Money" : "Carte bancaire"}
            </Text>
            {item.type === "mobile_money" && (
              <Text variant="bodyMedium">
                {item.provider === "orange" ? "Orange Money" : "Moov Money"} - {item.phoneNumber}
              </Text>
            )}
          </View>
          <View style={styles.cardActions}>
            <IconButton
              icon="pencil"
              onPress={() => navigation.navigate("EditPaymentMethod", { paymentMethod: item })}
            />
            <IconButton
              icon="delete"
              onPress={() => handleDeleteConfirmation(item)}
            />
          </View>
        </View>
        {item.isDefault && (
          <Text variant="bodySmall" style={styles.defaultText}>
            Méthode de paiement par défaut
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Méthodes de paiement" />
      </Appbar.Header>

      <View style={styles.content}>
        <FlatList
          data={paymentMethods}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text>Aucune méthode de paiement enregistrée</Text>
            </View>
          }
        />

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate("AddPaymentMethod")}
          label="Ajouter"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  defaultText: {
    backgroundColor: "#4CAF50",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default PaymentMethods;