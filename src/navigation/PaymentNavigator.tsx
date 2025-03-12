import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PaymentMethods from '../screens/PaymentMethods';
import AddPaymentMethodScreen from '../screens/payment/AddPaymentMethodScreen';
import EditPaymentMethodScreen from '../screens/payment/EditPaymentMethodScreen';
import { PaymentStackParamList } from './types';

const Stack = createStackNavigator<PaymentStackParamList>();

const PaymentNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
      <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} />
      <Stack.Screen name="EditPaymentMethod" component={EditPaymentMethodScreen} />
    </Stack.Navigator>
  );
};

export default PaymentNavigator;
