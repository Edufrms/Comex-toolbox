import os, io
from typing import List
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import pandas as pd

from parser import read_pdf_text, parse_text_to_rows

MAX_MB = int(os.getenv("MAX_UPLOAD_MB", "30"))

app = FastAPI(title="PDF → Excel Contact Extractor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ajusta a tu dominio en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/convert")
async def convert(
    files: List[UploadFile] = File(...),
    keep_empty: bool = Query(os.getenv("KEEP_EMPTY", "true").lower()=="true"),
    only_with_email: bool = Query(os.getenv("ONLY_WITH_EMAIL","false").lower()=="true"),
    only_with_phone: bool = Query(os.getenv("ONLY_WITH_PHONE","false").lower()=="true"),
):
    if not files:
        return JSONResponse({"error":"No files provided"}, status_code=400)

    frames = []
    for f in files:
        if not f.filename.lower().endswith(".pdf"):
            return JSONResponse({"error": f"Solo se aceptan PDF: {f.filename}"}, status_code=400)
        data = await f.read()
        if len(data) > MAX_MB * 1024 * 1024:
            return JSONResponse({"error": f"{f.filename} supera el límite de {MAX_MB}MB"}, status_code=413)
        text = read_pdf_text(data)
        if not text.strip():
            continue
        df = parse_text_to_rows(text)
        df["Fuente"] = f.filename
        frames.append(df)

    if not frames:
        return JSONResponse({"error":"No se pudo extraer texto de los PDFs"}, status_code=422)

    out = pd.concat(frames, ignore_index=True)

    if not keep_empty:
        out = out[(out["Correos"].str.strip() != "") | (out["Telefono"].str.strip() != "")]
    if only_with_email:
        out = out[out["Correos"].str.strip() != ""]
    if only_with_phone:
        out = out[out["Telefono"].str.strip() != ""]

    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="xlsxwriter") as w:
        out.to_excel(w, index=False, sheet_name="Contactos")
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition":"attachment; filename=contactos.xlsx"}
    )
