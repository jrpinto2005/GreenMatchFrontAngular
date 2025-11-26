#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Desplegando a Firebase Hosting (Alternativa)${NC}"

# Verificar que Firebase CLI esté instalado
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚙️ Firebase CLI no está instalado. Instalando...${NC}"
    npm install -g firebase-tools
fi

# Login a Firebase si es necesario
echo -e "${YELLOW}🔐 Verificando autenticación de Firebase...${NC}"
firebase login --no-localhost

# Inicializar proyecto si no existe firebase.json
if [ ! -f "firebase.json" ]; then
    echo -e "${YELLOW}📋 Inicializando proyecto Firebase...${NC}"
    firebase init hosting
fi

# Construir la aplicación
echo -e "${YELLOW}🔨 Construyendo aplicación Angular...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir la aplicación Angular${NC}"
    exit 1
fi

# Crear firebase.json si no existe
cat > firebase.json << 'EOF'
{
  "hosting": {
    "public": "dist/front/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
EOF

# Desplegar a Firebase
echo -e "${YELLOW}🚀 Desplegando a Firebase Hosting...${NC}"
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Despliegue exitoso!${NC}"
    echo ""
    echo -e "${YELLOW}💡 IMPORTANTE: Agrega la URL de Firebase a las origins del backend${NC}"
    echo -e "${BLUE}   Ejemplo: \"https://tu-proyecto.web.app\"${NC}"
else
    echo -e "${RED}❌ Error durante el despliegue${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 ¡Despliegue a Firebase completado!${NC}"
