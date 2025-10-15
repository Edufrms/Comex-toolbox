import io, re
from typing import List, Dict
import pandas as pd

# --- Expresiones regulares ---
PHONE_RE = re.compile(r'(?:\+\d{1,3}\s?)?(?:\d[\s\-]?){6,}')
EMAIL_RE = re.compile(r'[\w.\-\+]+@[\w\.-]+\.[A-Za-z]{2,}')
URL_RE   = re.compile(r'https?://[^\s,;]+')
HEADER_PREFIXES = (
    "Email List Page", "Download CSV", "Download XLSX", "Current Plan:",
    "Name Phone Email Website", "Name Phone Email"
)

# --- Funciones auxiliares ---
def merge_unique(items: List[str]) -> str:
    parts, seen = [], set()
    for item in items:
        if not isinstance(item, str) or not item.strip():
            continue
        # Separar por coma o punto y coma al agrupar
        for p in re.split(r'[;,]\s*', item):
            if p and p not in seen:
                parts.append(p.strip())
                seen.add(p.strip())
    return "; ".join(parts)

def read_pdf_text(file_bytes: bytes) -> str:
    """Extrae texto de un PDF usando pdfplumber o PyPDF2"""
    pages = []
    try:
        import pdfplumber
        from io import BytesIO
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            for p in pdf.pages:
                pages.append(p.extract_text() or "")
    except Exception:
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                pages.append(page.extract_text() or "")
        except Exception:
            return ""
    return "\n".join(pages)

# --- Función principal ---
def parse_text_to_rows(raw_text: str) -> pd.DataFrame:
    """
    Convierte el texto plano extraído del PDF en una tabla estructurada
    respetando el orden Name | Phone | Email | Website | Address
    """
    lines = [re.sub(r'\s+', ' ', ln).strip() for ln in raw_text.splitlines()]
    lines = [ln for ln in lines if ln and not any(ln.startswith(h) for h in HEADER_PREFIXES)]

    rows: List[Dict[str, str]] = []

    for ln in lines:
        # Ignora líneas que no contienen ningún dato relevante
        if not re.search(r'\d', ln) and '@' not in ln and 'http' not in ln:
            continue

        # Extrae campos clave
        phone_match = PHONE_RE.search(ln)
        emails = EMAIL_RE.findall(ln)
        url_match = URL_RE.search(ln)

        phone = phone_match.group(0).strip() if phone_match else ""
        email = "; ".join(e.strip() for e in emails)
        web = url_match.group(0).strip() if url_match else ""

        # Determinar índices de separación según los datos encontrados
        first_phone = phone_match.start() if phone_match else len(ln)
        last_piece = 0
        # Considerar todos los emails para calcular el final del último correo encontrado
        for match in [phone_match, url_match]:
            if match:
                last_piece = max(last_piece, match.end())
        for m in EMAIL_RE.finditer(ln):
            last_piece = max(last_piece, m.end())

        # Nombre: desde inicio hasta el primer teléfono (o primer campo encontrado)
        nombre = ln[:first_phone].strip(" ,.-")

        # Dirección: desde el último campo encontrado hasta el final
        direccion = ln[last_piece:].strip(" ,.-")

        rows.append({
            "Nombre": nombre,
            "Telefono": phone,
            "Correos": email,
            "Web": web,
            "Direccion": direccion
        })

    # Crear DataFrame y agrupar duplicados
    df = pd.DataFrame(rows)
    if df.empty:
        return pd.DataFrame(columns=["Nombre", "Telefono", "Correos", "Web", "Direccion"])

    grouped = df.groupby(["Nombre", "Direccion"], as_index=False).agg({
        "Telefono": merge_unique,
        "Correos": merge_unique,
        "Web": merge_unique
    })

    return grouped[["Nombre", "Telefono", "Correos", "Web", "Direccion"]]
