import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { LoyaltySettings } from '../../types/loyaltyPoints';
import { FontAwesome5 } from '@expo/vector-icons';

interface LoyaltySettingsFormProps {
  settings: LoyaltySettings;
  onSave: (settings: Partial<LoyaltySettings>) => Promise<boolean>;
  loading?: boolean;
}

const LoyaltySettingsForm: React.FC<LoyaltySettingsFormProps> = ({ 
  settings, 
  onSave,
  loading = false
}) => {
  const [formValues, setFormValues] = useState<Partial<LoyaltySettings>>({
    pointsPerCurrency: settings.pointsPerCurrency,
    levelThresholds: { ...settings.levelThresholds },
    birthdayBonus: settings.birthdayBonus,
    referralBonus: settings.referralBonus,
    firstPurchaseBonus: settings.firstPurchaseBonus,
    minimumPointsToRedeem: settings.minimumPointsToRedeem,
    active: settings.active
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormValues({
      pointsPerCurrency: settings.pointsPerCurrency,
      levelThresholds: { ...settings.levelThresholds },
      birthdayBonus: settings.birthdayBonus,
      referralBonus: settings.referralBonus,
      firstPurchaseBonus: settings.firstPurchaseBonus,
      minimumPointsToRedeem: settings.minimumPointsToRedeem,
      active: settings.active
    });
  }, [settings]);

  const handleChange = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setFormValues(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof LoyaltySettings],
          [child]: Number(value)
        }
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [key]: typeof value === 'string' ? Number(value) : value
      }));
    }
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    const success = await onSave(formValues);
    if (success) {
      setHasChanges(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Paramètres du Programme</Text>
        <View style={styles.activeContainer}>
          <Text style={styles.activeLabel}>Programme actif</Text>
          <Switch
            value={formValues.active}
            onValueChange={(value) => handleChange('active', value)}
            trackColor={{ false: '#ddd', true: '#FEE7F2' }}
            thumbColor={formValues.active ? '#F04E98' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="coins" size={16} color="#F04E98" /> Attribution des Points
        </Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Points par FCFA (ex: 0.001 = 1 point pour 1000 FCFA)</Text>
          <TextInput
            style={styles.input}
            value={formValues.pointsPerCurrency?.toString()}
            onChangeText={(value) => handleChange('pointsPerCurrency', value)}
            keyboardType="numeric"
            placeholder="0.001"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bonus premier achat</Text>
          <TextInput
            style={styles.input}
            value={formValues.firstPurchaseBonus?.toString()}
            onChangeText={(value) => handleChange('firstPurchaseBonus', value)}
            keyboardType="numeric"
            placeholder="10"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bonus anniversaire</Text>
          <TextInput
            style={styles.input}
            value={formValues.birthdayBonus?.toString()}
            onChangeText={(value) => handleChange('birthdayBonus', value)}
            keyboardType="numeric"
            placeholder="50"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bonus parrainage</Text>
          <TextInput
            style={styles.input}
            value={formValues.referralBonus?.toString()}
            onChangeText={(value) => handleChange('referralBonus', value)}
            keyboardType="numeric"
            placeholder="25"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="trophy" size={16} color="#F04E98" /> Niveaux de Fidélité
        </Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Points pour niveau Argent</Text>
          <TextInput
            style={styles.input}
            value={formValues.levelThresholds?.silver?.toString()}
            onChangeText={(value) => handleChange('levelThresholds.silver', value)}
            keyboardType="numeric"
            placeholder="100"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Points pour niveau Or</Text>
          <TextInput
            style={styles.input}
            value={formValues.levelThresholds?.gold?.toString()}
            onChangeText={(value) => handleChange('levelThresholds.gold', value)}
            keyboardType="numeric"
            placeholder="500"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Points pour niveau Platine</Text>
          <TextInput
            style={styles.input}
            value={formValues.levelThresholds?.platinum?.toString()}
            onChangeText={(value) => handleChange('levelThresholds.platinum', value)}
            keyboardType="numeric"
            placeholder="1000"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="gift" size={16} color="#F04E98" /> Utilisation des Points
        </Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Minimum de points pour utilisation</Text>
          <TextInput
            style={styles.input}
            value={formValues.minimumPointsToRedeem?.toString()}
            onChangeText={(value) => handleChange('minimumPointsToRedeem', value)}
            keyboardType="numeric"
            placeholder="50"
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.saveButton, 
          (!hasChanges || loading) && styles.disabledButton
        ]}
        onPress={handleSubmit}
        disabled={!hasChanges || loading}
      >
        {loading ? (
          <Text style={styles.saveButtonText}>Enregistrement...</Text>
        ) : (
          <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeLabel: {
    marginRight: 10,
    fontSize: 14,
    color: '#555',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#F04E98',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoyaltySettingsForm;
