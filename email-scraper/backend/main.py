"""
API FastAPI para extraer correos electrónicos de URLs.
"""
import os
import tempfile
from pathlib import Path
from typing import Optional
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import aiofiles
from scraper import EmailScraper
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Email Scraper API",
    description="API para extraer correos electrónicos de URLs",
    version="1.0.0",
    docs_url="/docs",        # 👈 Habilita la interfaz Swagger (como en tu otro proyecto)
    redoc_url="/redoc"       # 👈 (Opcional) Interfaz alternativa de documentación
)

# Configurar CORS para permitir conexiones desde comextoolbox.com
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://comextoolbox.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Límite de tamaño de archivo: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Directorio temporal para archivos
TEMP_DIR = Path(tempfile.gettempdir()) / "email_scraper"
TEMP_DIR.mkdir(exist_ok=True)


@app.get("/")
async def root():
    """Endpoint raíz."""
    return {
        "message": "Email Scraper API",
        "version": "1.0.0",
        "endpoints": {
            "/upload": "POST - Subir archivo Excel o CSV con URLs",
            "/health": "GET - Estado del servidor"
        }
    }


@app.get("/health")
async def health():
    """Endpoint de salud."""
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Endpoint para subir un archivo Excel o CSV con URLs.
    
    Procesa el archivo, extrae correos de cada URL y devuelve un Excel actualizado.
    """
    try:
        # Validar tipo de archivo
        if not file.filename:
            raise HTTPException(status_code=400, detail="Nombre de archivo no proporcionado")
        
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ['.xlsx', '.xls', '.csv']:
            raise HTTPException(
                status_code=400, 
                detail="Formato de archivo no soportado. Use .xlsx, .xls o .csv"
            )
        
        # Leer contenido del archivo
        content = await file.read()
        
        # Validar tamaño
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Archivo demasiado grande. Máximo: {MAX_FILE_SIZE / 1024 / 1024} MB"
            )
        
        # Guardar temporalmente
        temp_input = TEMP_DIR / f"input_{file.filename}"
        async with aiofiles.open(temp_input, 'wb') as f:
            await f.write(content)
        
        logger.info(f"Archivo recibido: {file.filename} ({len(content)} bytes)")
        
        # Leer archivo con pandas
        try:
            if file_ext == '.csv':
                df = pd.read_csv(temp_input, encoding='utf-8')
            else:
                df = pd.read_excel(temp_input)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error al leer el archivo: {str(e)}"
            )
        
        # Buscar columna con URLs (buscar columnas comunes)
        url_column = None
        possible_names = ['url', 'urls', 'website', 'sitio', 'link', 'enlace', 'web']
        
        for col in df.columns:
            col_lower = str(col).lower().strip()
            if col_lower in possible_names or 'url' in col_lower:
                url_column = col
                break
        
        # Si no se encuentra, usar la primera columna
        if url_column is None:
            url_column = df.columns[0]
            logger.warning(f"No se encontró columna de URLs, usando: {url_column}")
        
        # Extraer URLs
        urls = df[url_column].dropna().astype(str).tolist()
        urls = [url.strip() for url in urls if url.strip() and url.strip().lower() != 'nan']
        
        if not urls:
            raise HTTPException(
                status_code=400,
                detail="No se encontraron URLs válidas en el archivo"
            )
        
        logger.info(f"Procesando {len(urls)} URLs")
        
        # Inicializar scraper
        scraper = EmailScraper(delay=1.0, timeout=10)
        
        # Procesar URLs (usar asyncio para el scraper)
        import asyncio
        results = await scraper.scrape_urls(urls)
        
        # Agregar columna de correos al DataFrame
        df['Correos'] = df[url_column].map(results).fillna('')
        
        # Generar archivo de salida
        output_filename = f"resultado_{Path(file.filename).stem}.xlsx"
        temp_output = TEMP_DIR / output_filename
        
        # Guardar Excel
        df.to_excel(temp_output, index=False, engine='openpyxl')
        
        logger.info(f"Archivo generado: {output_filename}")
        
        # Limpiar archivo temporal de entrada
        temp_input.unlink(missing_ok=True)
        
        # Devolver archivo
        return FileResponse(
            path=str(temp_output),
            filename=output_filename,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en upload: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")


@app.get("/api/status")
async def get_status():
    """Endpoint para verificar el estado del procesamiento."""
    return {
        "status": "ready",
        "message": "Servidor listo para procesar archivos"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

