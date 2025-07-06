@echo off
REM Script de lancement automatique pour JeuDuClavier (Windows)

echo 🎮 Lancement de JeuDuClavier...
echo ================================

REM Vérifier que Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier que npm est installé
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm n'est pas installé.
    pause
    exit /b 1
)

echo ✅ Node.js et npm détectés

REM Installer les dépendances du backend si nécessaire
if not exist "backend\node_modules" (
    echo 📦 Installation des dépendances backend...
    cd backend
    npm install
    cd ..
) else (
    echo ✅ Dépendances backend déjà installées
)

REM Installer les dépendances du frontend si nécessaire
if not exist "frontend\node_modules" (
    echo 📦 Installation des dépendances frontend...
    cd frontend
    npm install
    cd ..
) else (
    echo ✅ Dépendances frontend déjà installées
)

echo.
echo 🚀 Démarrage des serveurs...
echo 👀 Fermez cette fenêtre pour arrêter les serveurs
echo.

REM Démarrer le backend
echo 🔧 Démarrage du backend (port 3001)...
start "Backend JeuDuClavier" cmd /k "cd backend && npm run dev"

REM Attendre un peu
timeout /t 5 /nobreak > nul

REM Démarrer le frontend
echo 🎨 Démarrage du frontend (port 5173)...
start "Frontend JeuDuClavier" cmd /k "cd frontend && npm run dev"

REM Attendre que tout soit prêt
timeout /t 8 /nobreak > nul

echo.
echo 🎉 JeuDuClavier est prêt !
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend API: http://localhost:3001
echo ❤️  Health check: http://localhost:3001/health
echo.
echo 💡 Le jeu va s'ouvrir automatiquement dans votre navigateur

REM Ouvrir le navigateur
start http://localhost:5173

echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause > nul
