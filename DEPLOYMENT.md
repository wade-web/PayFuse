# Guide de Déploiement PayFuse

Ce guide vous accompagne dans le déploiement de PayFuse en production, depuis la configuration locale jusqu'au déploiement sur différentes plateformes cloud.

## 🎯 Vue d'Ensemble

PayFuse est conçu pour être déployé facilement sur plusieurs plateformes :
- **Netlify** (Frontend) - Recommandé pour le hackathon
- **Vercel** (Frontend alternatif)
- **Supabase** (Backend & Database)
- **Docker** (Containerisation)
- **AWS/GCP/Azure** (Production enterprise)

---

## 🚀 Déploiement Rapide (Hackathon)

### Prérequis
- Compte GitHub
- Compte Netlify
- Compte Supabase
- Compte ElevenLabs (pour Voice AI Challenge)

### 1. Configuration Supabase

```bash
# 1. Créer un projet Supabase
# Aller sur https://supabase.com/dashboard
# Créer un nouveau projet

# 2. Récupérer les variables d'environnement
# Project Settings > API
# Copier URL et anon key
```

### 2. Configuration des Variables d'Environnement

Créer un fichier `.env` :

```env
# Supabase (Obligatoire)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# ElevenLabs (Voice AI Challenge)
VITE_ELEVENLABS_API_KEY=your-elevenlabs-key

# Orange Money (Optionnel)
VITE_ORANGE_MONEY_CLIENT_ID=your-client-id
VITE_ORANGE_MONEY_CLIENT_SECRET=your-client-secret
VITE_ORANGE_MONEY_BASE_URL=https://api.orange.com/orange-money-webpay/dev/v1

# Wave (Optionnel)
VITE_WAVE_API_KEY=your-wave-key
VITE_WAVE_BASE_URL=https://api.wave.com/v1

# OpenAI (Optionnel)
VITE_OPENAI_API_KEY=your-openai-key

# Environment
VITE_ENVIRONMENT=production
```

### 3. Déploiement sur Netlify

#### Option A: Via GitHub (Recommandé)

```bash
# 1. Push votre code sur GitHub
git add .
git commit -m "feat: ready for deployment"
git push origin main

# 2. Connecter à Netlify
# - Aller sur https://netlify.com
# - "New site from Git"
# - Sélectionner votre repository
# - Build command: npm run build
# - Publish directory: dist
```

#### Option B: Via Netlify CLI

```bash
# 1. Installer Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build et deploy
npm run build
netlify deploy --prod --dir=dist
```

### 4. Configuration des Variables sur Netlify

```bash
# Via Netlify CLI
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
netlify env:set VITE_ELEVENLABS_API_KEY "your-elevenlabs-key"

# Ou via l'interface web:
# Site settings > Environment variables
```

---

## 🐳 Déploiement Docker

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  payfuse-frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_ELEVENLABS_API_KEY=${VITE_ELEVENLABS_API_KEY}
    restart: unless-stopped

  # Optionnel: Redis pour le cache
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  # Optionnel: Monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped
```

### Commandes Docker

```bash
# Build l'image
docker build -t payfuse:latest .

# Run en local
docker run -p 3000:80 --env-file .env payfuse:latest

# Avec docker-compose
docker-compose up -d

# Logs
docker-compose logs -f payfuse-frontend
```

---

## ☁️ Déploiement Cloud

### AWS (Amazon Web Services)

#### S3 + CloudFront

```bash
# 1. Build l'application
npm run build

# 2. Créer un bucket S3
aws s3 mb s3://payfuse-app

# 3. Upload les fichiers
aws s3 sync dist/ s3://payfuse-app --delete

# 4. Configurer CloudFront
# Via AWS Console ou Terraform
```

#### ECS (Elastic Container Service)

```yaml
# task-definition.json
{
  "family": "payfuse",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "payfuse-frontend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/payfuse:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "VITE_SUPABASE_URL",
          "value": "https://your-project.supabase.co"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/payfuse",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Platform

#### Cloud Run

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/payfuse:$COMMIT_SHA', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/payfuse:$COMMIT_SHA']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'payfuse'
      - '--image'
      - 'gcr.io/$PROJECT_ID/payfuse:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
```

```bash
# Déploiement manuel
gcloud builds submit --tag gcr.io/PROJECT_ID/payfuse
gcloud run deploy payfuse --image gcr.io/PROJECT_ID/payfuse --platform managed
```

### Azure

#### Container Instances

```bash
# Créer un resource group
az group create --name payfuse-rg --location eastus

# Déployer le container
az container create \
  --resource-group payfuse-rg \
  --name payfuse-app \
  --image your-registry/payfuse:latest \
  --dns-name-label payfuse-app \
  --ports 80 \
  --environment-variables \
    VITE_SUPABASE_URL=https://your-project.supabase.co \
    VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔧 Configuration Avancée

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security
        location ~ /\. {
            deny all;
        }
    }
}
```

### SSL/TLS avec Let's Encrypt

```bash
# Installer certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir un certificat
sudo certbot --nginx -d payfuse.yourdomain.com

# Auto-renewal
sudo crontab -e
# Ajouter: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Monitoring & Observabilité

### Prometheus + Grafana

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'payfuse'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
```

### Health Checks

```typescript
// src/health.ts
export const healthCheck = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  version: process.env.npm_package_version,
  uptime: process.uptime(),
  checks: {
    database: 'healthy',
    redis: 'healthy',
    external_apis: 'healthy'
  }
}
```

### Logging

```typescript
// src/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'payfuse' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})
```

---

## 🔒 Sécurité en Production

### Variables d'Environnement Sécurisées

```bash
# Utiliser des secrets managers
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id payfuse/prod/api-keys

# Azure Key Vault
az keyvault secret show --vault-name payfuse-vault --name api-key

# Google Secret Manager
gcloud secrets versions access latest --secret="api-key"
```

### Firewall & Network Security

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
```

### Backup Strategy

```bash
# Backup automatique Supabase
# Via Supabase Dashboard > Settings > Database > Backups

# Backup des fichiers statiques
aws s3 sync s3://payfuse-app s3://payfuse-backup/$(date +%Y%m%d)

# Backup de la configuration
kubectl get configmap payfuse-config -o yaml > backup/config-$(date +%Y%m%d).yaml
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm test
    - npm run lint
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST -d '{}' $NETLIFY_DEPLOY_HOOK
  only:
    - main
```

---

## 📈 Performance Optimization

### Bundle Analysis

```bash
# Analyser la taille du bundle
npm run build -- --analyze

# Ou avec webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/static/js/*.js
```

### Optimisations Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    host: true
  }
})
```

### CDN Configuration

```typescript
// Pour les assets statiques
const CDN_URL = 'https://cdn.payfuse.dev'

// Dans votre build
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? CDN_URL : '/',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  }
})
```

---

## 🔍 Troubleshooting

### Problèmes Courants

#### 1. Variables d'environnement non chargées
```bash
# Vérifier que les variables commencent par VITE_
echo $VITE_SUPABASE_URL

# Redémarrer le serveur de dev après modification
npm run dev
```

#### 2. Erreurs de build
```bash
# Nettoyer le cache
rm -rf node_modules dist
npm install
npm run build
```

#### 3. Problèmes de CORS
```typescript
// Configurer Supabase CORS
// Dashboard > Settings > API > CORS origins
// Ajouter votre domaine de production
```

#### 4. Erreurs de déploiement Netlify
```bash
# Vérifier les logs de build
netlify logs

# Tester le build localement
npm run build
npx serve dist
```

### Logs et Debugging

```bash
# Logs Netlify
netlify logs --live

# Logs Docker
docker logs payfuse-frontend

# Logs Kubernetes
kubectl logs deployment/payfuse-frontend
```

---

## 📞 Support

### Ressources
- **Documentation**: [docs.payfuse.dev](https://docs.payfuse.dev)
- **Status Page**: [status.payfuse.dev](https://status.payfuse.dev)
- **Discord**: [PayFuse Community](https://discord.gg/payfuse)

### Contact
- **Email**: support@payfuse.dev
- **Issues**: [GitHub Issues](https://github.com/payfuse/payfuse/issues)
- **Urgences**: emergency@payfuse.dev

---

**Bon déploiement ! 🚀**

*Ce guide est maintenu à jour avec les dernières pratiques. Pour des questions spécifiques, n'hésitez pas à nous contacter.*