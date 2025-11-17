# � Image Generation Admin

> AI-powered image generation interface with ComfyUI backend integration.

## 📋 About

**Image Generation Admin** is a modern web interface for generating AI images using ComfyUI. It provides a clean, user-friendly way to create images with artificial intelligence without needing to understand the complex ComfyUI interface.

## ✨ Features

- **Modern Interface** with Next.js 14 and Tailwind CSS
- **Real-time Progress** tracking with WebSocket integration
- **Smart Form** with prompt inputs and quick style selectors
- **Voice Recording** with OpenAI Whisper for prompt creation
- **Responsive Design** compatible with mobile and desktop
- **Modular Architecture** with reusable components and hooks
- **Environment Configuration** for flexible API deployment
- **Mock Mode** for testing without backend endpoints
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

Edit `.env.local` and set your configuration:
```env
# ComfyUI API endpoint
NEXT_PUBLIC_COMFY_API_URL=https://your-runpod-id.proxy.runpod.net

# Workflow service API
NEXT_PUBLIC_WORKFLOW_API_URL=http://localhost:4001

# OpenAI API key for voice transcription (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Mock Mode (optional - for testing without endpoints)
NEXT_PUBLIC_MOCK_IMAGE_GENERATION=false
NEXT_PUBLIC_MOCK_WORKFLOWS=false
```

> **💡 Mock Mode**: Enable mock mode to test the interface without backend services. See [MOCK_MODE.md](./MOCK_MODE.md) for details.

4. **Start the development server:**
```bash
npm run dev
```

5. Ouvrir [http://localhost:3000](http://localhost:3000)

## 🎙️ Voice Recording Feature

The application includes a voice recording feature that allows users to create prompts using their voice through OpenAI Whisper:

### Setup
1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env.local` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Usage
1. Click the **microphone button** (🎙️ "Voix") in the prompt builder
2. **Allow microphone access** when prompted by your browser
3. **Speak your image description** in French or English
4. Click **"Stop"** when finished
5. The transcribed text will **automatically populate** the appropriate fields

### Features
- **Real-time recording** with visual feedback
- **Automatic transcription** using OpenAI Whisper
- **Intelligent field mapping** based on content analysis
- **Error handling** with user-friendly messages
- **Browser microphone permissions** support

### Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

*Note: Requires HTTPS in production for microphone access*

## 🚀 Installation

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
