import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Alert } from 'react-native';

export type MobileMoneyProvider = 'orange' | 'moov';

export interface MobileMoneyPayment {
  orderId: string;
  amount: number;
  phoneNumber: string;
  provider: MobileMoneyProvider;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

class MobileMoneyProcessor {
  // Valider le format du numéro de téléphone pour chaque opérateur
  validatePhoneNumber(phoneNumber: string, provider: MobileMoneyProvider): boolean {
    // Nettoyer le numéro
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // Vérifier la longueur
    if (cleanNumber.length !== 8) {
      return false;
    }

    // Vérifier les préfixes selon l'opérateur
    switch (provider) {
      case 'orange':
        // Préfixes Orange (à adapter selon les préfixes réels)
        return /^(07|08|09)/.test(cleanNumber);
      case 'moov':
        // Préfixes Moov (à adapter selon les préfixes réels)
        return /^(01|02|03)/.test(cleanNumber);
      default:
        return false;
    }
  }

  // Générer une référence unique pour la transaction
  private generateReference(): string {
    const prefix = 'DD'; // Didi Delight
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  // Initier une transaction
  async initiatePayment(
    orderId: string,
    amount: number,
    phoneNumber: string,
    provider: MobileMoneyProvider
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Valider le numéro de téléphone
      if (!this.validatePhoneNumber(phoneNumber, provider)) {
        throw new Error('Numéro de téléphone invalide');
      }

      // Créer la transaction dans Firestore
      const payment: Omit<MobileMoneyPayment, 'id'> = {
        orderId,
        amount,
        phoneNumber,
        provider,
        status: 'pending',
        reference: this.generateReference(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'mobileMoneyTransactions'), payment);

      // Simuler l'envoi de la demande de paiement à l'opérateur
      // En production, il faudrait intégrer l'API réelle de l'opérateur
      this.simulateOperatorRequest(docRef.id, payment);

      return {
        success: true,
        transactionId: docRef.id,
      };
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du paiement',
      };
    }
  }

  // Simuler la réponse de l'opérateur (à remplacer par l'intégration réelle)
  private async simulateOperatorRequest(transactionId: string, payment: Omit<MobileMoneyPayment, 'id'>) {
    setTimeout(async () => {
      try {
        // Simuler une réponse positive dans 90% des cas
        const isSuccessful = Math.random() < 0.9;

        if (isSuccessful) {
          await this.updateTransactionStatus(transactionId, 'completed');
          Alert.alert(
            'Paiement réussi',
            'Votre paiement a été traité avec succès.'
          );
        } else {
          await this.updateTransactionStatus(transactionId, 'failed', 'Transaction refusée par l\'opérateur');
          Alert.alert(
            'Échec du paiement',
            'Le paiement a échoué. Veuillez réessayer.'
          );
        }
      } catch (error) {
        console.error('Erreur lors de la simulation:', error);
      }
    }, 3000); // Simuler un délai de 3 secondes
  }

  // Mettre à jour le statut d'une transaction
  private async updateTransactionStatus(
    transactionId: string,
    status: MobileMoneyPayment['status'],
    errorMessage?: string
  ) {
    try {
      const transactionRef = doc(db, 'mobileMoneyTransactions', transactionId);
      await updateDoc(transactionRef, {
        status,
        ...(errorMessage && { errorMessage }),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  }

  // Vérifier le statut d'une transaction
  async checkTransactionStatus(transactionId: string): Promise<MobileMoneyPayment['status']> {
    try {
      const transactionRef = doc(db, 'mobileMoneyTransactions', transactionId);
      const transactionDoc = await getDoc(transactionRef);

      if (!transactionDoc.exists()) {
        throw new Error('Transaction non trouvée');
      }

      return transactionDoc.data().status;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      throw error;
    }
  }
}

export const mobileMoneyProcessor = new MobileMoneyProcessor();
