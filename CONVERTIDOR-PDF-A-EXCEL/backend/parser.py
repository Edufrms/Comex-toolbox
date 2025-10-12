import io, re
from typing import List, Dict
import pandas as pd

PHONE_RE = re.compile(r'(?:\+\d{1,3}\s?)?(?:\d[\s\-]?){6,}')
EMAIL_RE = re.compile(r'[\w.\-\+]+@[\w\.-]+\.[A-Za-z]{2,}')
URL_RE = re.compile(r'https?://[^\s,;]+')
HEADER_PREFIXES = (
    "Email List Page", "Download CSV", "Download XLSX", "Current Plan:",
    "Name Phone Email Website", "Name Phone Email"
)

def merge_unique(items: List[str]) -> str:
    """Une valores únicos con punto y coma."""
    parts, seen = [], set()
    for item in items:
        if not isinstance(item, str) or not item.strip():
            continue
        for p in [x.strip() for x in re.split(r'[,;]', item) if x.strip()]:
            if p not in seen:
                seen.add(p)
                parts.append(p)
    return "; ".join(parts)

def read_pdf_text(file_bytes: bytes) -> str:
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

def parse_text_to_rows(raw_text: str) -> pd.DataFrame:
    lines = [re.sub(r'\s+', ' ', ln).strip() for ln in raw_text.splitlines()]
    lines = [ln for ln in lines if ln and not ln.startswith(HEADER_PREFIXES)]

    rows: List[Dict[str, str]] = []
    for ln in lines:
        # Extraer correos, webs y teléfono
        emails = EMAIL_RE.findall(ln)
        urls = URL_RE.findall(ln)
        phone_match = PHONE_RE.search(ln)
        phone = phone_match.group(0).strip() if phone_match else ""

        email_str = "; ".join(dict.fromkeys(emails)) if emails else ""
        url_str = "; ".join(dict.fromkeys(urls)) if urls else ""

        # Quitar correos, webs y teléfono del texto para aislar nombre + dirección
        clean_line = ln
        if phone:
            clean_line = clean_line.replace(phone, " ")
        for e in emails:
            clean_line = clean_line.replace(e, " ")
        for u in urls:
            clean_line = clean_line.replace(u, " ")

        clean_line = re.sub(r'\s{2,}', ' ', clean_line).strip(" ,-:;")

        # Separar nombre y dirección:
        # Supongamos que el nombre va primero, seguido de una coma o número (dirección)
        match = re.match(r"^([A-Za-z0-9&'\"().\-\s]+?)(?:,|\s\d|\s[A-Z]\d|\s[A-Z]{2,})?(.*)$", clean_line)
        if match:
            name = match.group(1).strip(" ,-:;")
            address = match.group(2).strip(" ,-:;")
        else:
            name, address = clean_line, ""

        # Quita restos de códigos postales del nombre si quedaron pegados
        name = re.sub(r'\b\d{4}\s?[A-Z]{2}\b', '', name).strip(" ,-:;")

        rows.append({
            "Nombre": name or "Contacto sin nombre",
            "Direccion": address,
            "Telefono": phone,
            "Correos": email_str,
            "Web": url_str
        })

    df = pd.DataFrame(rows)
    grouped = df.groupby("Nombre", as_index=False).agg({
        "Direccion": merge_unique,
        "Telefono": merge_unique,
        "Correos": merge_unique,
        "Web": merge_unique
    })
    return grouped[["Nombre", "Direccion", "Telefono", "Correos", "Web"]]
