# Système WebSocket pour la Génération d'Images en Temps Réel

## 📋 Fonctionnalités Implémentées

### 🔌 Hook WebSocket Principal (`useWebSocket.ts`)
- **Connexion automatique** lors de l'authentification
- **Authentification** via token Bearer en query parameter
- **Reconnexion automatique** (jusqu'à 5 tentatives)
- **Gestion des événements** `task.updated` et `task.files.uploaded`
- **Filtrage automatique** des tâches en statut SUCCESS avec fichiers
- **Récupération automatique** des URLs d'images via API REST
- **Logging détaillé** pour le debugging

### 🖼️ Composants d'Affichage

#### `LiveImageGenerator`
- Galerie d'images générées en temps réel
- Grille responsive (1-4 colonnes selon l'écran)
- Modal pour agrandissement des images
- Contrôles de connexion/déconnexion
- Limitation du nombre d'images affichées
- Bouton pour vider la liste

#### `WebSocketStatus`
- Indicateur compact de statut de connexion
- Émojis visuels pour chaque état
- Compteur d'images générées
- Mode détaillé optionnel

#### `ImageNotification`
- Notifications toast pour nouvelles images
- Positionnement configurable
- Auto-suppression avec barre de progression
- Animations d'apparition/disparition
- Limitation du nombre de notifications simultanées

### 🛠️ Outils de Diagnostic

#### `WebSocketDiagnostic`
- Vue détaillée de l'état de connexion
- Affichage du token d'authentification
- Historique des événements
- Codes d'erreur détaillés

#### `WebSocketTester`
- Test manuel de connexion WebSocket
- Test de l'API REST
- Console de debugging en temps réel
- Gestion des timeouts

### 🗂️ Pages et Navigation

#### Page Principale (`/`)
- Interface studio avec galerie en arrière-plan
- Statut WebSocket en haut à droite
- Notifications en temps réel
- Formulaire de génération flottant

#### Page Images (`/images`)
- Vue dédiée à toutes les images générées
- Affichage de jusqu'à 100 images
- Contrôles complets de WebSocket

#### Page Diagnostic (`/diagnostic`)
- Tests et diagnostics complets
- Documentation des formats d'événements
- Actions automatiques documentées

#### Navigation
- Menu dans le header avec icônes
- Indicateur de page active
- Liens de retour sur les sous-pages

## 🔄 Flux de Fonctionnement

### 1. Authentification
```
Utilisateur se connecte → Token JWT stocké → WebSocket se connecte automatiquement
```

### 2. Connexion WebSocket
```
wss://client.konama.fuzdi.fr/ws?token=JWT_TOKEN
```

### 3. Traitement des Événements
```
Événement reçu → Filtre (SUCCESS + fichiers) → Appel API → Affichage image
```

### 4. Récupération d'Image
```
GET https://client.konama.fuzdi.fr/tasks/{taskId}
Authorization: Bearer JWT_TOKEN
```

## 📡 Format des Événements

### Événements Supportés
- `task.updated` - Mise à jour de statut de tâche
- `task.files.uploaded` - Fichiers uploadés (images générées)

### Statuts de Tâche
- `PENDING` - En attente
- `PROCESSING` - En cours de traitement
- `EXECUTING` - En exécution
- `SUCCESS` - Terminé avec succès ✅
- `FAILED` - Échec

### Structure de l'Événement
```json
{
    "type": "task.files.uploaded",
    "data": {
        "taskId": "uuid",
        "status": "SUCCESS",
        "promptId": "uuid",
        "comfyClientId": "uuid",
        "files": [
            {
                "id": "uuid",
                "filename": "image.png",
                "s3Url": "https://...",
                "fileType": "images"
            }
        ]
    },
    "timestamp": "2025-12-03T15:07:33.870Z"
}
```

## 🚨 Gestion des Erreurs

### Codes WebSocket
- `1006` - Fermeture anormale → Reconnexion
- `1008` - Erreur d'authentification → Affichage erreur
- `1011` - Erreur serveur → Reconnexion

### Fallbacks
- Reconnexion automatique avec délai croissant
- Messages d'erreur utilisateur-friendly
- Logging détaillé pour le debugging
- Tests manuels disponibles

## 🎯 Points d'Intégration

### Hooks Utilisés
- `useAuth()` - Pour l'authentification
- `useWebSocket()` - Pour la connexion temps réel

### Pages Modifiées
- `app/page.tsx` - Page principale avec galerie
- `components/AuthenticatedLayout.tsx` - Navigation

### Nouvelles Routes
- `/images` - Galerie complète
- `/diagnostic` - Outils de diagnostic

## 🔧 Configuration

### Variables
- `WEBSOCKET_URL` - URL du WebSocket
- `API_BASE_URL` - URL de l'API REST
- `MAX_RECONNECT_ATTEMPTS` - Nombre de tentatives
- `RECONNECT_DELAY` - Délai entre tentatives

### Paramètres Configurables
- Position des notifications
- Nombre max d'images affichées
- Durée des notifications
- Nombre de tentatives de reconnexion

## ✅ Tests Recommandés

1. **Connexion** - Vérifier la connexion WebSocket après login
2. **Événements** - Tester la réception d'événements
3. **Images** - Vérifier l'affichage des images
4. **Reconnexion** - Tester la reconnexion après déconnexion
5. **Erreurs** - Tester avec token invalide
6. **API** - Tester l'endpoint `/tasks/{taskId}`

L'implémentation est complète et prête pour les tests en environnement réel ! 🚀