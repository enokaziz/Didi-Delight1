# Didi Delight

## Introduction
Didi Delight est une application de gestion de produits et de commandes, conçue pour offrir une expérience utilisateur fluide et interactive. Elle permet aux utilisateurs de parcourir un catalogue de produits, de gérer leurs commandes et de suivre les livraisons en temps réel.

## Fonctionnalités
- Catalogue de produits
- Gestion des commandes
- Suivi des livraisons
- Chat en temps réel avec les clients
- Intégration de Mobile Money pour les paiements

## Technologies utilisées
- React Native
- Node.js
- Firebase
- Redux

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

## Contributions
Les contributions sont les bienvenues ! Pour contribuer, veuillez suivre ces étapes :
1. Forkez le projet.
2. Créez une nouvelle branche (`git checkout -b feature/YourFeature`).
3. Apportez vos modifications et validez (`git commit -m 'Add some feature'`).
4. Poussez vers la branche (`git push origin feature/YourFeature`).
5. Ouvrez une Pull Request.

## Licence
Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contact
Pour toute question ou support, veuillez contacter [enokaziz@gmail.com].
