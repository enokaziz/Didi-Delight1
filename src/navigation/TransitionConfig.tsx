import { Animated } from 'react-native';
import { CardStyleInterpolators, TransitionSpecs, TransitionPresets } from '@react-navigation/stack';

// Utiliser les transitions prédéfinies de React Navigation pour éviter les erreurs de type

/**
 * Obtient les options de transition pour différents types d'écrans
 * @param type Type de transition à utiliser
 * @returns Options de transition pour React Navigation Stack
 */
export const getTransitionOptions = (type: 'default' | 'modal' | 'fade' = 'default') => {
  switch (type) {
    case 'modal':
      // Utiliser la transition modale prédéfinie
      return TransitionPresets.ModalSlideFromBottomIOS;
      
    case 'fade':
      // Transition avec fondu
      return {
        // Utiliser l'interpolateur de style prédéfini pour le fondu
        cardStyleInterpolator: ({ current }: { current: { progress: Animated.AnimatedInterpolation<number> } }) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
        // Utiliser les spécifications de transition prédéfinies
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      };
      
    default:
      // Transition par défaut: glissement horizontal
      return TransitionPresets.SlideFromRightIOS;
  }
};

/**
 * Options de transition personnalisées pour les écrans imbriqués
 */
export const nestedScreenOptions = {
  // Utiliser la transition de glissement horizontal par défaut
  ...TransitionPresets.SlideFromRightIOS,
  // Personnaliser l'animation pour qu'elle soit plus fluide
  gestureEnabled: true,
  // Ajouter une ombre à la carte pour un effet de profondeur
  cardStyle: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  // Personnaliser la durée de l'animation
  transitionSpec: {
    open: {
      ...TransitionSpecs.TransitionIOSSpec,
      config: {
        ...TransitionSpecs.TransitionIOSSpec.config,
        duration: 300,
      },
    },
    close: {
      ...TransitionSpecs.TransitionIOSSpec,
      config: {
        ...TransitionSpecs.TransitionIOSSpec.config,
        duration: 300,
      },
    },
  },
};
