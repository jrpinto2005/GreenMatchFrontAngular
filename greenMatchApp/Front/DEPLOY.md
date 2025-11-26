# Despliegue de GreenMatch Frontend a Google Cloud Run

Este documento describe cómo desplegar la aplicación Angular de GreenMatch a Google Cloud Run.

## Prerrequisitos

1. **Google Cloud SDK (gcloud)** instalado y configurado
2. **Node.js y npm** instalados
3. **Proyecto de Google Cloud** creado
4. **Facturación habilitada** en el proyecto

## Configuración Inicial

### 1. Instalar Google Cloud SDK

```bash
# macOS
brew install --cask google-cloud-sdk

# Linux/Windows - seguir instrucciones en:
# https://cloud.google.com/sdk/docs/install
```

### 2. Autenticarse con Google Cloud

```bash
gcloud auth login
```

### 3. Configurar el proyecto

```bash
# Reemplaza 'tu-project-id' con tu ID de proyecto real
gcloud config set project tu-project-id
```

## Métodos de Despliegue

### 🚀 Opción 1: Script Simplificado (RECOMENDADO)

El método más fácil usando Cloud Build automático:

```bash
./deploy-simple.sh
```

Este script:
- Te pedirá tu Project ID si no está configurado
- Habilitará las APIs necesarias automáticamente
- Construirá la aplicación Angular
- La desplegará usando `gcloud run deploy --source`

### Opción 2: Script con Docker (Requiere Docker)

1. **Inicia Docker Desktop**
2. **Edita el script de deploy**:
   ```bash
   nano deploy.sh
   ```
   Cambia `PROJECT_ID="your-project-id"` por tu ID de proyecto real.

3. **Ejecuta el script**:
   ```bash
   ./deploy.sh
   ```

### Opción 3: Cloud Build con archivo de configuración

```bash
gcloud builds submit --config cloudbuild.yaml
```

### Opción 4: Comandos Manuales Paso a Paso

1. **Construir la aplicación**:
   ```bash
   npm run build
   ```

2. **Desplegar directamente**:
   ```bash
   gcloud run deploy greenmatch-frontend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080 \
     --memory 512Mi
   ```

## Configuración de Entorno

La aplicación está configurada para usar el backend de producción:

- **Desarrollo**: `https://plant-backend-648842954513.us-central1.run.app` (environment.ts)
- **Producción**: `https://plant-backend-648842954513.us-central1.run.app` (environment.prod.ts)

## Arquitectura del Despliegue

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cloud Build   │───▶│ Container Registry│───▶│   Cloud Run     │
│                 │    │                  │    │                 │
│ - Build imagen  │    │ - Almacena imagen│    │ - Ejecuta app   │
│ - Run tests     │    │ - Versionado     │    │ - Manual scale  │
│ - Deploy        │    │                  │    │ - HTTPS         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Optimizaciones Incluidas

### Dockerfile Multi-stage
- **Build stage**: Compila la aplicación Angular
- **Production stage**: Sirve con Nginx optimizado

### Nginx Optimizado
- Compresión Gzip habilitada
- Headers de seguridad
- Cache para assets estáticos
- Fallback para rutas de Angular (SPA)
- Health check endpoint

### Cloud Run
- 512Mi de memoria
- 1 CPU
- Puerto 8080 (estándar Cloud Run)
- Sin autoscaling automático (configuración manual)

## Monitoreo y Logs

### Ver logs de la aplicación:
```bash
gcloud run services logs tail greenmatch-frontend --region us-central1
```

### Ver métricas:
```bash
gcloud run services describe greenmatch-frontend --region us-central1
```

## Troubleshooting

### Error: "Permission denied"
```bash
gcloud auth login
gcloud auth configure-docker
```

### Error: "Project not found"
```bash
gcloud config set project tu-project-id
gcloud projects list  # Para ver proyectos disponibles
```

### Error en build de Docker
```bash
# Limpiar cache de Docker
docker system prune -a

# Verificar que Docker esté corriendo
docker info
```

### La aplicación no carga correctamente
1. Verificar que la URL del backend en `environment.prod.ts` sea correcta
2. Revisar logs con `gcloud run services logs tail`
3. Verificar que el backend esté respondiendo

## URLs Importantes

Después del despliegue exitoso, tu aplicación estará disponible en:
```
https://greenmatch-frontend-[hash]-uc.a.run.app
```

## Actualizaciones

Para actualizar la aplicación:
1. Haz tus cambios en el código
2. Ejecuta nuevamente el script de deploy o Cloud Build
3. Cloud Run automáticamente desplegará la nueva versión

## Costos Estimados

Con el tier gratuito de Cloud Run:
- 2 millones de invocaciones/mes gratuitas
- 400,000 GB-segundos de memoria/mes gratuitas
- 200,000 vCPU-segundos/mes gratuitos

Para aplicaciones pequeñas a medianas, el costo es mínimo o gratuito.
