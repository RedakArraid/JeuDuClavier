# 🎮 JeuDuClavier - Typing Speed Game

Un jeu de dactylographie moderne avec architecture frontend/backend, développé en React + TypeScript et Node.js.

## 🏗️ Architecture du Projet

```
JeuDuClavier/
├── frontend/           # Application React/TypeScript
│   ├── src/
│   │   ├── components/ # Composants UI
│   │   ├── hooks/      # Hooks personnalisés
│   │   ├── services/   # API et Storage
│   │   ├── types/      # Types TypeScript
│   │   └── data/       # Données statiques
│   ├── package.json
│   └── vite.config.ts
├── backend/            # API REST Node.js
│   ├── src/
│   │   ├── routes/     # Routes API
│   │   ├── controllers/# Contrôleurs
│   │   └── models/     # Modèles de données
│   ├── package.json
│   └── .env.example
└── README.md          # Ce fichier
```

## 🚀 Installation et Exécution

### Prérequis
- **Node.js** 16+ et **npm**
- **Terminal/CMD** ouvert

### 🔧 Installation Rapide

```bash
# 1. Cloner ou naviguer vers le projet
cd /Users/kader/Desktop/projet-en-cours/JeuDuClavier

# 2. Installer le backend
cd backend
npm install
cd ..

# 3. Installer le frontend
cd frontend
npm install
cd ..
```

### ▶️ Lancement en Mode Développement

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```
> 🌐 Backend démarré sur `http://localhost:3001`

**Terminal 2 - Frontend :**
```bash
cd frontend  
npm run dev
```
> 🎮 Frontend démarré sur `http://localhost:5173`

**Ouvrir dans le navigateur :** `http://localhost:5173`

## 🎯 Fonctionnalités

### Frontend React
- ✅ **4 Niveaux de difficulté** (Easy, Normal, Hard, Expert)
- ✅ **Statistiques temps réel** (WPM, précision, score, niveau)
- ✅ **Interface moderne** avec animations Tailwind CSS
- ✅ **Responsive design** (mobile/desktop)
- ✅ **Sauvegarde locale** des progrès
- ✅ **Gestion d'état optimisée** (hooks corrigés)

### Backend Node.js
- ✅ **API REST complète** avec Express
- ✅ **Gestion des scores** et classements
- ✅ **Système de mots** par difficulté
- ✅ **Statistiques globales** et analytics
- ✅ **Validation des données** avec Joi
- ✅ **CORS configuré** pour le frontend

## 🔗 Endpoints API

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/health` | GET | Vérification serveur |
| `/api/scores` | GET/POST | Gestion des scores |
| `/api/words/:difficulty` | GET | Récupération des mots |
| `/api/stats/global` | GET | Statistiques globales |

## 🎮 Comment Jouer

1. **Choisir la difficulté** dans le menu principal
2. **Taper les mots** qui tombent du haut de l'écran
3. **Surveiller les stats** en temps réel (coin supérieur droit)
4. **Éviter 10 erreurs** sinon Game Over !
5. **Battre son record** et grimper dans les classements

## ⚙️ Configuration

### Variables d'Environnement

**Backend** (créer `backend/.env`) :
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** (créer `frontend/.env.local`) :
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_TITLE=JeuDuClavier
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev      # Développement avec auto-reload
npm start        # Production
npm test         # Tests (à venir)
```

### Frontend
```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Aperçu production
npm run lint     # Vérification code
```

## 🚀 Déploiement

### Frontend
- **Vercel :** `vercel --prod` dans `/frontend`
- **Netlify :** Upload du dossier `dist/` après `npm run build`
- **GitHub Pages :** Via GitHub Actions

### Backend
- **Railway :** Connexion directe au repo
- **Heroku :** `git push heroku main`
- **DigitalOcean :** App Platform

## 🐛 Dépannage

### Problèmes Courants

**❌ "Cannot connect to backend"**
```bash
# Vérifier que le backend tourne
curl http://localhost:3001/health
# Redémarrer si nécessaire
```

**❌ "Port 5173 already in use"**
```bash
# Vite choisira automatiquement 5174, 5175, etc.
# Ou forcer un port :
npm run dev -- --port 3000
```

**❌ Erreurs TypeScript**
```bash
cd frontend
npm run type-check  # Vérifier les types
npm run lint:fix    # Corriger automatiquement
```

## 📊 Problèmes Corrigés

✅ **Memory leaks** dans le game loop  
✅ **Logique de collision** cohérente  
✅ **Race conditions** dans l'input  
✅ **Calcul WPM** sans division par zéro  
✅ **Fonctions dépréciées** remplacées  
✅ **Configuration package.json** mise à jour  

## 🎯 Prochaines Fonctionnalités

- 🔄 **Mode multijoueur** en temps réel
- 📱 **App mobile** PWA
- 🏆 **Système d'achievements**
- 📈 **Analytics avancées**
- 🎵 **Effets sonores**
- 🌍 **Support multi-langues**

## 👨‍💻 Développement

Le projet utilise une architecture moderne et scalable :
- **Frontend :** React 18 + TypeScript + Vite + Tailwind
- **Backend :** Node.js + Express + ES6 Modules
- **Code quality :** ESLint + TypeScript strict
- **Performance :** Hooks optimisés + API REST efficace

## 📄 License

MIT - Voir le fichier LICENSE

---

**🎉 Prêt à tester vos compétences de frappe ? Lancez le projet et amusez-vous !**