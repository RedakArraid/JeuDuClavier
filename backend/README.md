# Backend JeuDuClavier

API REST pour le jeu de dactylographie JeuDuClavier.

## Installation

```bash
npm install
```

## Lancement

```bash
# Développement avec auto-reload
npm run dev

# Production
npm start
```

## Endpoints API

### Scores
- `GET /api/scores` - Récupérer les scores
- `POST /api/scores` - Sauvegarder un nouveau score
- `GET /api/scores/leaderboard` - Classements par difficulté

### Mots
- `GET /api/words/:difficulty` - Récupérer des mots par difficulté
- `GET /api/words/random/:difficulty` - Mot aléatoire
- `POST /api/words/validate` - Valider un mot

### Statistiques
- `GET /api/stats/global` - Statistiques globales
- `POST /api/stats/game` - Enregistrer les stats d'une partie

### Health Check
- `GET /health` - Vérification du serveur

## Configuration

Copiez `.env.example` vers `.env` et modifiez selon vos besoins.

## Technologies

- Node.js + Express
- Validation avec Joi
- CORS configuré pour le frontend
- Stockage en mémoire (remplacer par DB en production)
