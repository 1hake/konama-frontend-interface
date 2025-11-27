# Migration vers Axios avec Intercepteurs d'Authentification

## Résumé des modifications

### ✅ Remplacement de `fetch` par `axios` dans toute l'application

**Fichiers modifiés :**

#### 1. Configuration et utilitaires d'authentification

- **`lib/auth.ts`** :
    - Ajout d'axios avec intercepteurs de requête/réponse
    - Gestion automatique du refresh token sur erreur 401
    - Redirection automatique vers login si refresh échoue
    - Protection contre les appels multiples de refresh

- **`lib/authFetch.ts`** :
    - Simplifié pour exporter l'instance axios configurée
    - Suppression de la logique manuelle de retry (maintenant dans les intercepteurs)

#### 2. API Routes (Endpoints d'authentification)

- **`app/api/auth/login/route.ts`** : Axios au lieu de fetch
- **`app/api/auth/refresh/route.ts`** : Axios au lieu de fetch
- **`app/api/auth/logout/route.ts`** : Axios au lieu de fetch
- **`app/api/proxy/route.ts`** : Axios au lieu de fetch

#### 3. Hooks et logique métier

- **`hooks/useAuth.ts`** : Ajout du hook `useAuthenticatedAPI`
- **`hooks/useFunnel.ts`** : Axios dans toutes les opérations CRUD
- **`hooks/useImageGeneration.ts`** : Axios pour les appels API
- **`hooks/useWorkflows.ts`** : Axios pour récupérer les workflows
- **`hooks/usePromptEnhancement.ts`** : Axios pour l'amélioration de prompts

#### 4. Pages et composants

- **`app/funnels/page.tsx`** : Axios pour charger la liste des funnels
- **`app/api/view/route.ts`** : Axios pour récupérer les images

### 🔧 Configuration des intercepteurs Axios

**Instance d'authentification (`authApi`)** :

- Utilisée pour les endpoints d'auth (/login, /refresh, /logout)
- Pas d'intercepteurs pour éviter les boucles infinies

**Instance API générale (`apiClient`)** :

- Utilisée pour tous les autres appels API
- **Intercepteur de requête** : Ajoute automatiquement le token Bearer
- **Intercepteur de réponse** :
    - Détecte les erreurs 401
    - Déclenche automatiquement le refresh token
    - Évite les appels multiples simultanés de refresh
    - Retente la requête originale avec le nouveau token
    - Redirige vers `/login` si le refresh échoue

### 🛡️ Gestion intelligente du refresh token

```javascript
// Logique dans l'intercepteur de réponse
if (error.response?.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
        // Attendre que le refresh en cours se termine
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    // Déclencher le refresh token
    isRefreshing = true;
    try {
        const newTokens = await refreshToken();
        // Mettre à jour tous les appels en attente
        processQueue(null, newTokens.accessToken);
        // Retenter la requête originale
        return apiClient(originalRequest);
    } catch (refreshError) {
        // Supprimer la session et rediriger
        AuthStorage.clearAll();
        window.location.href = '/login';
    }
}
```

### 🚀 Avantages de la migration

1. **Gestion automatique des tokens** : Plus besoin de gérer manuellement les tokens dans chaque appel API

2. **Retry automatique** : Les requêtes échouées à cause d'un token expiré sont automatiquement retentées

3. **Code plus propre** : Suppression du code de gestion d'erreur répétitif dans chaque hook

4. **Performance améliorée** : Évite les appels multiples de refresh simultanés

5. **Sécurité renforcée** : Gestion centralisée de l'expiration des tokens

6. **Facilité de maintenance** : Toute la logique d'auth est centralisée dans les intercepteurs

### 📋 Utilisation

**Pour les développeurs :**

```javascript
// Utilisation simple - l'authentification est transparente
import { authFetch } from '@/lib/authFetch';

// GET request avec auth automatique
const data = await authFetch.get('/api/protected-endpoint');

// POST request avec auth automatique
const result = await authFetch.post('/api/protected-endpoint', payload);
```

**Dans les hooks :**

```javascript
import { useAuthenticatedAPI } from '@/hooks/useAuth';

function MyComponent() {
    const api = useAuthenticatedAPI();

    const fetchData = async () => {
        try {
            const response = await api.get('/api/my-endpoint');
            return response.data;
        } catch (error) {
            // Si 401, l'intercepteur gère automatiquement le refresh
            // Si refresh échoue, redirection automatique vers /login
        }
    };
}
```

### ⚠️ Points d'attention

1. **Cookies vs localStorage** : Actuellement les tokens sont en localStorage. Pour plus de sécurité, envisager httpOnly cookies.

2. **Timeout des requêtes** : Axios permet de configurer des timeouts plus facilement que fetch.

3. **Gestion des erreurs réseau** : Axios distingue mieux les erreurs réseau des erreurs HTTP.

### 🔄 Workflow d'authentification complet

1. **Login** → Stockage des tokens
2. **API Call** → Ajout automatique du token via intercepteur
3. **Token expiré (401)** → Refresh automatique via intercepteur
4. **Refresh réussi** → Nouveau token stocké + retry de la requête
5. **Refresh échoué** → Suppression session + redirection login

Cette architecture garantit une expérience utilisateur fluide avec une sécurité optimale.
