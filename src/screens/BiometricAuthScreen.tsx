import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { biometricLogin } from "../services/authService";
import { ActivityIndicator, Snackbar } from "react-native-paper";
// import { useNavigation, NavigationProp } from "@react-navigation/native";
// import { RootStackParamList } from "../navigation/types";

// type BiometricAuthNavigationProp = NavigationProp<RootStackParamList, "Auth">;

const BiometricAuthScreen = () => {
  // const { loginWithBiometric } = useAuth();
  // const navigation = useNavigation<BiometricAuthNavigationProp>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Commenter la logique biométrique
  /*
  useEffect(() => {
    const authenticate = async () => {
      setLoading(true);
      try {
        const success = await biometricLogin();
        if (success) {
          await loginWithBiometric();
          navigation.reset({
            index: 0,
            routes: [{ name: "ClientApp" }],
          });
        }
      } catch (error) {
        setSnackbarMessage("Erreur lors de l'authentification biométrique : " + (error as Error).message);
        setSnackbarVisible(true);
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, [loginWithBiometric, navigation]);
  */

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#FF6347" />}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BiometricAuthScreen;