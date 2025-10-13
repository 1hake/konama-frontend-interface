# 🆘 J'ai tout perdu...

> Service de récupération de données pour disques durs, clés USB, cartes SD et autres supports de stockage.

## 📋 À propos

**J'ai tout perdu** est un service professionnel de récupération de données qui aide les particuliers et entreprises à récupérer leurs fichiers importants perdus suite à :

- 💽 Panne de disque dur (HDD/SSD)
- 🔌 Corruption de clé USB
- 💾 Erreur de carte SD/mémoire
- 📱 Problème de stockage mobile

## ✨ Fonctionnalités

- **Interface moderne** avec Next.js 14 et Tailwind CSS
- **Formulaire intelligent** avec sélection visuelle des appareils
- **EmailJS intégré** pour l'envoi automatique des demandes
- **Design responsive** compatible mobile et desktop
- **Mode sombre** automatique
- **Animations fluides** pour une meilleure expérience utilisateur

## 🚀 Installation

1. Cloner le repository :
```bash
git clone https://github.com/1hake/jaitoutperdu.git
cd jaitoutperdu
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer EmailJS :
   - Créer un compte sur [EmailJS.com](https://www.emailjs.com/)
   - Remplacer les IDs dans `app/page.tsx` :
     - `serviceId`
     - `templateId`
     - `publicKey`

4. Lancer le serveur de développement :
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
