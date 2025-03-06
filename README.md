# Didi Delight

## Fonctionnalités
- Catalogue de produits
- Gestion des commandes
- Suivi des livraisons
- Chat en temps réel avec les clients
- Intégration de Mobile Money pour les paiements

## Instructions de développement
1. Clonez le dépôt :
   ```sh
   git clone <url-du-dépôt>
   cd didi-delight
   ```

2. Installez les dépendances :
   ```sh
   npm install
   ```

3. Démarrez l'application :
   ```sh
   npm start
   ```

## Vérification de l'installation et du lien du module natif

Pour résoudre l'erreur `Native module RNFBAppModule not found`, suivez ces étapes :

1. Assurez-vous que le module est installé :
   ```sh
   npm install @react-native-firebase/app
   ```

2. Liez le module natif :
   ```sh
   npx react-native link @react-native-firebase/app
   ```

3. Si vous utilisez CocoaPods (iOS), assurez-vous d'installer les pods :
   ```sh
   cd ios/
   pod install
   cd ..
   ```

4. Redémarrez votre application :
   ```sh
   npm start --reset-cache
   ```

5. Si le problème persiste, essayez de nettoyer le projet et de le reconstruire :
   ```sh
   npx react-native-clean-project
   npx react-native run-android # ou npx react-native run-ios
   ```

// ...existing content...
