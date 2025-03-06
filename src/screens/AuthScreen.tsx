import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { register, login } from "../services/authService";
import * as Haptics from "expo-haptics";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import ConfettiCannon from "react-native-confetti-cannon";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [shakeAnim] = useState(new Animated.Value(0));
  const [floatAnim] = useState(new Animated.Value(0));
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Configuration force mot de passe
  const strengthColors = {
    0: "#ff4444",
    1: "#ff4444",
    2: "#ffc107",
    3: "#00c851",
  };

  // Calcul de la force du mot de passe
  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength++;
    return Math.min(strength, 3); // Limite à 3 pour strengthColors
  };

  // Validation de l'email
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Gestion de l'authentification
  const handleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEmailError("");
    setPasswordError("");
    setIsLoading(true);

    if (!validateEmail(email)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setEmailError("Email invalide");
      triggerShake();
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPasswordError("Minimum 6 caractères");
      triggerShake();
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        setShowConfetti(true);
        Alert.alert("Bienvenue !");
      } else {
        await register(email, password);
        setShowConfetti(true);
        Alert.alert("Compte créé avec succès !");
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      let errorMessage = "Une erreur s'est produite. Veuillez réessayer.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Cet email est déjà utilisé.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email invalide.";
      }
      Alert.alert("Erreur", errorMessage);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  // Animation de secousse
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Mise à jour de la force du mot de passe
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  // Animation de flottement
  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();

    return () => {
      floatAnimation.stop();
    };
  }, []);

  const floatInterpolation = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: shakeAnim },
            { translateY: floatInterpolation },
          ],
        },
      ]}
    >
      {/* Confettis */}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          fadeOut={true}
          autoStart={true}
        />
      )}

      {isLoading ? (
        <SkeletonPlaceholder backgroundColor="#e0e0e0" highlightColor="#f5f5f5">
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonInput} />
            <View style={styles.skeletonInput} />
            <View style={styles.skeletonButton} />
            <View style={styles.skeletonSocial} />
          </View>
        </SkeletonPlaceholder>
      ) : (
        <View>
          <Text style={styles.title}>Didi Delight</Text>

          {/* Champ Email */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#6c757d"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Adresse email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor="#6c757d"
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email input"
              accessibilityHint="Entrez votre adresse email"
            />
          </View>
          {emailError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#dc3545" />
              <Text style={styles.errorText}>{emailError}</Text>
            </View>
          )}

          {/* Champ Mot de passe */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#6c757d"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              placeholderTextColor="#6c757d"
              accessibilityLabel="Mot de passe input"
              accessibilityHint="Entrez votre mot de passe"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={showPassword ? "#4f46e5" : "#6c757d"}
              />
            </TouchableOpacity>
          </View>

          {/* Indicateur de force du mot de passe */}
          {!isLogin && password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View
                style={[
                  styles.strengthBar,
                  {
                    width: `${(passwordStrength / 3) * 100}%`,
                    backgroundColor:
                      strengthColors[passwordStrength as keyof typeof strengthColors],
                  },
                ]}
              />
              <Text style={styles.strengthText}>
                {passwordStrength > 0 ? ["Faible", "Moyen", "Fort"][passwordStrength - 1] : ""}
              </Text>
            </View>
          )}

          {passwordError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#dc3545" />
              <Text style={styles.errorText}>{passwordError}</Text>
            </View>
          )}

          {/* Bouton d'authentification */}
          <TouchableOpacity
            onPress={handleAuth}
            disabled={isLoading}
            style={[styles.button, isLoading ? styles.buttonPressed : null]}
          >
            <LinearGradient
              colors={["#6366f1", "#4f46e5"]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? "Se connecter" : "Créer un compte"}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Séparateur pour les connexions sociales */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Ou continuer avec</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Boutons sociaux */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#db4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#1877f2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Basculer entre connexion et inscription */}
          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            style={styles.toggleContainer}
          >
            <Text style={styles.toggleText}>
              {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <Text style={styles.toggleHighlight}>
                {isLogin ? "S'inscrire" : "Se connecter"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  skeletonContainer: {
    flex: 1,
    justifyContent: "center",
  },
  skeletonTitle: {
    width: 200,
    height: 40,
    marginBottom: 40,
    alignSelf: "center",
    borderRadius: 4,
  },
  skeletonInput: {
    width: "100%",
    height: 60,
    marginBottom: 15,
    borderRadius: 12,
  },
  skeletonButton: {
    width: "100%",
    height: 60,
    marginBottom: 20,
    borderRadius: 12,
  },
  skeletonSocial: {
    width: "100%",
    height: 50,
    marginBottom: 30,
    borderRadius: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2d3436",
    marginBottom: 40,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: "#2d3436",
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginLeft: 5,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    marginRight: 10,
  },
  strengthText: {
    fontSize: 12,
    color: "#6c757d",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#dee2e6",
  },
  separatorText: {
    color: "#6c757d",
    marginHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    padding: 14,
    borderRadius: 50,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleContainer: {
    marginTop: 25,
  },
  toggleText: {
    color: "#6c757d",
    textAlign: "center",
    fontSize: 15,
  },
  toggleHighlight: {
    color: "#4f46e5",
    fontWeight: "600",
  },
});

export default AuthScreen;