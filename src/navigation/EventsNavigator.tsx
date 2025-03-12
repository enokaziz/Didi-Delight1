import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import EventsScreen from '../screens/events/EventsScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';
import { IconButton, useTheme } from 'react-native-paper';

export type EventsStackParamList = {
  EventsList: undefined;
  CreateEvent: undefined;
  EventDetails: { eventId: string };
  EditEvent: { eventId: string };
  Chat: { eventId: string };
};

type DrawerNavigationProps = DrawerNavigationProp<Record<string, object>>;

const Stack = createStackNavigator<EventsStackParamList>();

const EventsNavigator = () => {
  const navigation = useNavigation<DrawerNavigationProps>();
  const theme = useTheme();

  const defaultScreenOptions = {
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      backgroundColor: theme.colors.surface,
      height: Platform.OS === 'ios' ? 96 : 64,
    },
    headerTitleStyle: {
      fontWeight: 'bold' as const,
      fontSize: 20,
      color: '#000',
      fontFamily: 'Arial',
    },
    headerTitleAlign: 'center' as const,
    headerTintColor: theme.colors.primary,
    headerLeftContainerStyle: {
      paddingLeft: 8,
    },
    headerRightContainerStyle: {
      paddingRight: 8,
    },
  };

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultScreenOptions,
        headerLeft: () => (
          <IconButton
            icon="menu"
            size={24}
            onPress={() => navigation.openDrawer()}
            iconColor={theme.colors.primary}
          />
        ),
      }}
    >
      <Stack.Screen
        name="EventsList"
        component={EventsScreen}
        options={{
          title: 'Événements',
          headerTitleStyle: {
            fontWeight: 'bold' as const,
            fontSize: 20,
            color: '#000',
            fontFamily: 'Arial',
          },
        }}
      />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{
          title: 'Créer un événement',
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              iconColor={theme.colors.primary}
            />
          ),
          headerTitleStyle: {
            fontWeight: 'bold' as const,
            fontSize: 20,
            color: '#000',
            fontFamily: 'Arial',
          },
        }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{
          title: 'Détails de l\'événement',
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              iconColor={theme.colors.primary}
            />
          ),
          headerTitleStyle: {
            fontWeight: 'bold' as const,
            fontSize: 20,
            color: '#000',
            fontFamily: 'Arial',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default EventsNavigator;
