# PDF → Excel Contact Extractor

Servicio web para convertir PDFs con listados de contactos en un Excel con columnas: Nombre, Telefono, Correos, Web.

## Stack Tecnológico

- **Backend**: FastAPI (Python)
- **Frontend**: Next.js (React) + TypeScript
- **Infraestructura**: Docker + docker-compose + Nginx (reverse proxy)

## Instalación Local

### Con Docker (Recomendado)

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd "CONVERTIDOR PDF A EXCEL"
```

2. Configura las variables de entorno:
```bash
cp .env.example .env
# Edita .env con tus valores
```

3. Levanta todos los servicios:
```bash
docker-compose up -d
```

4. Accede a la aplicación:
- Frontend: http://localhost
- Backend API: http://localhost/api

### Sin Docker (Desarrollo)

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
MAX_UPLOAD_MB=30          # Límite de tamaño de archivos PDF
KEEP_EMPTY=true           # Mantener contactos sin email/teléfono
ONLY_WITH_EMAIL=false     # Solo contactos con email
ONLY_WITH_PHONE=false     # Solo contactos con teléfono
```

## Comandos Útiles

### Docker
```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Reconstruir imágenes
docker-compose up -d --build
```

### Desarrollo
```bash
# Backend con hot reload
cd backend && uvicorn app:app --reload

# Frontend con hot reload
cd frontend && npm run dev

# Tests del backend
cd backend && python -m pytest tests/
```

## Despliegue en Producción

### GitHub + VPS

1. **Subir a GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **En tu VPS**:
```bash
git clone <tu-repositorio>
cd "CONVERTIDOR PDF A EXCEL"
cp .env.example .env
# Edita .env con valores de producción
docker-compose up -d
```

### Configuración Nginx + SSL

Para producción, configura un dominio y SSL:

1. **Nginx con SSL** (usando Certbot):
```bash
# Instala Certbot
sudo apt install certbot python3-certbot-nginx

# Obtén certificado SSL
sudo certbot --nginx -d tu-dominio.com
```

2. **Configuración de dominio en .env**:
```bash
DOMAIN=tu-dominio.com
```

## Funcionalidades

- ✅ Extracción de texto de PDFs (pdfplumber + PyPDF2)
- ✅ Detección automática de emails, teléfonos y URLs
- ✅ Consolidación de duplicados por nombre
- ✅ Filtrado de contactos (solo con email/teléfono)
- ✅ Exportación a Excel (.xlsx)
- ✅ Interfaz drag & drop
- ✅ Validación de archivos PDF
- ✅ Límite de tamaño configurable

## API Endpoints

### POST /api/convert

Convierte PDFs a Excel.

**Parámetros**:
- `files`: Archivos PDF (multipart/form-data)
- `keep_empty`: boolean - Mantener contactos vacíos
- `only_with_email`: boolean - Solo contactos con email
- `only_with_phone`: boolean - Solo contactos con teléfono

**Respuesta**: Archivo Excel (.xlsx)

## Estructura del Proyecto

```
CONVERTIDOR PDF A EXCEL/
├─ README.md
├─ docker-compose.yml
├─ .env.example
├─ nginx/
│  └─ nginx.conf
├─ backend/
│  ├─ app.py
│  ├─ parser.py
│  ├─ requirements.txt
│  ├─ Dockerfile
│  └─ tests/
│     └─ test_parser.py
└─ frontend/
   ├─ package.json
   ├─ next.config.js
   ├─ tsconfig.json
   ├─ Dockerfile
   └─ app/
      └─ tools/
         └─ pdf-extractor/
            └─ page.tsx
```

## Privacidad y RGPD

- Los PDFs se procesan únicamente en memoria
- No se almacenan archivos de forma persistente
- Los datos se eliminan automáticamente después del procesamiento
- Si en el futuro se implementa almacenamiento, se notificará a los usuarios

## Soporte

Para reportar problemas o solicitar funcionalidades, abre un issue en GitHub.
