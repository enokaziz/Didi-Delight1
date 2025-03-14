# Didi Delight 🛍️

[![React Native](https://img.shields.io/badge/React%20Native-0.76.7-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52.0.37-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.4.0-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Table des matières
- [Introduction](#introduction)
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contributions](#contributions)
- [Licence](#licence)
- [Contact](#contact)
- [Changelog](#changelog)

## 🌟 Introduction
Didi Delight est une application mobile moderne de commerce électronique, conçue pour offrir une expérience utilisateur fluide et interactive. Elle permet aux utilisateurs de parcourir un catalogue de produits, de gérer leurs commandes et de suivre les livraisons en temps réel.

## ✨ Fonctionnalités
### 👤 Client
- 📱 Interface utilisateur intuitive et responsive
- 🛍️ Catalogue de produits avec filtres et recherche
- 🛒 Panier d'achat avec gestion des quantités
- 💳 Paiement sécurisé avec Mobile Money
- 📦 Suivi des livraisons en temps réel
- 💬 Chat en direct avec le support client
- 👤 Gestion du profil utilisateur
- 🔔 Notifications push pour les mises à jour

### 👨‍💼 Administration
- 📊 Tableau de bord administrateur
- 📦 Gestion des produits et des stocks
- 🏷️ Gestion des promotions et des prix
- 📋 Suivi des commandes
- 👥 Gestion des utilisateurs
- 📈 Rapports et statistiques
- 💬 Support client intégré

## 🛠️ Technologies utilisées
- **Frontend**
  - React Native 0.76.7
  - Expo 52.0.37
  - TypeScript 5.7.3
  - React Navigation
  - React Native Paper
  - React Native Maps
  - Expo Notifications
  - Expo Location

- **Backend**
  - Firebase
    - Authentication
    - Firestore
    - Storage
    - Cloud Functions
  - Node.js

## 🏗️ Architecture
L'application suit une architecture modulaire et évolutive :
- Séparation claire des responsabilités
- Composants réutilisables
- Gestion d'état avec Context API
- Navigation hiérarchique
- Services API centralisés

Pour plus de détails, consultez notre [documentation d'architecture](ARCHITECTURE.md).

## ⚙️ Prérequis
- Node.js >= 18
- npm >= 9
- Expo CLI
- Android Studio (pour le développement Android)
- Xcode (pour le développement iOS)
- Compte Firebase

## 🚀 Installation

1. Clonez le dépôt :
   ```sh
   git clone https://github.com/votre-username/didi-delight.git
   cd didi-delight
   ```

2. Installez les dépendances :
   ```sh
   npm install
   ```

3. Configurez les variables d'environnement :
   ```sh
   cp .env.example .env
   # Éditez .env avec vos configurations
   ```

4. Installez les pods iOS (si nécessaire) :
   ```sh
   cd ios
   pod install
   cd ..
   ```

## ⚙️ Configuration

### Firebase
1. Créez un projet Firebase
2. Téléchargez `google-services.json` et `GoogleService-Info.plist`
3. Placez-les dans les dossiers appropriés :
   - Android : `android/app/`
   - iOS : `ios/`

### Variables d'environnement
Configurez les variables suivantes dans `.env` :
```env
FIREBASE_API_KEY=votre_api_key
FIREBASE_AUTH_DOMAIN=votre_auth_domain
FIREBASE_PROJECT_ID=votre_project_id
# ... autres variables nécessaires
```

## 💻 Développement

### Démarrage
```sh
# Démarrez l'application
npm start

# Pour Android
npm run android

# Pour iOS
npm run ios
```

### Structure du projet
```
src/
├── assets/         # Ressources statiques
├── components/     # Composants réutilisables
├── config/         # Configuration
├── contexts/       # Contextes React
├── firebase/       # Configuration Firebase
├── hooks/          # Hooks personnalisés
├── navigation/     # Navigation
├── screens/        # Écrans
├── services/       # Services API
├── styles/         # Styles globaux
├── theme/          # Thème
├── types/          # Types TypeScript
└── utils/          # Utilitaires
```

### 🔄 Optimisation des Imports
Pour améliorer les performances et la maintenabilité du code, suivez ces bonnes pratiques pour les imports :

#### 1. Imports Nommés vs Imports par Défaut
```typescript
// ❌ À éviter
import Button from './components/Button';
import { useState, useEffect, useCallback } from 'react';

// ✅ Recommandé
import { Button } from './components/Button';
import { useState, useEffect, useCallback } from 'react';
```

#### 2. Regroupement des Imports
```typescript
// ❌ À éviter
import { View } from 'react-native';
import { useState } from 'react';
import { Button } from './components/Button';
import { Text } from 'react-native';

// ✅ Recommandé
// Imports externes
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// Imports internes
import { Button } from './components/Button';
```

#### 3. Chemins d'Import Absolus
```typescript
// ❌ À éviter
import { Button } from '../../../components/Button';

// ✅ Recommandé
import { Button } from '@/components/Button';
```

#### 4. Imports Dynamiques
```typescript
// ❌ À éviter
import HeavyComponent from './HeavyComponent';

// ✅ Recommandé
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

#### 5. Imports de Types
```typescript
// ❌ À éviter
import { UserType } from './types';

// ✅ Recommandé
import type { UserType } from './types';
```

#### 6. Imports de Styles
```typescript
// ❌ À éviter
import styles from './styles';

// ✅ Recommandé
import { styles } from './styles';
```

#### Configuration pour les Chemins Absolus
Ajoutez cette configuration dans votre `tsconfig.json` :
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Et dans votre `babel.config.js` :
```javascript
module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src'
        }
      }
    ]
  ]
};
```

#### Avantages de l'Optimisation des Imports
1. **Performance** :
   - Réduction de la taille du bundle
   - Chargement plus rapide des composants
   - Meilleure gestion de la mémoire

2. **Maintenabilité** :
   - Code plus lisible
   - Plus facile à refactorer
   - Meilleure organisation

3. **Débogage** :
   - Plus facile de tracer les dépendances
   - Meilleure gestion des erreurs
   - Identification rapide des problèmes

4. **Évolutivité** :
   - Plus facile d'ajouter de nouvelles fonctionnalités
   - Meilleure gestion des dépendances
   - Code plus modulaire

## 🧪 Tests

### Tests unitaires
```sh
npm run test
```

### Tests E2E
```sh
npm run test:e2e
```

## 📦 Déploiement

### Android
```sh
npm run build:android
```

### iOS
```sh
npm run build:ios
```

## 🤝 Contributions
Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence
Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Contact
- Email : [votre-email@example.com]
- Site web : [votre-site.com]
- LinkedIn : [votre-profil-linkedin]

## 📝 Changelog
### [1.0.0] - 2024-03-20
- 🎉 Version initiale
- ✨ Fonctionnalités de base
- 🐛 Corrections de bugs

### [0.1.0] - 2024-03-15
- 🚀 Version beta
- 📱 Interface utilisateur de base
- 🔧 Configuration initiale

---
Fait avec ❤️ par l'équipe Didi Delight