#!/bin/bash

# 🚀 Script de déploiement SENGREEN Dashboard sur Cloud Run
# Usage: ./deploy.sh [PROJECT_ID]

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${1:-$(gcloud config get-value project)}
SERVICE_NAME="sengreen"
REGION="us-central1"

echo -e "${BLUE}🚀 Déploiement du Dashboard SENGREEN${NC}"
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Service: ${SERVICE_NAME}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo ""

# Vérification des prérequis
echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

# Vérifier gcloud
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK n'est pas installé${NC}"
    exit 1
fi

# Vérifier l'authentification
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}❌ Veuillez vous authentifier: gcloud auth login${NC}"
    exit 1
fi

# Vérifier le projet
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ PROJECT_ID non défini. Usage: ./deploy.sh PROJECT_ID${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prérequis vérifiés${NC}"

# Configuration du projet
echo -e "${YELLOW}⚙️ Configuration du projet...${NC}"
gcloud config set project $PROJECT_ID

# Activation des APIs
echo -e "${YELLOW}🔧 Activation des APIs nécessaires...${NC}"
gcloud services enable cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    --quiet

# Configuration des permissions Cloud Build
echo -e "${YELLOW}🔐 Configuration des permissions...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Permissions Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/run.admin" \
    --quiet 2>/dev/null || echo "Permission déjà accordée"

# Permissions Service Account
gcloud iam service-accounts add-iam-policy-binding \
    $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser" \
    --quiet 2>/dev/null || echo "Permission déjà accordée"

echo -e "${GREEN}✅ Configuration terminée${NC}"

# Build et déploiement
echo -e "${YELLOW}🏗️ Lancement du build et déploiement...${NC}"
echo -e "${BLUE}Cette étape peut prendre 3-5 minutes...${NC}"

# Choisir la configuration optimisée si disponible
if [ -f "cloudbuild-optimized.yaml" ]; then
    echo -e "${BLUE}📋 Utilisation de la configuration optimisée...${NC}"
    gcloud builds submit --config cloudbuild-optimized.yaml .
else
    echo -e "${BLUE}📋 Utilisation de la configuration standard...${NC}"
    gcloud builds submit \
        --config cloudbuild.yaml \
        --substitutions=_REGION=$REGION,_SERVICE_NAME=$SERVICE_NAME \
        .
fi

# Vérification du déploiement
echo -e "${YELLOW}🔍 Vérification du déploiement...${NC}"

# Attendre que le service soit prêt
sleep 10

# Récupérer l'URL du service
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(status.url)" 2>/dev/null)

if [ -n "$SERVICE_URL" ]; then
    echo ""
    echo -e "${GREEN}🎉 Déploiement réussi !${NC}"
    echo -e "${GREEN}📍 URL du dashboard: ${SERVICE_URL}${NC}"
    echo ""
    echo -e "${BLUE}📊 Informations du service:${NC}"
    gcloud run services describe $SERVICE_NAME --region=$REGION --format="table(
        metadata.name,
        status.url,
        status.latestReadyRevisionName,
        spec.template.spec.containers[0].image
    )"
    echo ""
    echo -e "${BLUE}📈 Pour voir les logs:${NC}"
    echo -e "gcloud run services logs tail $SERVICE_NAME --region=$REGION"
    echo ""
    echo -e "${BLUE}🔄 Pour redéployer:${NC}"
    echo -e "./deploy.sh $PROJECT_ID"
    echo ""
else
    echo -e "${RED}❌ Erreur lors du déploiement${NC}"
    echo -e "${YELLOW}📝 Vérifiez les logs:${NC}"
    echo -e "gcloud builds log --region=$REGION"
    exit 1
fi

# Test de connectivité (optionnel)
echo -e "${YELLOW}🔍 Test de connectivité...${NC}"
if curl -s --head "$SERVICE_URL" | head -n 1 | grep -q "200 OK"; then
    echo -e "${GREEN}✅ Service accessible${NC}"
else
    echo -e "${YELLOW}⚠️ Service déployé mais pas encore accessible (peut prendre quelques secondes)${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Déploiement terminé avec succès !${NC}"
