#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ID=""
SERVICE_NAME="greenmatch-frontend"
REGION="us-central1"

echo -e "${GREEN}🚀 GreenMatch Frontend - Despliegue a Cloud Run${NC}"
echo -e "${BLUE}=================================================${NC}"

# Solicitar Project ID si no está configurado
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}📋 Introduce tu Google Cloud Project ID:${NC}"
    read -p "Project ID: " PROJECT_ID
    
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ Project ID es requerido${NC}"
        exit 1
    fi
fi

# Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI no está instalado.${NC}"
    echo -e "${YELLOW}💡 Instálalo desde: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

# Configurar el proyecto
echo -e "${YELLOW}📋 Configurando proyecto: $PROJECT_ID${NC}"
gcloud config set project $PROJECT_ID

# Verificar autenticación
echo -e "${YELLOW}🔐 Verificando autenticación...${NC}"
if ! gcloud auth list --filter="status:ACTIVE" --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}🔓 Necesitas autenticarte con Google Cloud${NC}"
    gcloud auth login
fi

# Habilitar APIs necesarias
echo -e "${YELLOW}🔧 Habilitando APIs necesarias...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Construir aplicación Angular
echo -e "${YELLOW}🔨 Construyendo aplicación Angular...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir la aplicación Angular${NC}"
    exit 1
fi

# Desplegar a Cloud Run usando source deploy (más simple)
echo -e "${YELLOW}🚀 Desplegando a Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --set-env-vars NODE_ENV=production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Despliegue exitoso!${NC}"
    echo -e "${BLUE}=================================================${NC}"
    
    # Obtener la URL del servicio
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' 2>/dev/null)
    if [ ! -z "$SERVICE_URL" ]; then
        echo -e "${GREEN}🌐 Tu aplicación está disponible en:${NC}"
        echo -e "${BLUE}   $SERVICE_URL${NC}"
        echo ""
        echo -e "${YELLOW}💡 Consejos:${NC}"
        echo -e "   • Puedes ver los logs con: ${BLUE}gcloud run services logs tail $SERVICE_NAME --region $REGION${NC}"
        echo -e "   • Para actualizar, simplemente ejecuta este script de nuevo"
    else
        echo -e "${YELLOW}⚠️  No se pudo obtener la URL automáticamente, pero el deploy fue exitoso${NC}"
    fi
    echo -e "${BLUE}=================================================${NC}"
else
    echo -e "${RED}❌ Error durante el despliegue${NC}"
    echo -e "${YELLOW}💡 Revisa los logs arriba para más detalles${NC}"
    exit 1
fi
