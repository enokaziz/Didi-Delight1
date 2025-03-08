import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useCheckoutAnimations = (cartLength: number) => {
  const itemAnimations = useRef<Animated.Value[]>([]).current;
  const overlayAnimations = useRef({
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.8),
  }).current;

 // Vérifier l'initialisation des animations
useEffect(() => {
  const newAnimations = Array(cartLength).fill(null).map((_, i) => 
    itemAnimations[i] || new Animated.Value(0)
  );
  
  // Synchroniser les animations
  itemAnimations.splice(cartLength);
  itemAnimations.push(...newAnimations);

  // Démarrer les animations
  newAnimations.forEach((anim, index) => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  });

  return () => {
    itemAnimations.forEach(anim => anim.stopAnimation());
  };
}, [cartLength]);

  useEffect(() => {
    // Logique d'animation globale
  }, []);

  return { itemAnimations, overlayAnimations };
};