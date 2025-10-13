# � Image Generation Admin

> AI-powered image generation interface with ComfyUI backend integration.

## 📋 About

**Image Generation Admin** is a modern web interface for generating AI images using ComfyUI. It provides a clean, user-friendly way to create images with artificial intelligence without needing to understand the complex ComfyUI interface.

## ✨ Features

- **Modern Interface** with Next.js 14 and Tailwind CSS
- **Real-time Progress** tracking with WebSocket integration
- **Smart Form** with prompt inputs and quick style selectors
- **Responsive Design** compatible with mobile and desktop
- **Modular Architecture** with reusable components and hooks
- **Environment Configuration** for flexible API deployment
- **Animations fluides** pour une meilleure expérience utilisateur

## 🚀 Installation

## 🚀 Quick Setup

1. **Clone the repository:**
```bash
git clone https://github.com/1hake/image-generation-admin.git
cd image-generation-admin
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure your API endpoint:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and set your RunPod URL:
```env
NEXT_PUBLIC_COMFY_API_URL=https://your-runpod-id.proxy.runpod.net
```

4. **Start the development server:**
```bash
npm run dev
```

5. Ouvrir [http://localhost:3000](http://localhost:3000)

## 🛠️ Technologies

- **Next.js 14** - Framework React avec App Router
- **Tailwind CSS** - Framework CSS utilitaire
- **EmailJS** - Service d'envoi d'emails côté client
- **TypeScript** - Typage statique
- **Vercel** - Plateforme de déploiement

## 📧 Configuration EmailJS

Créer un template d'email avec les variables suivantes :
- `{{from_name}}` - Nom du client
- `{{from_email}}` - Email du client
- `{{device_type}}` - Type d'appareil
- `{{message}}` - Message automatique

## 📱 Types d'appareils supportés

- 💽 **Disque dur** (HDD/SSD)
- 🔌 **Clé USB**
- 💾 **Carte SD**
- 📱 **Carte mémoire**

## 🚀 Déploiement

### Docker Swarm (Production)

Ce projet est configuré pour un déploiement sur Docker Swarm avec nginx et Traefik.

#### Prérequis
- Docker Swarm initialisé
- Traefik configuré comme reverse proxy
- Réseau `webnet` créé

#### Construction de l'image
```bash
# Construire l'image Docker
docker build -t thegobc/jaitoutperdu:latest .

# Pousser vers le registry
docker push thegobc/jaitoutperdu:latest
```

#### Déploiement sur Swarm
```bash
# Déployer le service
docker stack deploy -c docker-compose.swarm.yml jaitoutperdu

# Vérifier le déploiement
docker service ls
docker service ps jaitoutperdu_nextjs-app
```

#### Mise à jour
```bash
# Construire une nouvelle version
docker build -t thegobc/jaitoutperdu:v1.1.0 .
docker push thegobc/jaitoutperdu:v1.1.0

# Mettre à jour le service (rolling update)
docker service update --image thegobc/jaitoutperdu:v1.1.0 jaitoutperdu_nextjs-app
```

#### Configuration nginx
Le projet utilise nginx avec :
- **Compression gzip** pour optimiser la bande passante
- **Cache intelligent** pour les assets statiques
- **Security headers** pour la sécurité
- **Health check** sur `/health`
- **Logging structuré**

#### Monitoring et logs
```bash
# Voir les logs du service
docker service logs -f jaitoutperdu_nextjs-app

# Vérifier la santé des conteneurs
docker ps --filter label=com.docker.swarm.service.name=jaitoutperdu_nextjs-app

# Accéder au health check
curl http://yourdomain.com/health
```

### Vercel (Développement/Test)
```bash
npm i -g vercel
vercel --prod
```

### Docker local
```bash
# Construire et lancer localement
docker build -t jaitoutperdu .
docker run -p 80:80 jaitoutperdu

# Ou avec docker-compose
docker-compose up --build
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

---

💡 **Besoin d'aide ?** Contactez-nous via le formulaire sur le site !
