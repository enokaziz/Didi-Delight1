import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { validateCheckoutForm } from '../utils/validation';

export type FormState = {
  address: string;
  paymentMethod: string;
  errors: string[];
};

export const useCheckout = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  
  const [formState, setFormState] = useState<FormState>({
    address: '',
    paymentMethod: '',
    errors: [],
  });

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const validateForm = () => {
    const [isValid, errors] = validateCheckoutForm(
      formState.address,
      formState.paymentMethod
    );
    setFormState(prev => ({ ...prev, errors }));
    return isValid;
  };

  return {
    user,
    cart,
    formState,
    setFormState,
    totalPrice,
    validateForm,
  };
};
