import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useCheckoutAnimations = (cartLength: number) => {
  const itemAnimations = useRef<Animated.Value[]>([]).current;
  const overlayAnimations = useRef({
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.8),
  }).current;

  useEffect(() => {
    // Réinitialiser les animations existantes
    itemAnimations.forEach((anim) => anim.setValue(0));
    const newAnimations = Array(cartLength)
      .fill(null)
      .map((_, i) => itemAnimations[i] || new Animated.Value(0));

    // Synchroniser le tableau
    itemAnimations.length = 0;
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
      itemAnimations.forEach((anim) => anim.stopAnimation());
    };
  }, [cartLength]);

  return { itemAnimations, overlayAnimations };
};