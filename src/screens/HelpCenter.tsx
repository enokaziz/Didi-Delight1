"use client";

import React, { useState, useEffect, useCallback } from "react"; // Ajout de l'importation de React
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking } from "react-native";
import { Text, Appbar, List, Searchbar, Card, Button, Divider, useTheme, ActivityIndicator } from "react-native-paper";
import { useNavigation, NavigationProp } from "@react-navigation/native"; // Changement ici
import { StackNavigationProp } from "@react-navigation/stack"; // Import depuis stack
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ClientStackParamList } from "../navigation/types"; // Assurez-vous que ce chemin est correct

// Types pour les FAQ
type FAQCategory = "commandes" | "paiements" | "livraison" | "produits" | "compte" | "autre";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
};

// Typage strict pour les icônes MaterialIcons
type MaterialIconName =
  | "shopping-bag"
  | "credit-card"
  | "local-shipping"
  | "inventory"
  | "person"
  | "help"
  | "keyboard-arrow-up"
  | "keyboard-arrow-down";

const FAQItem = React.memo(
  ({
    faq,
    isExpanded,
    toggleExpanded,
    getCategoryInfo,
  }: {
    faq: FAQ;
    isExpanded: boolean;
    toggleExpanded: (id: string) => void;
    getCategoryInfo: (category: FAQCategory) => { icon: MaterialIconName; color: string; label: string };
  }) => {
    const { icon, color } = getCategoryInfo(faq.category);

    return (
      <Card style={[styles.faqCard, isExpanded && { borderLeftColor: color, borderLeftWidth: 4 }]}>
        <TouchableOpacity onPress={() => toggleExpanded(faq.id)} style={styles.faqQuestion}>
          <MaterialIcons name={icon} size={24} color={color} style={styles.faqIcon} />
          <Text style={styles.questionText}>{faq.question}</Text>
          <MaterialIcons
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color="#757575"
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Divider />
            <Text style={styles.answerText}>{faq.answer}</Text>
            <Text style={styles.helpfulText}>Cette réponse vous a-t-elle été utile ?</Text>
            <View style={styles.feedbackButtons}>
              <Button mode="outlined" icon="thumb-up" style={styles.feedbackButton}>
                Oui
              </Button>
              <Button mode="outlined" icon="thumb-down" style={styles.feedbackButton}>
                Non
              </Button>
            </View>
          </View>
        )}
      </Card>
    );
  }
);

const HelpCenter = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqs, setExpandedFaqs] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null);

  const navigation = useNavigation<StackNavigationProp<ClientStackParamList>>();
  const theme = useTheme();

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const faqsRef = collection(db, "faqs");
      const q = query(faqsRef, orderBy("category"), orderBy("question"));
      const querySnapshot = await getDocs(q);
      const faqsList: FAQ[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        question: doc.data().question,
        answer: doc.data().answer,
        category: doc.data().category,
      }));
      setFaqs(faqsList);
      setFilteredFaqs(faqsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des FAQs:", error);
      setError("Impossible de charger les FAQs. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  useEffect(() => {
    let filtered = faqs;
    if (selectedCategory) {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) => faq.question.toLowerCase().includes(queryLower) || faq.answer.toLowerCase().includes(queryLower)
      );
    }
    setFilteredFaqs(filtered);
  }, [searchQuery, selectedCategory, faqs]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedFaqs((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const getCategoryInfo = useCallback((category: FAQCategory) => {
    switch (category) {
      case "commandes":
        return { icon: "shopping-bag" as const, color: "#2196F3", label: "Commandes" };
      case "paiements":
        return { icon: "credit-card" as const, color: "#4CAF50", label: "Paiements" };
      case "livraison":
        return { icon: "local-shipping" as const, color: "#FF9800", label: "Livraison" };
      case "produits":
        return { icon: "inventory" as const, color: "#9C27B0", label: "Produits" };
      case "compte":
        return { icon: "person" as const, color: "#F44336", label: "Compte" };
      case "autre":
        return { icon: "help" as const, color: "#607D8B", label: "Autre" };
      default:
        return { icon: "help" as const, color: "#607D8B", label: "Autre" };
    }
  }, []);

  const contactSupport = useCallback(() => {
    Linking.openURL("mailto:support@didi-delight.com?subject=Demande%20d%27assistance");
  }, []);

  const openChat = useCallback(() => {
    try {
        navigation.navigate('Chat', {
            orderId: undefined
        });
    } catch (error) {
        console.error('Erreur de navigation:', error);
        // Gérer l'erreur si nécessaire
    }
}, [navigation]);

  const renderCategoryChips = useCallback(() => {
    const categories: FAQCategory[] = ["commandes", "paiements", "livraison", "produits", "compte", "autre"];
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.selectedCategoryChip]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryChipText, !selectedCategory && styles.selectedCategoryChipText]}>Tous</Text>
        </TouchableOpacity>
        {categories.map((category) => {
          const { label, color } = getCategoryInfo(category);
          const isSelected = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, isSelected && styles.selectedCategoryChip, isSelected && { backgroundColor: color }]}
              onPress={() => setSelectedCategory(isSelected ? null : category)}
            >
              <Text style={[styles.categoryChipText, isSelected && styles.selectedCategoryChipText]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }, [selectedCategory, getCategoryInfo]);

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Centre d'aide" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.supportCard}>
          <Card.Content>
            <Text style={styles.supportTitle}>Comment pouvons-nous vous aider ?</Text>
            <Text style={styles.supportText}>
              Trouvez des réponses à vos questions ou contactez notre équipe de support.
            </Text>
            <View style={styles.supportActions}>
              <Button mode="contained" icon="email" onPress={contactSupport} style={[styles.supportButton, { backgroundColor: "#4CAF50" }]}>
                Email
              </Button>
              <Button mode="contained" icon="chat" onPress={openChat} style={[styles.supportButton, { backgroundColor: "#2196F3" }]}>
                Chat
              </Button>
              <Button
                mode="contained"
                icon="phone"
                onPress={() => Linking.openURL("tel:+226 07 50 51 31")}
                style={[styles.supportButton, { backgroundColor: "#FF9800" }]}
              >
                Appel
              </Button>
            </View>
          </Card.Content>
        </Card>
        <Searchbar
          placeholder="Rechercher dans les questions fréquentes"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        {renderCategoryChips()}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Chargement des questions fréquentes...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#FF4952" />
            <Text style={styles.emptyTitle}>Erreur</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <Button mode="contained" onPress={fetchFaqs} style={styles.resetButton}>
              Réessayer
            </Button>
          </View>
        ) : filteredFaqs.length > 0 ? (
          <List.Section>
            <List.Subheader style={styles.faqHeader}>Questions fréquentes ({filteredFaqs.length})</List.Subheader>
            {filteredFaqs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isExpanded={expandedFaqs.includes(faq.id)}
                toggleExpanded={toggleExpanded}
                getCategoryInfo={getCategoryInfo}
              />
            ))}
          </List.Section>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Aucun résultat trouvé</Text>
            <Text style={styles.emptyText}>
              Nous n'avons pas trouvé de réponse correspondant à "{searchQuery}".
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
              style={styles.resetButton}
            >
              Réinitialiser la recherche
            </Button>
            <Button mode="outlined" onPress={contactSupport} style={styles.contactButton}>
              Contacter le support
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContent: { padding: 16, paddingBottom: 32 },
  supportCard: { marginBottom: 16, backgroundColor: "#fff" },
  supportTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  supportText: { fontSize: 14, color: "#757575", marginBottom: 16 },
  supportActions: { flexDirection: "row", justifyContent: "space-between" },
  supportButton: { flex: 1, marginHorizontal: 4 },
  searchBar: { marginBottom: 16, elevation: 2 },
  categoriesContainer: { flexDirection: "row", paddingBottom: 8, marginBottom: 16 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: "#e0e0e0" },
  selectedCategoryChip: { backgroundColor: "#FF4952" },
  categoryChipText: { color: "#333", fontWeight: "500" },
  selectedCategoryChipText: { color: "white" },
  faqHeader: { fontSize: 18, fontWeight: "bold", color: "#333" },
  faqCard: { marginBottom: 12, overflow: "hidden" },
  faqQuestion: { flexDirection: "row", alignItems: "center", padding: 16 },
  faqIcon: { marginRight: 12 },
  questionText: { flex: 1, fontSize: 16, fontWeight: "500" },
  faqAnswer: { padding: 16, paddingTop: 8, backgroundColor: "#f9f9f9" },
  answerText: { fontSize: 14, lineHeight: 22, color: "#333", marginTop: 8 },
  helpfulText: { fontSize: 14, color: "#757575", marginTop: 16, marginBottom: 8 },
  feedbackButtons: { flexDirection: "row" },
  feedbackButton: { marginRight: 8 },
  loadingContainer: { padding: 32, alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#757575" },
  emptyContainer: { padding: 32, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: "#757575", textAlign: "center", marginBottom: 16 },
  resetButton: { marginBottom: 8, backgroundColor: "#FF4952" },
  contactButton: { marginTop: 8 },
});

export default HelpCenter;