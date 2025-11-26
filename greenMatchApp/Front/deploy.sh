#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ID="your-project-id"  # Cambiar por tu Project ID
SERVICE_NAME="greenmatch-frontend"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo -e "${GREEN}🚀 Iniciando despliegue de GreenMatch Frontend a Cloud Run${NC}"

# Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI no está instalado. Por favor instálalo primero.${NC}"
    exit 1
fi

# Verificar que Docker esté corriendo
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo. Por favor inicia Docker primero.${NC}"
    exit 1
fi

# Configurar el proyecto si no está configurado
echo -e "${YELLOW}📋 Configurando proyecto...${NC}"
gcloud config set project $PROJECT_ID

# Habilitar APIs necesarias
echo -e "${YELLOW}🔧 Habilitando APIs necesarias...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Construir la imagen
echo -e "${YELLOW}🔨 Construyendo imagen Docker...${NC}"
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir la imagen Docker${NC}"
    exit 1
fi

# Configurar Docker para usar gcloud como helper de credenciales
echo -e "${YELLOW}🔐 Configurando autenticación Docker...${NC}"
gcloud auth configure-docker

# Subir la imagen a Container Registry
echo -e "${YELLOW}📤 Subiendo imagen a Container Registry...${NC}"
docker push $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al subir la imagen${NC}"
    exit 1
fi

# Desplegar a Cloud Run
echo -e "${YELLOW}🚀 Desplegando a Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --set-env-vars NODE_ENV=production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Despliegue exitoso!${NC}"
    
    # Obtener la URL del servicio
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
    echo -e "${GREEN}🌐 Tu aplicación está disponible en: $SERVICE_URL${NC}"
else
    echo -e "${RED}❌ Error durante el despliegue${NC}"
    exit 1
fi
