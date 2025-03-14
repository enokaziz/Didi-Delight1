import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Portal,
  Dialog,
  List,
  Divider,
  IconButton,
  useTheme,
  ActivityIndicator,
  Menu,
  TextInput,
  SegmentedButtons,
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp, NavigationProp } from '@react-navigation/native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event } from '../../types/event';
import { eventService } from '../../services/events/eventService';
import { useAuth } from '../../contexts/AuthContext';
import { mobileMoneyProcessor } from '../../services/payment/mobileMoneyProcessor';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

type RootStackParamList = {
  EventDetails: { eventId: string };
  EditEvent: { eventId: string };
  Chat: { eventId: string };
};

type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;
type NavigationProps = NavigationProp<RootStackParamList>;

const EventDetailsScreen = () => {
  const route = useRoute<EventDetailsRouteProp>();
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuth();
  const theme = useTheme();
  const eventId = route.params?.eventId;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'orange' | 'moov'>('orange');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    if (!eventId) return;
    try {
      const eventRef = doc(db, "events", eventId);
      const eventDoc = await getDoc(eventRef);
      if (eventDoc.exists()) {
        const data = eventDoc.data();
        setEvent({
          id: eventDoc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      Alert.alert("Erreur", "Impossible de charger les détails de l'événement");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Event['status']) => {
    if (!event) return;

    try {
      await eventService.updateEvent(event.id, { status: newStatus });
      setEvent({ ...event, status: newStatus });
      Alert.alert('Succès', 'Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
    setStatusMenuVisible(false);
  };

  const handlePayDeposit = async () => {
    if (!event || !user) return;
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      Alert.alert("Erreur", "Veuillez entrer un numéro de téléphone valide (10 chiffres).");
      return;
    }

    try {
      const deposit = eventService.calculateEventDeposit(event.totalAmount);
      const result = await mobileMoneyProcessor.initiatePayment(
        event.id,
        deposit,
        phoneNumber,
        paymentProvider
      );

      if (result.success) {
        await eventService.updateEvent(event.id, { depositPaid: true });
        setEvent({ ...event, depositPaid: true });
        Alert.alert('Succès', 'Paiement de l\'acompte effectué avec succès');
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors du paiement');
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      Alert.alert('Erreur', 'Impossible de traiter le paiement');
    }
    setShowPaymentDialog(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text>Événement non trouvé</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Retour
        </Button>
      </View>
    );
  }

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'pending':
        return '#FFA000';
      case 'confirmed':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerTop}>
            <View>
              <Text variant="headlineSmall">{event.title}</Text>
              <Text variant="bodyMedium" style={styles.date}>
                {format(event.date, 'PPP', { locale: fr })}
              </Text>
            </View>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Chip
                  onPress={() => setStatusMenuVisible(true)}
                  style={[styles.statusChip, { backgroundColor: getStatusColor(event.status) }]}
                >
                  {eventService.getEventTypeLabel(event.type)}
                </Chip>
              }
            >
              <Menu.Item
                onPress={() => handleStatusChange('pending')}
                title="En attente"
              />
              <Menu.Item
                onPress={() => handleStatusChange('confirmed')}
                title="Confirmé"
              />
              <Menu.Item
                onPress={() => handleStatusChange('in_progress')}
                title="En cours"
              />
              <Menu.Item
                onPress={() => handleStatusChange('completed')}
                title="Terminé"
              />
              <Menu.Item
                onPress={() => handleStatusChange('cancelled')}
                title="Annulé"
              />
            </Menu>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoSection}>
            <Text variant="titleMedium">Informations générales</Text>
            <List.Item
              title="Type d'événement"
              description={eventService.getEventTypeLabel(event.type)}
              left={props => <List.Icon {...props} icon="calendar" />}
            />
            <List.Item
              title="Lieu"
              description={event.location}
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
            <List.Item
              title="Nombre d'invités"
              description={`${event.expectedGuests} personnes`}
              left={props => <List.Icon {...props} icon="account-group" />}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoSection}>
            <Text variant="titleMedium">Contact</Text>
            <List.Item
              title="Téléphone"
              description={event.contactPhone}
              left={props => <List.Icon {...props} icon="phone" />}
            />
            {event.contactEmail && (
              <List.Item
                title="Email"
                description={event.contactEmail}
                left={props => <List.Icon {...props} icon="email" />}
              />
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoSection}>
            <Text variant="titleMedium">Produits commandés</Text>
            {event.products.map((product, index) => (
              <List.Item
                key={`${product.productId}-${index}`}
                title={`Produit ${product.productId}`}
                description={`Quantité: ${product.quantity}${
                  product.specialInstructions
                    ? `\nInstructions: ${product.specialInstructions}`
                    : ''
                }`}
                left={props => <List.Icon {...props} icon="cake" />}
              />
            ))}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.paymentSection}>
            <Text variant="titleMedium">Paiement</Text>
            <Text variant="bodyLarge" style={styles.amount}>
              {event.totalAmount.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'XOF',
              })}
            </Text>
            <Text variant="bodyMedium" style={styles.deposit}>
              Acompte requis:{' '}
              {eventService
                .calculateEventDeposit(event.totalAmount)
                .toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                })}
            </Text>
            {!event.depositPaid && (
              <Button
                mode="contained"
                onPress={() => setShowPaymentDialog(true)}
                style={styles.payButton}
              >
                Payer l'acompte
              </Button>
            )}
          </View>

          {event.specialRequirements && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoSection}>
                <Text variant="titleMedium">Exigences spéciales</Text>
                <Text variant="bodyMedium">{event.specialRequirements}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditEvent', { eventId: event.id })}
          style={styles.actionButton}
        >
          Modifier l'événement
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Chat', { eventId: event.id })}
          style={styles.actionButton}
        >
          Contacter le service client
        </Button>
      </View>

      <Portal>
        <Dialog visible={showPaymentDialog} onDismiss={() => setShowPaymentDialog(false)}>
          <Dialog.Title>Payer l'acompte</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Numéro de téléphone"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.dialogInput}
            />
            <SegmentedButtons
              value={paymentProvider}
              onValueChange={value => setPaymentProvider(value as 'orange' | 'moov')}
              buttons={[
                { value: 'orange', label: 'Orange Money' },
                { value: 'moov', label: 'Moov Money' },
              ]}
              style={styles.segmentedButtons}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPaymentDialog(false)}>Annuler</Button>
            <Button onPress={handlePayDeposit}>Payer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  headerCard: {
    margin: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  date: {
    color: '#666',
    marginTop: 4,
  },
  statusChip: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    gap: 8,
  },
  paymentSection: {
    alignItems: 'center',
    padding: 16,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
  },
  deposit: {
    color: '#666',
    marginTop: 4,
  },
  payButton: {
    marginTop: 16,
  },
  actions: {
    padding: 16,
    gap: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  dialogInput: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
});

export default EventDetailsScreen;
