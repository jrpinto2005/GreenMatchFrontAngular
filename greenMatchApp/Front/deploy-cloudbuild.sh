#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Desplegando GreenMatch Frontend a Cloud Run (Método Simple)${NC}"

# Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI no está instalado${NC}"
    exit 1
fi

# Obtener Project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}📋 Introduce tu Google Cloud Project ID:${NC}"
    read -p "Project ID: " PROJECT_ID
    gcloud config set project $PROJECT_ID
fi

echo -e "${BLUE}📋 Usando proyecto: $PROJECT_ID${NC}"

# Habilitar APIs necesarias
echo -e "${YELLOW}⚙️ Habilitando APIs necesarias...${NC}"
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet

# Construir la aplicación Angular
echo -e "${YELLOW}🔨 Construyendo aplicación Angular...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir la aplicación Angular${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build exitoso${NC}"

# Verificar que existe el directorio de build
if [ ! -d "dist/front/browser" ]; then
    echo -e "${RED}❌ No se encontró el directorio de build dist/front/browser${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Archivos a desplegar:${NC}"
ls -la dist/front/browser/

# Usar Cloud Build para construir y desplegar
echo -e "${YELLOW}🚀 Desplegando a Cloud Run usando Cloud Build...${NC}"

# Crear un cloudbuild.yaml temporal
cat > cloudbuild.temp.yaml << EOF
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/\$PROJECT_ID/greenmatch-frontend:latest', '.']
    
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/\$PROJECT_ID/greenmatch-frontend:latest']
    
  # Deploy container image to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
    - 'run'
    - 'deploy'
    - 'greenmatch-frontend'
    - '--image'
    - 'gcr.io/\$PROJECT_ID/greenmatch-frontend:latest'
    - '--region'
    - 'us-central1'
    - '--platform'
    - 'managed'
    - '--allow-unauthenticated'
    - '--port'
    - '8080'
    - '--memory'
    - '512Mi'
    - '--cpu'
    - '1'

images:
- 'gcr.io/\$PROJECT_ID/greenmatch-frontend:latest'

timeout: '1200s'
EOF

# Ejecutar Cloud Build
gcloud builds submit --config cloudbuild.temp.yaml .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Despliegue exitoso!${NC}"
    echo ""
    
    # Obtener la URL del servicio
    SERVICE_URL=$(gcloud run services describe greenmatch-frontend --region us-central1 --format 'value(status.url)' 2>/dev/null)
    if [ ! -z "$SERVICE_URL" ]; then
        echo -e "${GREEN}🌐 Tu aplicación está disponible en:${NC}"
        echo -e "${BLUE}   $SERVICE_URL${NC}"
        echo ""
        echo -e "${YELLOW}💡 IMPORTANTE: Agrega esta URL a las origins del backend:${NC}"
        echo -e "${BLUE}origins = [${NC}"
        echo -e "${BLUE}    \"http://localhost:4200\",${NC}"
        echo -e "${BLUE}    \"http://127.0.0.1:4200\",${NC}"
        echo -e "${BLUE}    \"http://192.168.0.127:4200\",${NC}"
        echo -e "${BLUE}    \"$SERVICE_URL\"${NC}"
        echo -e "${BLUE}]${NC}"
    fi
else
    echo -e "${RED}❌ Error durante el despliegue${NC}"
    rm -f cloudbuild.temp.yaml
    exit 1
fi

# Limpiar archivo temporal
rm -f cloudbuild.temp.yaml

echo ""
echo -e "${GREEN}🎉 ¡Despliegue completado exitosamente!${NC}"
