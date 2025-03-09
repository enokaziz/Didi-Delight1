"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, FlatList, SafeAreaView, Alert, Image } from "react-native"
import {
  Text,
  Appbar,
  Card,
  Button,
  IconButton,
  FAB,
  Dialog,
  Portal,
  TextInput,
  RadioButton,
  ActivityIndicator,
  useTheme,
} from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore"
import { db } from "../firebase/firebaseConfig"
import { useAuth } from "../contexts/AuthContext"

// Types pour les méthodes de paiement
type PaymentMethodType = "card" | "mobile_money" | "bank_account"

type PaymentMethod = {
  id: string
  type: PaymentMethodType
  name: string
  isDefault: boolean
  // Pour les cartes
  cardNumber?: string
  expiryDate?: string
  cardHolder?: string
  // Pour Mobile Money
  phoneNumber?: string
  provider?: string
  // Pour les comptes bancaires
  accountNumber?: string
  bankName?: string
}

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null)

  // États pour le formulaire
  const [methodType, setMethodType] = useState<PaymentMethodType>("card")
  const [methodName, setMethodName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [provider, setProvider] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [bankName, setBankName] = useState("")
  const [isDefault, setIsDefault] = useState(false)

  const navigation = useNavigation()
  const { user } = useAuth()
  const theme = useTheme()

  // Fonction pour récupérer les méthodes de paiement depuis Firestore
  const fetchPaymentMethods = async () => {
    if (!user) return

    setLoading(true)
    try {
      const paymentMethodsRef = collection(db, "paymentMethods")
      const q = query(paymentMethodsRef, where("userId", "==", user.uid))

      const querySnapshot = await getDocs(q)
      const methodsList: PaymentMethod[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        methodsList.push({
          id: doc.id,
          type: data.type,
          name: data.name,
          isDefault: data.isDefault,
          cardNumber: data.cardNumber,
          expiryDate: data.expiryDate,
          cardHolder: data.cardHolder,
          phoneNumber: data.phoneNumber,
          provider: data.provider,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
        })
      })

      setPaymentMethods(methodsList)
    } catch (error) {
      console.error("Erreur lors de la récupération des méthodes de paiement:", error)
      Alert.alert("Erreur", "Impossible de charger vos méthodes de paiement.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [user])

  // Réinitialiser le formulaire
  const resetForm = () => {
    setMethodType("card")
    setMethodName("")
    setCardNumber("")
    setExpiryDate("")
    setCardHolder("")
    setPhoneNumber("")
    setProvider("")
    setAccountNumber("")
    setBankName("")
    setIsDefault(false)
    setEditingMethod(null)
  }

  // Ouvrir le dialogue d'ajout/modification
  const openAddDialog = () => {
    resetForm()
    setDialogVisible(true)
  }

  // Ouvrir le dialogue de modification
  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method)
    setMethodType(method.type)
    setMethodName(method.name)
    setCardNumber(method.cardNumber || "")
    setExpiryDate(method.expiryDate || "")
    setCardHolder(method.cardHolder || "")
    setPhoneNumber(method.phoneNumber || "")
    setProvider(method.provider || "")
    setAccountNumber(method.accountNumber || "")
    setBankName(method.bankName || "")
    setIsDefault(method.isDefault)
    setDialogVisible(true)
  }

  // Confirmer la suppression
  const confirmDelete = (id: string) => {
    setMethodToDelete(id)
    setDeleteDialogVisible(true)
  }

  // Supprimer une méthode de paiement
  const deletePaymentMethod = async () => {
    if (!methodToDelete) return

    try {
      await deleteDoc(doc(db, "paymentMethods", methodToDelete))
      setPaymentMethods((methods) => methods.filter((m) => m.id !== methodToDelete))
      Alert.alert("Succès", "Méthode de paiement supprimée avec succès.")
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      Alert.alert("Erreur", "Impossible de supprimer la méthode de paiement.")
    } finally {
      setDeleteDialogVisible(false)
      setMethodToDelete(null)
    }
  }

  // Valider et sauvegarder la méthode de paiement
  const savePaymentMethod = async () => {
    if (!user) return

    // Validation de base
    if (!methodName.trim()) {
      Alert.alert("Erreur", "Veuillez donner un nom à cette méthode de paiement.")
      return
    }

    // Validation spécifique au type
    if (methodType === "card") {
      if (!cardNumber.trim() || !expiryDate.trim() || !cardHolder.trim()) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs pour la carte.")
        return
      }
    } else if (methodType === "mobile_money") {
      if (!phoneNumber.trim() || !provider.trim()) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs pour Mobile Money.")
        return
      }
    } else if (methodType === "bank_account") {
      if (!accountNumber.trim() || !bankName.trim()) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs pour le compte bancaire.")
        return
      }
    }

    try {
      const methodData = {
        userId: user.uid,
        type: methodType,
        name: methodName,
        isDefault,
        ...(methodType === "card" && {
          cardNumber,
          expiryDate,
          cardHolder,
        }),
        ...(methodType === "mobile_money" && {
          phoneNumber,
          provider,
        }),
        ...(methodType === "bank_account" && {
          accountNumber,
          bankName,
        }),
      }

      // Si c'est la méthode par défaut, mettre à jour les autres méthodes
      if (isDefault) {
        const defaultMethods = paymentMethods.filter(
          (m) => m.isDefault && (!editingMethod || m.id !== editingMethod.id),
        )
        for (const method of defaultMethods) {
          await updateDoc(doc(db, "paymentMethods", method.id), {
            isDefault: false,
          })
        }
      }

      if (editingMethod) {
        // Mise à jour
        await updateDoc(doc(db, "paymentMethods", editingMethod.id), methodData)
        setPaymentMethods((methods) =>
          methods.map((m) => (m.id === editingMethod.id ? ({ ...methodData, id: m.id } as PaymentMethod) : m)),
        )
        Alert.alert("Succès", "Méthode de paiement mise à jour avec succès.")
      } else {
        // Ajout
        const docRef = await addDoc(collection(db, "paymentMethods"), methodData)
        setPaymentMethods((methods) => [...methods, { ...methodData, id: docRef.id } as PaymentMethod])
        Alert.alert("Succès", "Méthode de paiement ajoutée avec succès.")
      }

      setDialogVisible(false)
      resetForm()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      Alert.alert("Erreur", "Impossible de sauvegarder la méthode de paiement.")
    }
  }

  // Définir une méthode comme par défaut
  const setDefaultMethod = async (id: string) => {
    try {
      // Mettre à jour la méthode sélectionnée
      await updateDoc(doc(db, "paymentMethods", id), {
        isDefault: true,
      })

      // Mettre à jour les autres méthodes
      const otherMethods = paymentMethods.filter((m) => m.id !== id && m.isDefault)
      for (const method of otherMethods) {
        await updateDoc(doc(db, "paymentMethods", method.id), {
          isDefault: false,
        })
      }

      // Mettre à jour l'état local
      setPaymentMethods((methods) =>
        methods.map((m) => ({
          ...m,
          isDefault: m.id === id,
        })),
      )

      Alert.alert("Succès", "Méthode de paiement par défaut mise à jour.")
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
      Alert.alert("Erreur", "Impossible de mettre à jour la méthode par défaut.")
    }
  }

  // Obtenir l'icône en fonction du type de méthode
  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case "card":
        return "credit-card"
      case "mobile_money":
        return "cellphone"
      case "bank_account":
        return "bank"
      default:
        return "credit-card"
    }
  }

  // Obtenir le texte masqué pour les numéros
  const getMaskedNumber = (number: string | undefined, type: PaymentMethodType) => {
    if (!number) return ""

    if (type === "card") {
      return `**** **** **** ${number.slice(-4)}`
    } else if (type === "mobile_money") {
      return `**** ** ${number.slice(-2)}`
    } else {
      return `**** ${number.slice(-4)}`
    }
  }

  // Rendu d'une méthode de paiement
  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <Card style={styles.methodCard}>
      <Card.Content>
        <View style={styles.methodHeader}>
          <View style={styles.methodIconContainer}>
            <IconButton
              icon={getMethodIcon(item.type)}
              size={24}
              iconColor="#fff"
              style={[
                styles.methodIcon,
                {
                  backgroundColor:
                    item.type === "card" ? "#2196F3" : item.type === "mobile_money" ? "#4CAF50" : "#FF9800",
                },
              ]}
            />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>{item.name}</Text>
            {item.type === "card" && (
              <Text style={styles.methodDetails}>
                {getMaskedNumber(item.cardNumber, item.type)} • Exp: {item.expiryDate}
              </Text>
            )}
            {item.type === "mobile_money" && (
              <Text style={styles.methodDetails}>
                {item.provider} • {getMaskedNumber(item.phoneNumber, item.type)}
              </Text>
            )}
            {item.type === "bank_account" && (
              <Text style={styles.methodDetails}>
                {item.bankName} • {getMaskedNumber(item.accountNumber, item.type)}
              </Text>
            )}
          </View>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Par défaut</Text>
            </View>
          )}
        </View>

        <View style={styles.methodActions}>
          {!item.isDefault && (
            <Button mode="text" onPress={() => setDefaultMethod(item.id)} style={styles.actionButton}>
              Définir par défaut
            </Button>
          )}
          <Button mode="text" onPress={() => openEditDialog(item)} style={styles.actionButton}>
            Modifier
          </Button>
          <Button mode="text" textColor="#F44336" onPress={() => confirmDelete(item.id)} style={styles.actionButton}>
            Supprimer
          </Button>
        </View>
      </Card.Content>
    </Card>
  )

  // Rendu de l'état vide
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require("../assets/icons/splash-icon.png")}
        style={styles.emptyImage}
        defaultSource={require("../assets/icons/splash-icon.png")}
      />
      <Text style={styles.emptyTitle}>Aucune méthode de paiement</Text>
      <Text style={styles.emptyText}>Ajoutez une méthode de paiement pour faciliter vos achats.</Text>
      <Button mode="contained" icon="plus" onPress={openAddDialog} style={styles.addButton}>
        Ajouter une méthode de paiement
      </Button>
    </View>
  )

  // Rendu du formulaire en fonction du type de méthode
  const renderFormFields = () => {
    switch (methodType) {
      case "card":
        return (
          <>
            <TextInput
              label="Numéro de carte"
              value={cardNumber}
              onChangeText={setCardNumber}
              style={styles.input}
              keyboardType="number-pad"
              maxLength={16}
            />
            <TextInput
              label="Date d'expiration (MM/AA)"
              value={expiryDate}
              onChangeText={setExpiryDate}
              style={styles.input}
              maxLength={5}
            />
            <TextInput
              label="Titulaire de la carte"
              value={cardHolder}
              onChangeText={setCardHolder}
              style={styles.input}
            />
          </>
        )
      case "mobile_money":
        return (
          <>
            <TextInput
              label="Numéro de téléphone"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TextInput
              label="Fournisseur (Orange Money, MTN, etc.)"
              value={provider}
              onChangeText={setProvider}
              style={styles.input}
            />
          </>
        )
      case "bank_account":
        return (
          <>
            <TextInput
              label="Numéro de compte"
              value={accountNumber}
              onChangeText={setAccountNumber}
              style={styles.input}
            />
            <TextInput label="Nom de la banque" value={bankName} onChangeText={setBankName} style={styles.input} />
          </>
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Méthodes de paiement" />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement des méthodes de paiement...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={paymentMethods}
            renderItem={renderPaymentMethod}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyComponent}
          />

          <FAB icon="plus" style={styles.fab} onPress={openAddDialog} color="#fff" />
        </>
      )}

      {/* Dialogue d'ajout/modification */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>
            {editingMethod ? "Modifier la méthode de paiement" : "Ajouter une méthode de paiement"}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nom (ex: Ma carte personnelle)"
              value={methodName}
              onChangeText={setMethodName}
              style={styles.input}
            />

            <Text style={styles.radioLabel}>Type de méthode</Text>
            <RadioButton.Group onValueChange={(value) => setMethodType(value as PaymentMethodType)} value={methodType}>
              <View style={styles.radioOption}>
                <RadioButton value="card" />
                <Text>Carte bancaire</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="mobile_money" />
                <Text>Mobile Money</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="bank_account" />
                <Text>Compte bancaire</Text>
              </View>
            </RadioButton.Group>

            {renderFormFields()}

            <View style={styles.defaultOption}>
              <RadioButton status={isDefault ? "checked" : "unchecked"} onPress={() => setIsDefault(!isDefault)} value={""} />
              <Text>Définir comme méthode par défaut</Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Annuler</Button>
            <Button onPress={savePaymentMethod}>Enregistrer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Dialogue de confirmation de suppression */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Confirmer la suppression</Dialog.Title>
          <Dialog.Content>
            <Text>Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Annuler</Button>
            <Button onPress={deletePaymentMethod} textColor="#F44336">
              Supprimer
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Espace pour le FAB
  },
  methodCard: {
    marginBottom: 16,
    elevation: 2,
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  methodIconContainer: {
    marginRight: 12,
  },
  methodIcon: {
    backgroundColor: "#2196F3",
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  methodDetails: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
  },
  defaultBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  methodActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  actionButton: {
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#FF4952",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#757575",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    minHeight: 400,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#FF4952",
  },
  input: {
    marginBottom: 16,
  },
  radioLabel: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  defaultOption: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
})

export default PaymentMethods