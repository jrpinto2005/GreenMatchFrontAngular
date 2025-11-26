#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Desplegando GreenMatch Frontend a Cloud Run (Source Deploy)${NC}"

# Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI no está instalado${NC}"
    exit 1
fi

# Obtener o solicitar Project ID
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

# Crear un Dockerfile temporal optimizado para Cloud Run source deploy
cat > Dockerfile.tmp << 'EOF'
FROM node:18-alpine

# Instalar serve globalmente
RUN npm install -g serve@14

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos construidos
COPY dist/front/browser ./

# Exponer puerto 8080
EXPOSE 8080

# Comando para servir la aplicación
CMD ["serve", "-s", ".", "-l", "8080"]
EOF

# Crear .gcloudignore para optimizar el upload
cat > .gcloudignore << 'EOF'
node_modules/
.git/
.github/
.vscode/
.angular/
*.md
.DS_Store
.editorconfig
coverage/
e2e/
karma.conf.js
protractor.conf.js
*.spec.ts
*.test.ts
src/
EOF

# Desplegar a Cloud Run
echo -e "${YELLOW}🚀 Desplegando a Cloud Run...${NC}"
gcloud run deploy greenmatch-frontend \
    --source . \
    --dockerfile Dockerfile.tmp \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --set-env-vars NODE_ENV=production \
    --quiet

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Despliegue exitoso!${NC}"
    echo ""
    
    # Obtener la URL del servicio
    SERVICE_URL=$(gcloud run services describe greenmatch-frontend --region us-central1 --format 'value(status.url)' 2>/dev/null)
    if [ ! -z "$SERVICE_URL" ]; then
        echo -e "${GREEN}🌐 Tu aplicación está disponible en:${NC}"
        echo -e "${BLUE}   $SERVICE_URL${NC}"
        echo ""
        echo -e "${YELLOW}💡 Importante: Asegúrate de que el backend permita este origen en CORS:${NC}"
        echo -e "${BLUE}   $SERVICE_URL${NC}"
    fi
else
    echo -e "${RED}❌ Error durante el despliegue${NC}"
    exit 1
fi

# Limpiar archivos temporales
rm -f Dockerfile.tmp .gcloudignore

echo -e "${GREEN}🎉 ¡Despliegue completado!${NC}"
