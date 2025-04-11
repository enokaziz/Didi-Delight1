import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Card, Text, Avatar } from "react-native-paper";
import { User } from "@firebase/auth";
import { settingsStyles } from "@styles/settings.styles";
import { DEFAULT_PROFILE_IMAGE } from "@constants/images";

interface ProfileCardProps {
  user: User | null;
  onEditProfile: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onEditProfile,
}) => {
  return (
    <Card style={settingsStyles.profileCard}>
      <Card.Content style={settingsStyles.profileContent}>
        <Avatar.Image
          size={80}
          source={
            user?.photoURL ? { uri: user.photoURL } : DEFAULT_PROFILE_IMAGE
          }
        />
        <View style={settingsStyles.profileInfo}>
          <Text style={settingsStyles.profileName}>
            {user?.displayName || "Utilisateur"}
          </Text>
          <Text style={settingsStyles.profileEmail}>
            {user?.email || "Aucun email"}
          </Text>
          <TouchableOpacity
            style={settingsStyles.editProfileButton}
            onPress={onEditProfile}
          >
            <Text style={settingsStyles.editProfileText}>
              Modifier le profil
            </Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};
