import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import {
  Text,
  FAB,
  Card,
  Chip,
  Searchbar,
  ActivityIndicator,
  useTheme,
  Button,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event } from '../../types/event';
import { eventService } from '../../services/events/eventService';
import { useAuth } from '../../contexts/AuthContext';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import { EventsStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<EventsStackParamList>;

const EventsScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();

  useEffect(() => {
    loadEvents();
  }, [selectedFilter, selectedDate]);

  const loadEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let fetchedEvents: Event[];
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      switch (selectedFilter) {
        case 'upcoming':
          fetchedEvents = await eventService.getUpcomingEvents(user.uid);
          break;
        case 'past':
          fetchedEvents = (await eventService.getUserEvents(user.uid))
            .filter(event => event.date < new Date());
          break;
        default:
          fetchedEvents = await eventService.getEventsByDateRange(
            user.uid,
            startOfDay,
            endOfDay
          );
      }

      if (searchQuery) {
        fetchedEvents = fetchedEvents.filter(event =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusLabel = (status: Event['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmé';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EventDetails' as const, { eventId: item.id })}
    >
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.cardHeader}>
            <View>
              <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
              <Text variant="bodySmall" style={styles.date}>
                {format(item.date, 'PPP', { locale: fr })}
              </Text>
            </View>F
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusText}
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>
          
          <View style={styles.eventInfo}>
            <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
              {item.description}
            </Text>
            <View style={styles.details}>
              <Text variant="bodySmall" style={styles.detailsText}>
                {item.expectedGuests} invités • {eventService.getEventTypeLabel(item.type)}
              </Text>
              <Text variant="titleMedium" style={styles.amount}>
                {item.totalAmount.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                })}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher un événement"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <CalendarStrip
        style={styles.calendar}
        calendarColor={theme.colors.surface}
        dateNumberStyle={{ 
          color: theme.colors.onSurface,
          fontSize: 14,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        }}
        dateNameStyle={{ 
          color: theme.colors.onSurface,
          fontSize: 12,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        }}
        highlightDateNumberStyle={{ 
          color: theme.colors.primary,
          fontSize: 14,
          fontWeight: 'bold',
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        }}
        highlightDateNameStyle={{ 
          color: theme.colors.primary,
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        }}
        daySelectionAnimation={{
          type: 'background',
          duration: 200,
          highlightColor: theme.colors.primaryContainer,
        }}
        onDateSelected={(date: moment.Moment) => setSelectedDate(date.toDate())}
        selectedDate={selectedDate}
        locale={{ name: 'fr', config: { locale: fr } }}
        calendarHeaderStyle={{
          color: theme.colors.onSurface,
          fontSize: 14,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        }}
      />
<View style={styles.filterContainer}>
  <Button
    mode="outlined"
    onPress={() => setFilterVisible(true)}
    icon="filter-variant"
    style={styles.filterButton}
  >
    {selectedFilter === 'all' ? 'Tous' :
     selectedFilter === 'upcoming' ? 'À venir' : 'Passés'}
  </Button>
</View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>Aucun événement trouvé</Text>
              <Button
  mode="contained"
  onPress={() => navigation.navigate('CreateEvent' as const)}
  style={styles.createButton}
>
  Créer un événement
</Button>
            </View>
          )}
        />
      )}

      <Portal>
        <Dialog visible={filterVisible} onDismiss={() => setFilterVisible(false)}>
          <Dialog.Title style={styles.dialogTitle}>Filtrer les événements</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                setSelectedFilter('all');
                setFilterVisible(false);
              }}
            >
              <Text style={styles.filterText}>Tous les événements</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                setSelectedFilter('upcoming');
                setFilterVisible(false);
              }}
            >
              <Text style={styles.filterText}>Événements à venir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                setSelectedFilter('past');
                setFilterVisible(false);
              }}
            >
              <Text style={styles.filterText}>Événements passés</Text>
            </TouchableOpacity>
          </Dialog.Content>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent' as const)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  calendar: {
    height: 100,
    marginBottom: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  eventInfo: {
    marginTop: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  amount: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  filterButton: {
    marginLeft: 8,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dialogContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  filterOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterText: {
    fontSize: 16,
  },
  title: {
    fontSize: 18,
  },
  description: {
    fontSize: 14,
  },
  detailsText: {
    fontSize: 14,
  },
  flatListContent: {
    paddingBottom: 80, // Pour éviter que le FAB ne chevauche
  },
  createButton: {
    marginTop: 16,
  },
});

export default EventsScreen;