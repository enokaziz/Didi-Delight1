import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';

export type MobileMoneyTransaction = {
  userId: string;
  orderId: string;
  amount: number;
  phoneNumber: string;
  provider: 'orange' | 'moov';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
};

export const mobileMoneyService = {
  // Initier une transaction Mobile Money
  initiateTransaction: async (
    userId: string,
    orderId: string,
    amount: number,
    phoneNumber: string,
    provider: 'orange' | 'moov'
  ): Promise<string> => {
    try {
      const transaction: MobileMoneyTransaction = {
        userId,
        orderId,
        amount,
        phoneNumber,
        provider,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'mobileMoneyTransactions'), transaction);
      
      // Ici, vous devriez intégrer l'API de l'opérateur (Orange ou Moov)
      // pour initier la vraie transaction
      // Cette partie dépendra de l'API fournie par l'opérateur

      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'initiation de la transaction:', error);
      throw new Error('Impossible d\'initier la transaction Mobile Money');
    }
  },

  // Vérifier le statut d'une transaction
  checkTransactionStatus: async (transactionId: string): Promise<string> => {
    try {
      const transactionRef = doc(db, 'mobileMoneyTransactions', transactionId);
      const transactionDoc = await getDoc(transactionRef);

      if (!transactionDoc.exists()) {
        throw new Error('Transaction non trouvée');
      }

      return transactionDoc.data().status;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      throw new Error('Impossible de vérifier le statut de la transaction');
    }
  },

  // Mettre à jour le statut d'une transaction
  updateTransactionStatus: async (
    transactionId: string,
    status: 'completed' | 'failed'
  ): Promise<void> => {
    try {
      const transactionRef = doc(db, 'mobileMoneyTransactions', transactionId);
      await updateDoc(transactionRef, {
        status,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new Error('Impossible de mettre à jour le statut de la transaction');
    }
  },

  // Valider un numéro de téléphone
  validatePhoneNumber: (phoneNumber: string, provider: 'orange' | 'moov'): boolean => {
    // Vérifier que le numéro a 8 chiffres
    if (!/^\d{8}$/.test(phoneNumber)) {
      return false;
    }

    // Vérifier les préfixes selon l'opérateur
    if (provider === 'orange') {
      // Préfixes Orange (à adapter selon les préfixes réels dans votre pays)
      return /^0[567]/.test(phoneNumber);
    } else if (provider === 'moov') {
      // Préfixes Moov (à adapter selon les préfixes réels dans votre pays)
      return /^0[12]/.test(phoneNumber);
    }

    return false;
  },
};
