import io, re
from typing import List, Dict
import pandas as pd

PHONE_RE = re.compile(r'(?:\+\d{1,3}\s?)?(?:\d[\s\-]?){6,}')
EMAIL_RE = re.compile(r'[\w.\-\+]+@[\w\.-]+\.[A-Za-z]{2,}')
URL_RE   = re.compile(r'https?://[^\s,;]+')
HEADER_PREFIXES = (
    "Email List Page", "Download CSV", "Download XLSX", "Current Plan:",
    "Name Phone Email Website", "Name Phone Email"
)

def merge_unique(items: List[str]) -> str:
    parts, seen = [], set()
    for item in items:
        if not isinstance(item, str) or not item.strip():
            continue
        for p in [x.strip().strip(',') for x in item.split(',')]:
            if p and p not in seen:
                parts.append(p); seen.add(p)
    return ", ".join(parts)

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
        emails = EMAIL_RE.findall(ln)
        urls   = URL_RE.findall(ln)
        m_phone = PHONE_RE.search(ln)
        phone = m_phone.group(0).strip() if m_phone else ""
        email_str = ", ".join(dict.fromkeys(emails)) if emails else ""
        url_str   = ", ".join(dict.fromkeys(urls)) if urls else ""

        name_candidate = ln
        if phone:
            name_candidate = name_candidate.replace(phone, " ")
        for e in emails:
            name_candidate = name_candidate.replace(e, " ")
        for u in urls:
            name_candidate = name_candidate.replace(u, " ")

        name_candidate = re.sub(r'\s{2,}', ' ', name_candidate).strip(" |-,:;")
        # Quita postcode NL si quedó pegado al nombre
        name_candidate = re.sub(r'\b\d{4}\s?[A-Z]{2}\b.*$', '', name_candidate).strip(" |-,:; ")
        name = name_candidate or "Contacto sin nombre"

        rows.append({
            "Nombre": name.strip(),
            "Telefono": phone,
            "Correos": email_str,
            "Web": url_str
        })

    df = pd.DataFrame(rows)
    grouped = df.groupby("Nombre", as_index=False).agg({
        "Telefono": merge_unique,
        "Correos": merge_unique,
        "Web": merge_unique
    })
    return grouped[["Nombre", "Telefono", "Correos", "Web"]]
