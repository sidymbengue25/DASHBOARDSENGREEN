# 🚀 Guide de Déploiement SENGREEN Dashboard

Ce guide vous aide à déployer le dashboard SENGREEN sur Google Cloud Run.

## 📋 Prérequis

### 1. Configuration Google Cloud
```bash
# Installer Google Cloud SDK si pas déjà fait
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Authentification
gcloud auth login
gcloud auth application-default login

# Configurer le projet
gcloud config set project YOUR_PROJECT_ID
```

### 2. Activer les APIs nécessaires
```bash
# Activer les services requis
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Permissions Cloud Build
```bash
# Donner les permissions à Cloud Build pour déployer sur Cloud Run
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud iam service-accounts add-iam-policy-binding \
  $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

## 🔧 Configuration

### 1. Variables d'environnement
Créez un fichier `.env.production` pour vos variables Firebase :
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="your-app-id"
```

### 2. Dockerfile (déjà créé)
Le `Dockerfile` existant est optimisé pour la production avec :
- Build multi-stage pour réduire la taille
- Nginx pour servir les fichiers statiques
- Configuration optimisée pour Cloud Run

## 🚀 Déploiement

### 1. Déploiement automatique
```bash
# Déploiement depuis le dossier racine
gcloud builds submit --config cloudbuild.yaml .
```

### 2. Déploiement avec variables personnalisées
```bash
# Avec configuration personnalisée
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_REGION=europe-west1,_MEMORY=2Gi,_CPU=2 \
  .
```

### 3. Trigger automatique (optionnel)
Créer un trigger pour déploiement automatique sur push :
```bash
gcloud builds triggers create github \
  --repo-name=DASHBOARDSENGREEN \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="main" \
  --build-config=cloudbuild.yaml
```

## 📊 Monitoring et Logs

### 1. Voir les logs de build
```bash
# Logs de la dernière build
gcloud builds log --region=europe-west1

# Logs d'un build spécifique
gcloud builds log BUILD_ID --region=europe-west1
```

### 2. Logs du service Cloud Run
```bash
# Logs en temps réel
gcloud run services logs tail sengreen-dashboard \
  --region=europe-west1

# Logs récents
gcloud run services logs read sengreen-dashboard \
  --region=europe-west1 \
  --limit=50
```

### 3. Status du service
```bash
# Informations du service
gcloud run services describe sengreen-dashboard \
  --region=europe-west1

# URL du service
gcloud run services describe sengreen-dashboard \
  --region=europe-west1 \
  --format="value(status.url)"
```

## ⚙️ Configuration Avancée

### 1. Mise à l'échelle
Modifier les paramètres dans `cloudbuild.yaml` :
```yaml
substitutions:
  _MEMORY: '2Gi'        # Mémoire (512Mi, 1Gi, 2Gi, 4Gi)
  _CPU: '2'             # CPU (1, 2, 4)
  _MAX_INSTANCES: '20'  # Instances max
  _CONCURRENCY: '100'   # Requêtes simultanées par instance
```

### 2. Domaine personnalisé
```bash
# Mapper un domaine custom
gcloud run domain-mappings create \
  --service sengreen-dashboard \
  --domain dashboard.sengreen.com \
  --region europe-west1
```

### 3. Variables d'environnement après déploiement
```bash
# Ajouter des variables d'environnement
gcloud run services update sengreen-dashboard \
  --set-env-vars="NEW_VAR=value" \
  --region=europe-west1
```

## 🔐 Sécurité

### 1. Authentification (si nécessaire)
```bash
# Désactiver l'accès public
gcloud run services remove-iam-policy-binding sengreen-dashboard \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=europe-west1

# Autoriser des utilisateurs spécifiques
gcloud run services add-iam-policy-binding sengreen-dashboard \
  --member="user:admin@sengreen.com" \
  --role="roles/run.invoker" \
  --region=europe-west1
```

### 2. HTTPS et CORS
- HTTPS est automatiquement activé sur Cloud Run
- CORS est géré par le frontend (Vite/React)

## 🔄 Mise à jour

### 1. Redéploiement
```bash
# Simple redéploiement
gcloud builds submit --config cloudbuild.yaml .
```

### 2. Rollback
```bash
# Voir les révisions
gcloud run revisions list --service=sengreen-dashboard --region=europe-west1

# Rollback vers une révision précédente
gcloud run services update-traffic sengreen-dashboard \
  --to-revisions=sengreen-dashboard-REVISION=100 \
  --region=europe-west1
```

## 📈 Optimisations

### 1. Performance
- **CDN** : Utilisez Cloud CDN pour les assets statiques
- **Caching** : Headers de cache optimisés dans Nginx
- **Compression** : Gzip activé automatiquement

### 2. Coûts
- **Auto-scaling** : Instances à 0 quand pas d'utilisation
- **Right-sizing** : Ajustez CPU/mémoire selon usage réel
- **Regions** : Choisissez la région la plus proche de vos utilisateurs

## 🎯 URL du Dashboard

Après déploiement réussi, votre dashboard sera accessible à :
```
https://sengreen-dashboard-HASH-ew.a.run.app
```

## 📞 Support

En cas de problème :

1. **Vérifiez les logs** : `gcloud builds log` et `gcloud run services logs`
2. **Status des services** : `gcloud run services list`
3. **Quotas** : Vérifiez les quotas Google Cloud
4. **Permissions** : Vérifiez les IAM roles

---

🎉 **Votre dashboard SENGREEN est maintenant déployé sur Cloud Run !**
