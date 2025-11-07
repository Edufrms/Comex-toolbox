# 🚀 Inicio Rápido

Guía rápida para poner en marcha la aplicación en desarrollo local.

## Backend (5 minutos)

```bash
# 1. Ir a la carpeta backend
cd backend

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Ejecutar servidor
python main.py
```

El backend estará en: `http://localhost:8000`

## Frontend (3 minutos)

```bash
# 1. Ir a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. (Opcional) Crear archivo .env
echo "VITE_API_URL=http://localhost:8000" > .env

# 4. Ejecutar en desarrollo
npm run dev
```

El frontend estará en: `http://localhost:5173`

## ✅ Verificar que funciona

1. Abre `http://localhost:5173` en tu navegador
2. Sube un archivo Excel o CSV con una columna de URLs
3. Haz clic en "Procesar archivo"
4. Espera a que termine el procesamiento
5. Descarga el Excel con los correos encontrados

## 📝 Formato del archivo de entrada

Tu archivo Excel o CSV debe tener una columna con URLs. Nombres sugeridos:
- `url`
- `urls`
- `website`
- `sitio`
- `link`

Si no encuentra ninguna de estas, usará la primera columna.

## 🐛 Problemas comunes

**Backend no inicia:**
- Verifica que Python 3.8+ esté instalado: `python --version`
- Verifica que las dependencias estén instaladas: `pip list`

**Frontend no se conecta:**
- Verifica que el backend esté corriendo en el puerto 8000
- Verifica el archivo `.env` en la carpeta frontend
- Abre la consola del navegador (F12) para ver errores

**No encuentra correos:**
- Algunos sitios bloquean bots
- Verifica que las URLs sean accesibles
- Algunos correos pueden estar en imágenes (no extraíbles)

