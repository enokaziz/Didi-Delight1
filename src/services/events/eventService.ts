import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Event, EventType } from '../../types/event';

class EventService {
  private readonly eventsCollection = 'events';

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const eventWithDates = {
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, this.eventsCollection), eventWithDates);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      throw new Error('Impossible de créer l\'événement');
    }
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    try {
      const eventRef = doc(db, this.eventsCollection, eventId);
      await updateDoc(eventRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error);
      throw new Error('Impossible de mettre à jour l\'événement');
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.eventsCollection, eventId));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
      throw new Error('Impossible de supprimer l\'événement');
    }
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    try {
      const q = query(
        collection(db, this.eventsCollection),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      } as Event));
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      throw new Error('Impossible de récupérer les événements');
    }
  }

  async getUpcomingEvents(userId: string): Promise<Event[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, this.eventsCollection),
        where('userId', '==', userId),
        where('date', '>=', now),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      } as Event));
    } catch (error) {
      console.error('Erreur lors de la récupération des événements à venir:', error);
      throw new Error('Impossible de récupérer les événements à venir');
    }
  }

  async getEventsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Event[]> {
    try {
      const q = query(
        collection(db, this.eventsCollection),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      } as Event));
    } catch (error) {
      console.error('Erreur lors de la récupération des événements par date:', error);
      throw new Error('Impossible de récupérer les événements pour cette période');
    }
  }

  calculateEventDeposit(totalAmount: number): number {
    // Par défaut, l'acompte est de 30% du montant total
    return Math.ceil(totalAmount * 0.3);
  }

  getEventTypeLabel(type: EventType): string {
    switch (type) {
      case 'wedding':
        return 'Mariage';
      case 'birthday':
        return 'Anniversaire';
      case 'ceremony':
        return 'Cérémonie';
      case 'other':
        return 'Autre événement';
      default:
        return 'Événement';
    }
  }
}

export const eventService = new EventService();
