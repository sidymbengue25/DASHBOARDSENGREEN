# 🔧 Guide de Dépannage - Cloud Build & Cloud Run

## 🚨 Erreurs Cloud Build Courantes

### 1. "unknown field 'timeout' in BuildOptions"
**Problème** : Le champ `timeout` était mal placé dans la configuration.
**Solution** : Le timeout doit être au niveau racine, pas dans `options`.

```yaml
# ❌ Incorrect
options:
  timeout: '1200s'

# ✅ Correct
timeout: '1200s'
options:
  machineType: 'E2_HIGHCPU_8'
```

### 2. "Build failed: npm ci failed"
**Problème** : Dépendances manquantes ou incompatibles.
**Solutions** :
```bash
# Nettoyer le cache local
rm -rf node_modules package-lock.json
npm install

# Utiliser la version simple
gcloud builds submit --config cloudbuild-simple.yaml .
```

### 3. "Permission denied for Cloud Run deployment"
**Problème** : Cloud Build n'a pas les permissions pour déployer.
**Solution** :
```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Donner permissions Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

# Donner permissions Service Account
gcloud iam service-accounts add-iam-policy-binding \
  $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 4. "Invalid substitution variables"
**Problème** : Variables de substitution mal formatées.
**Solution** : Utiliser la version simple sans substitutions :
```bash
gcloud builds submit --config cloudbuild-simple.yaml .
```

## 🚨 Erreurs Cloud Run Courantes

### 1. "Service failed to start"
**Problème** : L'application ne démarre pas correctement.
**Solutions** :
```bash
# Vérifier les logs
gcloud run services logs tail sengreen-dashboard --region=us-central1

# Vérifier la configuration du service
gcloud run services describe sengreen-dashboard --region=us-central1
```

### 2. "Cloud Run service not accessible"
**Problème** : Service déployé mais inaccessible.
**Solutions** :
```bash
# Vérifier les permissions d'accès
gcloud run services get-iam-policy sengreen-dashboard --region=us-central1

# Autoriser l'accès public si nécessaire
gcloud run services add-iam-policy-binding sengreen-dashboard \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=us-central1
```

### 3. "Memory or CPU limits exceeded"
**Problème** : Ressources insuffisantes.
**Solution** :
```bash
# Augmenter les ressources
gcloud run services update sengreen-dashboard \
  --memory=2Gi \
  --cpu=2 \
  --region=us-central1
```

## 🔍 Commandes de Debug

### Logs de Build
```bash
# Logs du dernier build
gcloud builds log --region=us-central1

# Logs d'un build spécifique
gcloud builds log BUILD_ID --region=us-central1
```

### Logs de Service
```bash
# Logs en temps réel
gcloud run services logs tail sengreen-dashboard --region=us-central1

# Logs récents
gcloud run services logs read sengreen-dashboard --region=us-central1 --limit=50
```

### Status des Services
```bash
# Liste des services Cloud Run
gcloud run services list --region=us-central1

# Détails d'un service
gcloud run services describe sengreen-dashboard --region=us-central1

# Révisions du service
gcloud run revisions list --service=sengreen-dashboard --region=us-central1
```

## 🚀 Solutions Rapides

### Déploiement Minimal
Si le déploiement complet échoue, utilisez cette version minimale :

```yaml
# cloudbuild-minimal.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/sengreen-dashboard', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/sengreen-dashboard']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args: [
      'run', 'deploy', 'sengreen-dashboard',
      '--image', 'gcr.io/$PROJECT_ID/sengreen-dashboard',
      '--region', 'us-central1',
      '--allow-unauthenticated'
    ]
```

### Test Local Docker
```bash
# Build local
docker build -t sengreen-dashboard .

# Test local
docker run -p 8080:80 sengreen-dashboard

# Vérifier http://localhost:8080
```

### Rollback Rapide
```bash
# Voir les révisions
gcloud run revisions list --service=sengreen-dashboard --region=us-central1

# Rollback vers la précédente
gcloud run services update-traffic sengreen-dashboard \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=us-central1
```

## 📞 Support

### Vérification Système
```bash
# Version gcloud
gcloud version

# Configuration actuelle
gcloud config list

# Projet actif
gcloud config get-value project

# APIs activées
gcloud services list --enabled
```

### Nettoyage
```bash
# Supprimer un service Cloud Run
gcloud run services delete sengreen-dashboard --region=us-central1

# Supprimer les images
gcloud container images delete gcr.io/$PROJECT_ID/sengreen-dashboard --force-delete-tags
```

## ⚡ Déploiement Express

Si tout échoue, utilisez cette séquence minimaliste :

```bash
# 1. Build simple
docker build -t gcr.io/$PROJECT_ID/sengreen-dashboard .

# 2. Push manuel
docker push gcr.io/$PROJECT_ID/sengreen-dashboard

# 3. Déploiement direct
gcloud run deploy sengreen-dashboard \
  --image gcr.io/$PROJECT_ID/sengreen-dashboard \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80
```

---

💡 **Astuce** : En cas de doute, utilisez toujours `cloudbuild-simple.yaml` qui a une configuration minimale et éprouvée.
