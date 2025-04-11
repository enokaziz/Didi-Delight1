// Dans src/screens/admin/EventManagementScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  Text,
  DataTable,
  Searchbar,
  Button,
  Chip,
  useTheme,
  Modal,
  Portal,
  Card,
  Dialog,
  TextInput,
  IconButton,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { eventService } from "../../services/events/eventService";
import { Event, EventStatus, EventType } from "../../types/event";
import { useAuth } from "../../contexts/AuthContext";

const EventManagementScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { user } = useAuth();
  
  // États pour le filtrage
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | "all">(
    "all"
  );
  
  // États pour le modal de détail
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // États pour le rejet
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  // États pour les conflits de dates
  const [conflictDialogVisible, setConflictDialogVisible] = useState(false);
  const [conflictingEvents, setConflictingEvents] = useState<Event[]>([]);
  const [eventToApprove, setEventToApprove] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);
  
  // Effet pour le filtrage
  useEffect(() => {
    if (events.length > 0) {
      filterEvents();
    }
  }, [events, searchQuery, selectedType, selectedStatus]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const events = await eventService.getAllEvents();
      setEvents(events);
      setFilteredEvents(events);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction de filtrage
  const filterEvents = () => {
    let filtered = [...events];
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }
    
    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }
    
    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }
    
    setFilteredEvents(filtered);
  };

  const handleApprove = async (eventId: string) => {
    try {
      // Récupérer l'événement complet
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      
      // Vérifier les conflits de dates
      const isAvailable = await eventService.checkDateAvailability(
        event.date, 
        event.location
      );
      
      if (!isAvailable) {
        // Récupérer les événements en conflit
        const conflicts = await eventService.getConflictingEvents(
          event.date,
          event.location
        );
        
        // Afficher le dialog de conflit
        setEventToApprove(event);
        setConflictingEvents(conflicts);
        setConflictDialogVisible(true);
        return;
      }
      
      // Si pas de conflit, approuver l'événement
      await eventService.updateEventStatus(eventId, "confirmed", user?.uid);
      loadEvents(); // Rafraîchir la liste
    } catch (error) {
      console.error("Échec approbation:", error);
    }
  };
  
  // Fonction pour forcer l'approbation malgré les conflits
  const handleForceApprove = async () => {
    if (!eventToApprove) return;
    
    try {
      await eventService.updateEventStatus(
        eventToApprove.id, 
        "confirmed", 
        user?.uid, 
        "Approbation forcée malgré conflits"
      );
      
      // Ajouter une note admin pour indiquer le conflit
      const conflictDetails = conflictingEvents
        .map(e => `${e.title} (${format(e.date, 'dd/MM/yyyy')})`)
        .join(", ");
      
      await eventService.addAdminNotes(
        eventToApprove.id, 
        `ATTENTION: Approuvé malgré conflits avec: ${conflictDetails}`, 
        true
      );
      
      setConflictDialogVisible(false);
      setEventToApprove(null);
      setConflictingEvents([]);
      loadEvents();
    } catch (error) {
      console.error("Échec approbation forcée:", error);
    }
  };
  
  const handleReject = async () => {
    if (!selectedEvent) return;
    
    try {
      await eventService.updateEventStatus(selectedEvent.id, "cancelled");
      // Ajouter une note admin avec la raison du rejet
      await eventService.addAdminNotes(selectedEvent.id, `Rejeté: ${rejectReason}`);
      setRejectDialogVisible(false);
      setRejectReason("");
      loadEvents();
    } catch (error) {
      console.error("Échec rejet:", error);
    }
  };
  
  // Composant pour le filtrage
  const FilterBar = () => (
    <View style={styles.filterContainer}>
      <Searchbar
        placeholder="Rechercher..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedType}
          onValueChange={(value) => setSelectedType(value as EventType | "all")}
          style={styles.picker}
        >
          <Picker.Item label="Tous types" value="all" />
          <Picker.Item label="Mariage" value="wedding" />
          <Picker.Item label="Anniversaire" value="birthday" />
          <Picker.Item label="Cérémonie" value="ceremony" />
          <Picker.Item label="Autre" value="other" />
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as EventStatus | "all")}
          style={styles.picker}
        >
          <Picker.Item label="Tous statuts" value="all" />
          <Picker.Item label="En attente" value="pending" />
          <Picker.Item label="Confirmé" value="confirmed" />
          <Picker.Item label="En cours" value="in_progress" />
          <Picker.Item label="Terminé" value="completed" />
          <Picker.Item label="Annulé" value="cancelled" />
        </Picker>
      </View>
    </View>
  );
  
  // Composant pour le modal de détail
  const EventDetailModal = () => (
    <Portal>
      <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.modalCard}>
          <Card.Title 
            title={selectedEvent?.title} 
            subtitle={`Type: ${eventService.getEventTypeLabel(selectedEvent?.type || 'other')}`}
            right={(props) => (
              <IconButton
                {...props}
                icon="close"
                onPress={() => setModalVisible(false)}
              />
            )}
          />
          <Card.Content>
            <Text variant="bodyLarge" style={styles.detailLabel}>Date:</Text>
            <Text variant="bodyMedium" style={styles.detailValue}>
              {selectedEvent?.date ? format(selectedEvent.date, 'PPP', {locale: fr}) : ''}
            </Text>
            
            <Text variant="bodyLarge" style={styles.detailLabel}>Lieu:</Text>
            <Text variant="bodyMedium" style={styles.detailValue}>{selectedEvent?.location}</Text>
            
            <Text variant="bodyLarge" style={styles.detailLabel}>Nombre d'invités:</Text>
            <Text variant="bodyMedium" style={styles.detailValue}>{selectedEvent?.expectedGuests}</Text>
            
            <Text variant="bodyLarge" style={styles.detailLabel}>Statut:</Text>
            <Chip icon={getStatusIcon(selectedEvent?.status)} style={styles.statusChip}>
              {selectedEvent?.status}
            </Chip>
            
            <Text variant="bodyLarge" style={styles.detailLabel}>Description:</Text>
            <Text variant="bodyMedium" style={styles.detailValue}>{selectedEvent?.description}</Text>
            
            {selectedEvent?.specialRequirements && (
              <>
                <Text variant="bodyLarge" style={styles.detailLabel}>Exigences spéciales:</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>{selectedEvent.specialRequirements}</Text>
              </>
            )}
            
            {selectedEvent?.adminNotes && (
              <>
                <Text variant="bodyLarge" style={styles.detailLabel}>Notes admin:</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>{selectedEvent.adminNotes}</Text>
              </>
            )}
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            {selectedEvent?.status === 'pending' && (
              <>
                <Button 
                  mode="contained" 
                  onPress={() => handleApprove(selectedEvent.id)}
                  style={styles.approveButton}
                >
                  Approuver
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => {
                    setRejectDialogVisible(true);
                    setModalVisible(false);
                  }}
                  buttonColor={theme.colors.error}
                >
                  Rejeter
                </Button>
              </>
            )}
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
  
  // Composant pour le dialog de rejet
  const RejectDialog = () => (
    <Portal>
      <Dialog visible={rejectDialogVisible} onDismiss={() => setRejectDialogVisible(false)}>
        <Dialog.Title>Motif du rejet</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Raison du rejet"
            value={rejectReason}
            onChangeText={setRejectReason}
            multiline
            numberOfLines={3}
            style={styles.rejectInput}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setRejectDialogVisible(false)}>Annuler</Button>
          <Button onPress={handleReject} textColor={theme.colors.error}>Confirmer</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
  
  // Composant pour le dialog de conflit de dates
  const ConflictDialog = () => (
    <Portal>
      <Dialog 
        visible={conflictDialogVisible} 
        onDismiss={() => setConflictDialogVisible(false)}
        style={styles.conflictDialog}
      >
        <Dialog.Title>Conflit de dates détecté</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.conflictText}>
            L'événement <Text style={styles.boldText}>{eventToApprove?.title}</Text> est en conflit 
            avec {conflictingEvents.length} autre(s) événement(s) déjà confirmé(s) à cette date et ce lieu.
          </Text>
          
          <Text style={styles.conflictSubtitle}>Conflits avec :</Text>
          
          {conflictingEvents.map((event, index) => (
            <Card key={event.id} style={styles.conflictCard}>
              <Card.Content>
                <Text style={styles.conflictEventTitle}>{event.title}</Text>
                <Text>Date: {format(event.date, 'PPP', {locale: fr})}</Text>
                <Text>Lieu: {event.location}</Text>
                <Text>Statut: {event.status}</Text>
              </Card.Content>
            </Card>
          ))}
          
          <Text style={[styles.warningText, {marginTop: 16}]}>
            Voulez-vous tout de même approuver cet événement malgré les conflits ?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setConflictDialogVisible(false)}>Annuler</Button>
          <Button 
            onPress={handleForceApprove} 
            buttonColor={theme.colors.error}
          >
            Forcer l'approbation
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
  
  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'confirmed': return 'check-circle';
      case 'in_progress': return 'progress-clock';
      case 'completed': return 'check-all';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Gestion des Événements
      </Text>
      
      <FilterBar />

      <ScrollView style={styles.tableContainer}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Client</DataTable.Title>
            <DataTable.Title>Type</DataTable.Title>
            <DataTable.Title>Date</DataTable.Title>
            <DataTable.Title>Statut</DataTable.Title>
            <DataTable.Title>Actions</DataTable.Title>
          </DataTable.Header>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des événements...</Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text>Aucun événement trouvé</Text>
            </View>
          ) : (
            filteredEvents.map((event) => (
              <TouchableOpacity key={event.id} onPress={() => {
                setSelectedEvent(event);
                setModalVisible(true);
              }}>
                <DataTable.Row>
                  <DataTable.Cell>{event.userId}</DataTable.Cell>
                  <DataTable.Cell>{eventService.getEventTypeLabel(event.type)}</DataTable.Cell>
                  <DataTable.Cell>{format(event.date, 'dd/MM/yyyy')}</DataTable.Cell>
                  <DataTable.Cell>
                    <Chip icon={getStatusIcon(event.status)} style={styles.statusChip}>
                      {event.status}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Button
                      mode="contained"
                      onPress={(e) => {
                        e.stopPropagation();
                        handleApprove(event.id);
                      }}
                      disabled={event.status !== "pending"}
                      style={styles.actionButton}
                    >
                      Valider
                    </Button>
                  </DataTable.Cell>
                </DataTable.Row>
              </TouchableOpacity>
            ))
          )}
        </DataTable>
      </ScrollView>
      
      {/* Modals et Dialogs */}
      <EventDetailModal />
      <RejectDialog />
      <ConflictDialog />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 10,
  },
  searchBar: {
    flex: 2,
    height: 50,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  tableContainer: {
    flex: 1,
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  actionButton: {
    marginVertical: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  modalContainer: {
    padding: 20,
  },
  modalCard: {
    padding: 8,
  },
  detailLabel: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  detailValue: {
    marginBottom: 8,
  },
  cardActions: {
    justifyContent: "flex-end",
    marginTop: 16,
  },
  approveButton: {
    marginRight: 8,
  },
  rejectInput: {
    marginTop: 8,
  },
  conflictDialog: {
    maxHeight: '80%',
  },
  conflictText: {
    marginBottom: 16,
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
  },
  conflictSubtitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  conflictCard: {
    marginBottom: 8,
  },
  conflictEventTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  warningText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default EventManagementScreen;
