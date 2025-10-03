"use client";
import React, { useState } from "react";

export default function Page() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const arr = Array.from(e.target.files).filter(f => f.type === "application/pdf");
    setFiles(arr);
  };

  const onUpload = async () => {
    try {
      setBusy(true); setError(null);
      const form = new FormData();
      files.forEach(f => form.append("files", f));
      const res = await fetch("/api/convert?keep_empty=true", { method: "POST", body: form });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "contactos.xlsx"; a.click();
      URL.revokeObjectURL(url);
    } catch (e:any) {
      setError(e.message || "Error al convertir");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{maxWidth:820, margin:"40px auto", fontFamily:"Inter, system-ui, Arial"}}>
      <h1>PDF → Excel Contact Extractor</h1>
      <p>Sube uno o varios <b>PDF</b> con listados de contactos y descarga un <b>Excel</b> limpio (Nombre, Teléfono, Correos, Web).</p>

      <input type="file" multiple accept="application/pdf" onChange={onChange} />
      <div style={{marginTop:12}}>
        <button disabled={!files.length || busy} onClick={onUpload}>
          {busy ? "Procesando..." : "Convertir y Descargar Excel"}
        </button>
      </div>

      {files.length > 0 && (
        <ul style={{marginTop:12}}>
          {files.map(f => <li key={f.name}>{f.name}</li>)}
        </ul>
      )}
      {error && <p style={{color:"crimson"}}>{error}</p>}
      <hr />
      <small>
        Privacidad: los PDFs se procesan para extraer texto (no se almacenan de forma persistente).
      </small>
    </div>
  );
}
