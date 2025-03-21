import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { User } from '@firebase/auth';
import { styles } from '@styles/settings.styles';

interface ProfileCardProps {
  user: User | null;
  onEditProfile: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onEditProfile }) => {
  return (
    <Card style={styles.profileCard}>
      <Card.Content style={styles.profileContent}>
        <Avatar.Image
          size={80}
          source={user?.photoURL ? { uri: user.photoURL } : require("@assets/icons/splash-icon.png")}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.displayName || "Utilisateur"}</Text>
          <Text style={styles.profileEmail}>{user?.email || "Aucun email"}</Text>
          <TouchableOpacity style={styles.editProfileButton} onPress={onEditProfile}>
            <Text style={styles.editProfileText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
}; 