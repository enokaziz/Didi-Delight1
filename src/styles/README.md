# Structure des Styles

Ce dossier contient tous les styles de l'application organisés de manière modulaire et réutilisable.

## Organisation

```
styles/
├── components/          # Styles spécifiques aux composants
│   ├── cart/           # Styles du panier
│   ├── checkout/       # Styles du processus de paiement
│   └── product/        # Styles des produits
├── screens/            # Styles spécifiques aux écrans
│   ├── home/          # Styles de la page d'accueil
│   ├── settings/      # Styles des paramètres
│   └── productManagement/ # Styles de la gestion des produits
├── theme/             # Système de design
│   ├── colors.ts      # Palette de couleurs
│   ├── spacing.ts     # Système d'espacement
│   └── typography.ts  # Système typographique
└── index.ts           # Point d'entrée pour tous les styles
```

## Conventions

1. **Nommage des fichiers** :
   - Utilisez `styles.ts` pour les fichiers de style
   - Utilisez des noms descriptifs pour les dossiers

2. **Organisation des styles** :
   - Regroupez les styles par composant/écran
   - Utilisez le système de thème pour les valeurs réutilisables
   - Évitez la duplication de code

3. **Utilisation du thème** :
   ```typescript
   import { colors, spacing, typography } from '@styles/theme';
   ```

4. **Export des styles** :
   ```typescript
   // Dans index.ts
   export { styles as cartStyles } from './components/cart/styles';
   ```

## Bonnes Pratiques

1. Utilisez les constantes du thème plutôt que des valeurs codées en dur
2. Maintenez une hiérarchie claire des styles
3. Évitez les styles inline
4. Utilisez des noms de classes descriptifs
5. Documentez les styles complexes 