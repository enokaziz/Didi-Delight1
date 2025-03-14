import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { mobileMoneyProcessor } from '../../services/payment/mobileMoneyProcessor';
import LottieView from 'lottie-react-native';

interface MobileMoneyPaymentStatusProps {
  transactionId: string;
  amount: number;
  phoneNumber: string;
  provider: 'orange' | 'moov';
  onSuccess: () => void;
  onFailure: () => void;
}

const MobileMoneyPaymentStatus: React.FC<MobileMoneyPaymentStatusProps> = ({
  transactionId,
  amount,
  phoneNumber,
  provider,
  onSuccess,
  onFailure,
}) => {
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [checking, setChecking] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const currentStatus = await mobileMoneyProcessor.checkTransactionStatus(transactionId);
        setStatus(currentStatus);
        
        if (currentStatus === 'completed') {
          onSuccess();
        } else if (currentStatus === 'failed') {
          onFailure();
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      } finally {
        setChecking(false);
      }
    };

    // Vérifier le statut toutes les 3 secondes
    const interval = setInterval(checkStatus, 3000);

    // Nettoyage
    return () => clearInterval(interval);
  }, [transactionId]);

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return 'En attente de votre confirmation sur votre téléphone...';
      case 'processing':
        return 'Traitement de votre paiement en cours...';
      case 'completed':
        return 'Paiement effectué avec succès !';
      case 'failed':
        return 'Le paiement a échoué. Veuillez réessayer.';
      default:
        return 'Vérification du statut...';
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paiement {provider.toUpperCase()}</Text>
      
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>{formatAmount(amount)}</Text>
        <Text style={styles.phone}>via {phoneNumber}</Text>
      </View>

      <View style={styles.statusContainer}>
        {checking ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          status === 'completed' && (
            <LottieView
              source={require('../../assets/animations/payment-success.json')}
              autoPlay
              loop={false}
              style={styles.animation}
            />
          )
        )}
        <Text style={[styles.statusMessage, status === 'failed' && styles.errorMessage]}>
          {getStatusMessage()}
        </Text>
      </View>

      {status === 'failed' && (
        <Button mode="contained" onPress={onFailure} style={styles.retryButton}>
          Réessayer
        </Button>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Une notification a été envoyée sur votre téléphone.
          Veuillez suivre les instructions pour confirmer le paiement.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  phone: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  animation: {
    width: 150,
    height: 150,
  },
  statusMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  errorMessage: {
    color: '#D32F2F',
  },
  retryButton: {
    marginTop: 20,
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default MobileMoneyPaymentStatus;