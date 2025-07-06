# Frontend JeuDuClavier

Interface utilisateur React/TypeScript pour le jeu de dactylographie JeuDuClavier.

## Installation

```bash
npm install
```

## Lancement

```bash
# Développement
npm run dev

# Build de production
npm run build

# Aperçu de la production
npm run preview
```

## Configuration

1. Copiez `.env.example` vers `.env.local`
2. Modifiez `VITE_API_URL` pour pointer vers votre backend

## Fonctionnalités

- 🎮 Jeu de dactylographie avec 4 niveaux de difficulté
- 📊 Statistiques en temps réel (WPM, précision, score)
- 🏆 Système de classement local et global
- 💾 Sauvegarde automatique des progrès
- 🎨 Interface moderne avec Tailwind CSS
- 📱 Design responsive (mobile/desktop)

## Technologies

- React 18 + TypeScript
- Vite pour le build
- Tailwind CSS pour le styling
- Lucide React pour les icônes
- API REST intégrée

## Structure

```
src/
├── components/     # Composants React réutilisables
├── hooks/         # Hooks personnalisés
├── services/      # Services (API, Storage)
├── types/         # Types TypeScript
└── data/          # Données statiques
```

## Scripts disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Aperçu de la production
- `npm run lint` - Vérification du code
- `npm run type-check` - Vérification TypeScript
