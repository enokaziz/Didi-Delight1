import React from "react";
import { View } from "react-native";
import { List, Divider } from "react-native-paper";
import { settingsStyles } from "@styles/settings.styles";

interface SettingsItem {
  title: string;
  description?: string;
  icon: string;
  onPress?: () => void;
  right?: React.ReactNode;
  titleStyle?: any;
  iconColor?: string;
}

interface SettingsSectionProps {
  title: string;
  items: SettingsItem[];
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  items,
}) => {
  return (
    <View style={settingsStyles.section}>
      <List.Subheader style={settingsStyles.sectionTitle}>
        {title}
      </List.Subheader>
      <List.Section>
        {items.map((item, index) => (
          <List.Item
            key={index}
            title={item.title}
            description={item.description}
            left={() => (
              <List.Icon icon={item.icon} color={item.iconColor || "#000"} />
            )}
            right={
              typeof item.right === "function" ? item.right : () => item.right
            }
            onPress={item.onPress}
            titleStyle={item.titleStyle}
          />
        ))}
      </List.Section>
      <Divider />
    </View>
  );
};
