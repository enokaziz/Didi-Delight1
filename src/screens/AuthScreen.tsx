import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ActivityIndicator } from "react-native-paper";
import { register, login } from "../services/authService";
import EmailInput from "../components/EmailInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";
import ResetPasswordScreen from "./ResetPasswordScreen";
import ErrorMessage from "../components/ErrorMessage";

const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [shakeAnim] = useState(new Animated.Value(0));
  const [floatAnim] = useState(new Animated.Value(0));
  const [inputAnim] = useState(new Animated.Value(0));
  const [toggleAnim] = useState(new Animated.Value(0));
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const strengthColors = {
    0: "#ff4444",
    1: "#ff4444",
    2: "#ffc107",
    3: "#00c851",
  } as const;

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 8) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength++;
    return strength;
  };

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleAuth = useCallback(async () => {
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
        // Animation de chargement réussie
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await register(email, password);
        // Animation de chargement réussie
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage =
        error.code === "auth/email-already-in-use"
          ? "Cet email est déjà utilisé."
          : error.code === "auth/wrong-password"
            ? "Mot de passe incorrect."
            : error.message;
      Alert.alert("Erreur", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isLogin]);

  const triggerShake = useCallback(() => {
    Animated.spring(shakeAnim, {
      toValue: 0,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
    shakeAnim.setValue(10);
  }, [shakeAnim]);

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
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
      ]),
      Animated.stagger(200, [
        Animated.timing(inputAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(toggleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, floatAnim, inputAnim, toggleAnim]);

  const floatInterpolation = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });
  const inputInterpolation = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });
  const toggleInterpolation = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const animatedStyles = {
    opacity: fadeAnim,
    transform: [{ translateX: shakeAnim }, { translateY: floatInterpolation }],
  };
  const inputStyles = {
    opacity: inputAnim,
    transform: [{ translateY: inputInterpolation }],
  };
  const toggleStyles = {
    opacity: toggleAnim,
    transform: [{ translateY: toggleInterpolation }],
  };

  return (
    <Animated.View style={[styles.container, animatedStyles]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Didi Delight</Text>
          <Animated.View style={inputStyles}>
            <EmailInput value={email} onChange={setEmail} error={emailError} />
            <ErrorMessage message={emailError} />
            <PasswordInput
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              toggleShowPassword={() => setShowPassword(!showPassword)}
              error={passwordError}
            />
            <ErrorMessage message={passwordError} />
            {!isLogin && password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View
                  style={[
                    styles.strengthBar,
                    {
                      width: `${(passwordStrength / 3) * 100}%`,
                      backgroundColor:
                        strengthColors[
                          passwordStrength as keyof typeof strengthColors
                        ],
                    },
                  ]}
                />
                <Text style={styles.strengthText}>
                  {["Faible", "Moyen", "Fort"][passwordStrength] || "Faible"}
                </Text>
              </View>
            )}
            <AuthButton
              onPress={handleAuth}
              isLoading={isLoading}
              isLogin={isLogin}
            />
            {isLogin && (
              <TouchableOpacity
                onPress={() => navigation.navigate("ResetPassword")}
                style={styles.forgotPasswordButton}
              >
                <Text style={styles.forgotPasswordText}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Ou continuer avec</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              accessibilityLabel="Connexion avec Google"
            >
              <Ionicons name="logo-google" size={24} color="#db4437" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              accessibilityLabel="Connexion avec Facebook"
            >
              <Ionicons name="logo-facebook" size={24} color="#1877f2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              accessibilityLabel="Connexion avec Apple"
            >
              <Ionicons name="logo-apple" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <Animated.View style={toggleStyles}>
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
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5D0E6", // Teinte plus douce du rose
    paddingHorizontal: 30,
    justifyContent: "center",
  },

  skeletonContainer: { flex: 1, justifyContent: "center" },
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
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  strengthBar: { height: 4, borderRadius: 2, marginRight: 10 },
  strengthText: { fontSize: 12, color: "#6c757d" },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: "#dee2e6" },
  separatorText: { color: "#6c757d", marginHorizontal: 10, fontSize: 14 },
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
  toggleContainer: { marginTop: 25 },
  toggleText: { color: "#6c757d", textAlign: "center", fontSize: 15 },
  toggleHighlight: { color: "#4f46e5", fontWeight: "600" },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#4f46e5",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#6c757d",
    fontSize: 16,
  },
});

export default AuthScreen;
