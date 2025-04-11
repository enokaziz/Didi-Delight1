import { StyleSheet } from 'react-native';

export const settingsStyles = StyleSheet.create({
  // Styles pour SettingsSection
  section: {
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  
  // Styles pour ProfileCard
  profileCard: {
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    padding: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF4952',
    borderRadius: 20,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 14,
  },
});
