# Mise à jour du système d'authentification

## Vue d'ensemble

Ce document décrit les modifications apportées au système d'authentification pour s'aligner sur les nouvelles spécifications de l'API.

## Changements principaux

### 1. Stockage des sessions

**Avant**: Utilisation de `localStorage` pour stocker les tokens et données utilisateur séparément.

**Après**: Utilisation de cookies de session pour stocker toutes les données d'authentification dans un seul endroit sécurisé.

#### Nouveau fichier: `lib/sessionCookie.ts`

Ce fichier gère le stockage et la récupération des données de session dans les cookies:

- `persistAuthSession()`: Stocke les données de session dans un cookie
- `readAuthSession()`: Lit les données de session depuis le cookie
- `getAuthTokens()`: Extrait les tokens depuis la session
- `clearAuthSession()`: Supprime le cookie de session
- `isSessionExpired()`: Vérifie si le token d'accès a expiré
- `isRefreshTokenExpired()`: Vérifie si le refresh token a expiré

### 2. Structure des données

#### Nouvelle structure de session

```typescript
interface AuthSessionData {
    session: {
        id: string;
        token: string; // access token
        refreshToken: string;
        expiresAt: string;
        refreshExpiresAt: string;
        createdAt: string;
    };
    user: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
        clientId: string;
        lastLoginAt: string;
    };
    client: {
        id: string;
        name: string;
        slug: string;
    };
}
```

### 3. API Routes

#### POST /api/auth/login

- **Input**: `{ email: string, password: string }`
- **Output**: Structure de réponse avec `success`, `message`, et `data`

#### POST /api/auth/refresh

- **Input**: `{ refreshToken: string }`
- **Output**: Nouvelle session avec tokens renouvelés

#### POST /api/auth/logout

- **Input**: Token dans l'en-tête `Authorization: Bearer <token>`
- **Output**: Confirmation de déconnexion

### 4. Client API (lib/auth.ts)

Le client API a été complètement refondu:

- **Intercepteurs de requêtes**: Ajout automatique du token Bearer
- **Intercepteurs de réponses**: Gestion automatique du refresh token en cas d'erreur 401
- **Gestion des requêtes en attente**: Évite les appels multiples de refresh simultanés
- **Redirection automatique**: Vers la page de login en cas d'échec d'authentification

### 5. Hook useAuth

Le hook a été mis à jour pour:

- Utiliser les cookies de session au lieu du localStorage
- Gérer la nouvelle structure de données
- Implémenter la vérification automatique d'expiration
- Gérer le refresh automatique des tokens

### 6. Types TypeScript

Mise à jour des types dans `types/auth.ts`:

- Nouveaux interfaces pour `Session`, `Client`, et `AuthSessionData`
- Mise à jour de `AuthState` pour inclure la nouvelle structure
- Nouvelles interfaces de réponse avec format standardisé

## Avantages

1. **Sécurité**: Stockage sécurisé dans les cookies avec flags `secure` et `samesite`
2. **Simplicité**: Une seule source de vérité pour les données de session
3. **Robustesse**: Gestion automatique du refresh des tokens
4. **Compatibilité**: Support des environnements server-side et client-side
5. **Maintenabilité**: Code plus organisé et modulaire

## Migration

Les anciennes méthodes `AuthStorage` sont marquées comme dépréciées mais restent fonctionnelles pour assurer la compatibilité pendant la transition. Les nouvelles implémentations doivent utiliser les fonctions de `sessionCookie.ts`.

## Notes de déploiement

- Aucun changement breaking pour les composants existants
- Les sessions existantes seront automatiquement migrées lors du prochain login
- Les cookies nécessitent HTTPS en production (flag `secure`)
