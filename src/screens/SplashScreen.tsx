import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from 'react-native-linear-gradient';

interface SplashScreenProps {
  onAnimationComplete: () => void; // Callback appelé quand l'animation est terminée
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacité initiale à 0
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // Échelle initiale à 0.5

  useEffect(() => {
    // Lancer les animations en parallèle
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, // Fondu jusqu'à pleine opacité
        duration: 1500, // 1.5 seconde
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, // Échelle jusqu'à taille normale
        friction: 4, // Effet de rebond
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Après l'animation, attendre un court instant puis appeler le callback
      setTimeout(() => onAnimationComplete(), 500);
    });
  }, [fadeAnim, scaleAnim, onAnimationComplete]);

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={{ uri: "https://via.placeholder.com/150" }} // Remplacez par votre logo
          style={styles.logo}
        />
        <Text style={styles.title}>Bienvenue dans l’App</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default SplashScreen;