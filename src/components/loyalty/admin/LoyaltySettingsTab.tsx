import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { LoyaltySettings } from '../../../types/loyaltyPoints';
import LoyaltySettingsForm from '../LoyaltySettingsForm';

interface LoyaltySettingsTabProps {
  settings: LoyaltySettings | null;
  loading: boolean;
  onRefresh: () => void;
  onSaveSettings: (updates: Partial<LoyaltySettings>) => Promise<boolean>;
}

const LoyaltySettingsTab: React.FC<LoyaltySettingsTabProps> = ({
  settings,
  loading,
  onRefresh,
  onSaveSettings,
}) => {
  if (loading && !settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F04E98" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          colors={['#F04E98']}
        />
      }
    >
      {settings && (
        <LoyaltySettingsForm
          settings={settings}
          onSave={onSaveSettings}
          loading={loading}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoyaltySettingsTab;
