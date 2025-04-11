import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  arrayUnion,
} from "firebase/firestore";
import { Event, EventStatus, EventType } from "../../types/event";

class EventService {
  private readonly eventsCollection = "events";

  async createEvent(
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const eventWithDates = {
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(
        collection(db, this.eventsCollection),
        eventWithDates
      );
      return docRef.id;
    } catch (error) {
      console.error(
        error instanceof Error && error.message.includes("permission")
          ? "Vous n'avez pas la permission de créer un événement."
          : "Erreur lors de la création de l'événement. Veuillez réessayer."
      );
      throw error;
    }
  }
  async getAllEvents(): Promise<Event[]> {
    try {
      const q = query(
        collection(db, this.eventsCollection),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate(), // Conversion Firestore timestamp
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          }) as Event
      );
    } catch (error) {
      console.error("Erreur récupération événements:", error);
      throw new Error("Impossible de charger les événements");
    }
  }

  async addAdminNotes(
    eventId: string,
    notes: string,
    appendMode: boolean = false
  ): Promise<void> {
    try {
      const eventRef = doc(db, this.eventsCollection, eventId);

      if (appendMode) {
        // En mode ajout, récupérer les notes existantes et ajouter les nouvelles
        const eventDoc = await getDoc(eventRef);
        const eventData = eventDoc.data();
        const existingNotes = eventData?.adminNotes || "";
        const updatedNotes = existingNotes
          ? `${existingNotes}\n${notes}`
          : notes;

        await updateDoc(eventRef, {
          adminNotes: updatedNotes,
          updatedAt: new Date(),
        });
      } else {
        // En mode remplacement, simplement mettre à jour les notes
        await updateDoc(eventRef, {
          adminNotes: notes,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Erreur ajout notes admin:", error);
      throw new Error("Échec de l'ajout des notes");
    }
  }

  async updateEventStatus(
    eventId: string,
    status: EventStatus,
    adminId?: string,
    reason?: string
  ): Promise<void> {
    try {
      const eventRef = doc(db, this.eventsCollection, eventId);
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      // Si un adminId est fourni, enregistrer l'action admin
      if (adminId) {
        const adminAction = {
          action:
            status === "confirmed"
              ? "approved"
              : status === "cancelled"
                ? "rejected"
                : "modified",
          date: new Date(),
          adminId,
          reason,
        };

        // Vérifier si adminActions existe déjà
        const eventDoc = await getDoc(eventRef);
        const eventData = eventDoc.data();

        if (eventData?.adminActions) {
          // Ajouter à la liste existante
          updateData.adminActions = [...eventData.adminActions, adminAction];
        } else {
          // Créer une nouvelle liste
          updateData.adminActions = [adminAction];
        }
      }

      await updateDoc(eventRef, updateData);
    } catch (error) {
      console.error(`Erreur mise à jour statut (${status}):`, error);
      throw new Error(`Échec de la mise à jour du statut`);
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
      console.error("Erreur lors de la mise à jour de l'événement:", error);
      throw new Error("Impossible de mettre à jour l'événement");
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.eventsCollection, eventId));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error);
      throw new Error("Impossible de supprimer l'événement");
    }
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    try {
      const q = query(
        collection(db, this.eventsCollection),
        where("userId", "==", userId),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          }) as Event
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
      throw new Error("Impossible de récupérer les événements");
    }
  }

  async getUpcomingEvents(userId: string): Promise<Event[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, this.eventsCollection),
        where("userId", "==", userId),
        where("date", ">=", now),
        orderBy("date", "asc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          }) as Event
      );
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des événements à venir:",
        error
      );
      throw new Error("Impossible de récupérer les événements à venir");
    }
  }

  async getEventsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Event[]> {
    try {
      const q = query(
        collection(db, this.eventsCollection),
        where("userId", "==", userId),
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "asc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          }) as Event
      );
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des événements par date:",
        error
      );
      throw new Error(
        "Impossible de récupérer les événements pour cette période"
      );
    }
  }

  calculateEventDeposit(totalAmount: number): number {
    // Par défaut, l'acompte est de 30% du montant total
    return Math.ceil(totalAmount * 0.3);
  }

  getEventTypeLabel(type: EventType): string {
    switch (type) {
      case "wedding":
        return "Mariage";
      case "birthday":
        return "Anniversaire";
      case "ceremony":
        return "Cérémonie";
      case "other":
        return "Autre événement";
      default:
        return "Événement";
    }
  }

  // Méthodes pour la gestion des conflits de dates
  async checkDateAvailability(date: Date, location: string): Promise<boolean> {
    try {
      // Créer une plage de dates pour la journée entière
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Vérifier s'il existe des événements confirmés à cette date et ce lieu
      const q = query(
        collection(db, this.eventsCollection),
        where("date", ">=", startOfDay),
        where("date", "<=", endOfDay),
        where("location", "==", location),
        where("status", "in", ["confirmed", "in_progress"])
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.empty; // true si aucun conflit, false si conflit
    } catch (error) {
      console.error("Erreur vérification disponibilité:", error);
      throw new Error("Impossible de vérifier la disponibilité de la date");
    }
  }

  async getConflictingEvents(date: Date, location: string): Promise<Event[]> {
    try {
      // Créer une plage de dates pour la journée entière
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Trouver tous les événements à cette date et ce lieu
      const q = query(
        collection(db, this.eventsCollection),
        where("date", ">=", startOfDay),
        where("date", "<=", endOfDay),
        where("location", "==", location)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          }) as Event
      );
    } catch (error) {
      console.error("Erreur récupération événements conflictuels:", error);
      throw new Error("Impossible de récupérer les événements conflictuels");
    }
  }

  // Méthode pour rejeter un événement avec motif
  async rejectEvent(
    eventId: string,
    adminId: string,
    reason: string
  ): Promise<void> {
    try {
      // Mettre à jour le statut
      await this.updateEventStatus(eventId, "cancelled", adminId, reason);

      // Ajouter la raison du rejet dans les notes admin
      await this.addAdminNotes(eventId, `Événement rejeté: ${reason}`, true);
    } catch (error) {
      console.error("Erreur rejet événement:", error);
      throw new Error("Impossible de rejeter l'événement");
    }
  }
}

export const eventService = new EventService();
