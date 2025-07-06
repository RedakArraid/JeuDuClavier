#!/bin/bash

# Script de lancement automatique pour JeuDuClavier
# Lance automatiquement le backend et le frontend

echo "🎮 Lancement de JeuDuClavier..."
echo "================================"

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé."
    exit 1
fi

echo "✅ Node.js et npm détectés"

# Fonction pour installer les dépendances si nécessaire
install_dependencies() {
    local dir=$1
    if [ ! -d "$dir/node_modules" ]; then
        echo "📦 Installation des dépendances pour $dir..."
        cd "$dir" && npm install && cd ..
    else
        echo "✅ Dépendances déjà installées pour $dir"
    fi
}

# Installer les dépendances
install_dependencies "backend"
install_dependencies "frontend"

echo ""
echo "🚀 Démarrage des serveurs..."
echo "👀 Appuyez sur Ctrl+C pour arrêter"
echo ""

# Fonction pour nettoyer les processus en cas d'arrêt
cleanup() {
    echo ""
    echo "🛑 Arrêt des serveurs..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Piéger le signal d'interruption
trap cleanup SIGINT

# Démarrer le backend en arrière-plan
echo "🔧 Démarrage du backend (port 3001)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
sleep 3

# Vérifier que le backend fonctionne
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend démarré avec succès"
else
    echo "❌ Erreur de démarrage du backend"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Démarrer le frontend
echo "🎨 Démarrage du frontend (port 5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Attendre que le frontend soit prêt
sleep 5

echo ""
echo "🎉 JeuDuClavier est prêt !"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo "❤️  Health check: http://localhost:3001/health"
echo ""
echo "💡 Astuce: Le jeu s'ouvrira automatiquement dans votre navigateur"

# Ouvrir automatiquement le navigateur (macOS/Linux)
if command -v open &> /dev/null; then
    sleep 2
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    sleep 2
    xdg-open http://localhost:5173
fi

# Attendre indéfiniment (les processus continuent en arrière-plan)
wait
