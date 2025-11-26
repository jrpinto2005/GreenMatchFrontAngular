#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Desplegando GreenMatch Frontend a Cloud Run${NC}"

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

# Reemplazar el Dockerfile original temporalmente
mv Dockerfile Dockerfile.backup 2>/dev/null || true

# Crear Dockerfile optimizado
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Instalar serve globalmente para servir archivos estáticos
RUN npm install -g serve@14

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos construidos de Angular
COPY dist/front/browser ./

# Crear usuario no-root para mayor seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto 8080 (requerido por Cloud Run)
EXPOSE 8080

# Comando para servir la aplicación
CMD ["serve", "-s", ".", "-l", "8080", "-n"]
EOF

# Desplegar a Cloud Run usando el método source
echo -e "${YELLOW}🚀 Desplegando a Cloud Run...${NC}"
gcloud run deploy greenmatch-frontend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --set-env-vars NODE_ENV=production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Despliegue exitoso!${NC}"
    echo ""
    
    # Obtener la URL del servicio
    SERVICE_URL=$(gcloud run services describe greenmatch-frontend --region us-central1 --format 'value(status.url)' 2>/dev/null)
    if [ ! -z "$SERVICE_URL" ]; then
        echo -e "${GREEN}🌐 Tu aplicación está disponible en:${NC}"
        echo -e "${BLUE}   $SERVICE_URL${NC}"
        echo ""
        echo -e "${YELLOW}💡 IMPORTANTE: Agrega esta URL a las origins permitidas en tu backend:${NC}"
        echo -e "${BLUE}   \"$SERVICE_URL\"${NC}"
        echo ""
        echo -e "${YELLOW}📝 Las origins del backend deberían incluir:${NC}"
        echo -e "${BLUE}   origins = [${NC}"
        echo -e "${BLUE}       \"http://localhost:4200\",${NC}"
        echo -e "${BLUE}       \"http://127.0.0.1:4200\",${NC}"
        echo -e "${BLUE}       \"http://192.168.0.127:4200\",${NC}"
        echo -e "${BLUE}       \"$SERVICE_URL\"${NC}"
        echo -e "${BLUE}   ]${NC}"
    fi
else
    echo -e "${RED}❌ Error durante el despliegue${NC}"
    # Restaurar Dockerfile original
    mv Dockerfile.backup Dockerfile 2>/dev/null || true
    exit 1
fi

# Restaurar Dockerfile original
mv Dockerfile.backup Dockerfile 2>/dev/null || true

echo ""
echo -e "${GREEN}🎉 ¡Despliegue completado exitosamente!${NC}"
