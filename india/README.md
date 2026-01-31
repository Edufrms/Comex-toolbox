# India – Mapa de calor por sectores

Web app estática (React + TypeScript) que muestra un mapa de India con **heatmap** basado en coordenadas (lat, lon) de empresas por sector. Incluye filtros por sector (multi-selección), slider de intensidad y carga de datos desde CSV mediante un manifest JSON.

## Requisitos

- **Node.js** (versión 18 o superior). Si no lo tienes:
  - **Windows**: Descarga el instalador LTS desde [nodejs.org](https://nodejs.org/) y ejecútalo.
  - **Mac**: `brew install node` o descarga desde nodejs.org.
  - **Linux**: `sudo apt install nodejs npm` (Ubuntu/Debian) o equivalente.

## Instalación y ejecución

1. **Abrir terminal** en la carpeta del proyecto (por ejemplo `Desktop\India` en Windows o `Desktop/India` en Mac/Linux).

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Arrancar la app en modo desarrollo**
   ```bash
   npm run dev
   ```
   Abre el navegador en la URL que muestre Vite (normalmente `http://localhost:5173`).

## Cómo actualizar datos (sin tocar código)

1. **Añadir o cambiar sectores**
   - Coloca tus archivos CSV en la carpeta **`public/data/`**.
   - Cada CSV debe tener cabecera: `latitude,longitude` (o `lat,lon`).
   - Edita **`public/data/manifest.json`** y añade o modifica entradas con este formato:
     ```json
     [
       {"id":"wine","label":"Vino y espirituosos","file":"wine.csv"},
       {"id":"automotive","label":"Automoción","file":"automotive.csv"}
     ]
     ```
   - `id`: identificador único (sin espacios).
   - `label`: texto que verá el usuario en los filtros.
   - `file`: nombre del CSV dentro de `public/data/`.

2. **Reinicia** `npm run dev` si ya estaba corriendo (o recarga la página si los archivos ya estaban en `public/data/`).

La app lee `manifest.json` al arrancar, construye la lista de sectores y carga los CSV seleccionados. Si eliges varios sectores, el heatmap combina todos los puntos (con deduplicación por coordenadas).

## Publicar en GitHub Pages

1. **Crea un repositorio** en GitHub con el nombre que quieras (por ejemplo `India`). Si el nombre es **India**, la app está configurada para usarlo como base path.

2. **Sube el proyecto**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USUARIO/India.git
   git branch -M main
   git push -u origin main
   ```

3. **Habilitar GitHub Pages**
   - En el repositorio: **Settings** → **Pages**.
   - En **Source** elige **GitHub Actions** (no “Deploy from a branch”).

4. **Build para Pages (base path correcto)**
   - El workflow `.github/workflows/deploy.yml` hace el build con `GITHUB_PAGES=true` y despliega en Pages.
   - Tras un push a `main`, el workflow se ejecuta y la app quedará en `https://TU_USUARIO.github.io/India/`.

5. **Build manual** (opcional, para probar el build como en Pages):
   - **Windows (PowerShell):**  
     `$env:GITHUB_PAGES='true'; npm run build`
   - **Mac/Linux:**  
     `GITHUB_PAGES=true npm run build`  
   Los archivos listos para subir estarán en la carpeta `dist/`.

## Estructura del proyecto

```
India/
├── public/
│   └── data/
│       ├── manifest.json    ← Lista de sectores y archivos CSV
│       ├── wine.csv
│       ├── automotive.csv
│       └── pharma.csv
├── src/
│   ├── components/
│   │   ├── FilterPanel.tsx
│   │   ├── HeatmapLayer.tsx
│   │   └── MapView.tsx
│   ├── hooks/
│   │   ├── useManifest.ts
│   │   └── useSectorData.ts
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   └── leaflet-heat.d.ts
├── .github/workflows/deploy.yml
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Comandos útiles

| Comando        | Descripción                          |
|----------------|--------------------------------------|
| `npm install`  | Instalar dependencias                |
| `npm run dev`  | Servidor de desarrollo               |
| `npm run build`| Build para producción (base `/`)     |
| `npm run preview` | Previsualizar build local         |

Para GitHub Pages el workflow usa `GITHUB_PAGES=true` en el build y la base path `/India/`.
