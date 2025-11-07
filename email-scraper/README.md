# Email Scraper - Extracción de Correos desde URLs

Aplicación web completa (frontend + backend) para extraer correos electrónicos de contacto de páginas web listadas en archivos Excel o CSV.

## 🚀 Características

- ✅ Subida de archivos Excel (.xlsx, .xls) o CSV
- ✅ Extracción automática de correos de páginas web
- ✅ Búsqueda en rutas comunes (/contact, /about, etc.)
- ✅ Descarga de Excel con columna adicional de correos
- ✅ Interfaz moderna y responsive con TailwindCSS
- ✅ API REST con FastAPI
- ✅ CORS configurado para integración con comextoolbox.com

## 📁 Estructura del Proyecto

```
email-scraper/
├── backend/
│   ├── main.py              # API FastAPI principal
│   ├── scraper.py           # Lógica de extracción de correos
│   └── requirements.txt     # Dependencias Python
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Componente principal
│   │   ├── components/      # Componentes React
│   │   └── utils/           # Utilidades
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🛠️ Instalación y Configuración

### Backend

1. **Navegar a la carpeta backend:**
   ```bash
   cd backend
   ```

2. **Crear entorno virtual (recomendado):**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Ejecutar el servidor:**
   ```bash
   python main.py
   ```
   
   O con uvicorn directamente:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

   El servidor estará disponible en `http://localhost:8000`

### Frontend

1. **Navegar a la carpeta frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variable de entorno (opcional):**
   
   Crear archivo `.env` en la carpeta `frontend`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

5. **Construir para producción:**
   ```bash
   npm run build
   ```

   Los archivos estáticos se generarán en la carpeta `dist/`

## 🌐 Despliegue

### Backend (Render, Railway, o VPS)

#### Opción 1: Render

1. Crear un nuevo servicio "Web Service" en Render
2. Conectar tu repositorio Git
3. Configurar:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3
4. Añadir variable de entorno si es necesario

#### Opción 2: Railway

1. Conectar repositorio en Railway
2. Railway detectará automáticamente Python
3. Asegúrate de que `requirements.txt` esté en la raíz del backend
4. Railway asignará automáticamente el puerto

#### Opción 3: VPS (Ubuntu/Debian)

1. **Instalar dependencias del sistema:**
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip python3-venv nginx
   ```

2. **Clonar o subir el proyecto:**
   ```bash
   cd /var/www
   # Subir archivos del backend aquí
   ```

3. **Configurar entorno virtual:**
   ```bash
   cd email-scraper/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Crear servicio systemd:**
   
   Crear archivo `/etc/systemd/system/email-scraper.service`:
   ```ini
   [Unit]
   Description=Email Scraper API
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/email-scraper/backend
   Environment="PATH=/var/www/email-scraper/backend/venv/bin"
   ExecStart=/var/www/email-scraper/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

5. **Iniciar servicio:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable email-scraper
   sudo systemctl start email-scraper
   ```

6. **Configurar Nginx como reverse proxy:**
   
   Crear archivo `/etc/nginx/sites-available/email-scraper`:
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   Activar:
   ```bash
   sudo ln -s /etc/nginx/sites-available/email-scraper /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Frontend (Vercel, Netlify)

#### Opción 1: Vercel

1. Instalar Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Desde la carpeta `frontend`:
   ```bash
   vercel
   ```

3. O conectar repositorio en vercel.com:
   - Importar proyecto
   - Configurar:
     - **Framework Preset:** Vite
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

4. Añadir variable de entorno:
   - `VITE_API_URL`: URL de tu backend desplegado

#### Opción 2: Netlify

1. Desde la carpeta `frontend`:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

2. O conectar repositorio en netlify.com:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`

3. Añadir variable de entorno:
   - `VITE_API_URL`: URL de tu backend desplegado

### Integración con comextoolbox.com

1. **Actualizar CORS en el backend:**
   
   En `backend/main.py`, asegúrate de que `comextoolbox.com` esté en la lista de orígenes permitidos:
   ```python
   allow_origins=[
       "https://comextoolbox.com",
       "https://www.comextoolbox.com",
       # ... otros orígenes
   ]
   ```

2. **Configurar variable de entorno en el frontend:**
   
   Si el frontend está integrado en comextoolbox.com, crear archivo `.env.production`:
   ```env
   VITE_API_URL=https://tu-backend-url.com
   ```

3. **Usar la API desde tu sitio:**
   ```javascript
   const formData = new FormData();
   formData.append('file', file);
   
   const response = await fetch('https://tu-backend-url.com/api/upload', {
     method: 'POST',
     body: formData
   });
   ```

## 📝 Uso

1. **Preparar archivo Excel o CSV:**
   - El archivo debe contener una columna con URLs
   - Nombres de columna sugeridos: `url`, `urls`, `website`, `sitio`, `link`
   - Si no se encuentra, se usará la primera columna

2. **Subir archivo:**
   - Acceder a la aplicación web
   - Seleccionar archivo Excel o CSV
   - Hacer clic en "Procesar archivo"

3. **Esperar procesamiento:**
   - El sistema visitará cada URL
   - Buscará correos en la página principal y rutas comunes
   - Se mostrará una barra de progreso

4. **Descargar resultados:**
   - Una vez completado, aparecerá el botón "Descargar Excel"
   - El archivo incluirá una columna adicional "Correos" con los correos encontrados

## ⚙️ Configuración Avanzada

### Variables de Entorno

**Backend (.env):**
```env
# Opcional: Configurar puerto
PORT=8000

# Opcional: Configurar delay entre peticiones (segundos)
SCRAPER_DELAY=1.0

# Opcional: Timeout de peticiones (segundos)
SCRAPER_TIMEOUT=10
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000
```

### Límites y Seguridad

- **Tamaño máximo de archivo:** 10 MB
- **Delay entre peticiones:** 1 segundo (configurable)
- **Timeout por petición:** 10 segundos
- **Máximo de URLs recomendado:** 1,000 por lote

## 🐛 Solución de Problemas

### Backend no inicia

- Verificar que Python 3.8+ esté instalado
- Verificar que todas las dependencias estén instaladas
- Revisar logs de errores

### Frontend no se conecta al backend

- Verificar que `VITE_API_URL` esté configurado correctamente
- Verificar CORS en el backend
- Verificar que el backend esté ejecutándose

### No se encuentran correos

- Algunos sitios pueden bloquear bots
- Verificar que las URLs sean accesibles
- Algunos correos pueden estar en imágenes (no extraíbles)

## 📄 Licencia

Este proyecto es de uso libre para fines comerciales y personales.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📧 Soporte

Para soporte, contacta a través de comextoolbox.com

