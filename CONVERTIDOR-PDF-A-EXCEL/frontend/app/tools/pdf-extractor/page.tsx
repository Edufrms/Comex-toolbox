"use client";
import React, { useState, useRef } from "react";

// Puedes instalar Tailwind CSS o usar CSS Modules para el máximo efecto visual, pero aquí te muestro un ejemplo espectacular inline y con animaciones.
export default function Page() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const arr = Array.from(e.target.files).filter(f => f.type === "application/pdf");
    setFiles(arr);
    setError(null);
    setSuccess(false);
  };

  const onUpload = async () => {
    try {
      setBusy(true); setError(null); setSuccess(false);
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
      setSuccess(true);
      setFiles([]);
      if(inputRef.current) inputRef.current.value = "";
    } catch (e:any) {
      setError(e.message || "Error al convertir");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #a8edea 0%, #fed6e3 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, system-ui, Arial",
      padding: 0
    }}>
      <div style={{
        background: "rgba(255,255,255,0.95)",
        boxShadow: "0 8px 32px 0 rgba(31,38,135,0.37)",
        borderRadius: 32,
        maxWidth: 420,
        width: "100%",
        padding: "42px 32px 32px 32px",
        backdropFilter: "blur(3px)",
        border: "1px solid rgba(255,255,255,0.18)",
        position: "relative",
        marginTop: 40,
        animation: "slide-in 1.2s cubic-bezier(.65,.05,.36,1) both"
      }}>
        <style>{`
          @keyframes slide-in {
            0% { transform: translateY(-50px) scale(0.95); opacity:0;}
            100% { transform: none; opacity:1;}
          }
          .glow {
            box-shadow: 0 0 0 2px #fed6e3, 0 0 10px 4px #a8edea7a;
          }
          .file-chip {
            display: inline-block;
            background: linear-gradient(90deg, #a8edea 10%, #fed6e3 90%);
            color: #333;
            border-radius: 999px;
            padding: 6px 16px;
            margin: 3px 4px 2px 0;
            font-size: 0.98em;
            font-weight: 500;
            border: 1px solid #e0e0e0;
            box-shadow: 0 2px 8px 0 #fed6e330;
            animation: fadeIn .5s;
          }
          @keyframes fadeIn {
            from { opacity:0; transform:scale(.85);}
            to { opacity:1; transform:scale(1);}
          }
          .btn {
            background: linear-gradient(90deg, #e0c3fc 0%, #8ec5fc 100%);
            color: #1a1a1a;
            font-size: 1.08em;
            font-weight: 700;
            border: none;
            border-radius: 30px;
            padding: 14px 38px;
            margin-top: 10px;
            cursor: pointer;
            transition: transform .12s, box-shadow .15s, background .27s;
            box-shadow: 0 2px 8px 0 #8ec5fc30;
          }
          .btn:active {
            transform: scale(0.97);
            background: linear-gradient(90deg, #8ec5fc 0%, #e0c3fc 100%);
          }
          .btn[disabled] {
            opacity: 0.6;
            pointer-events: none;
          }
          .input-fancy {
            display: block;
            margin: 0 auto;
            border-radius: 28px;
            border: 1.5px solid #a8edea;
            padding: 12px 22px;
            margin-bottom: 18px;
            background: #fff;
            font-size: 1em;
            color: #333;
            transition: border .2s, box-shadow .2s;
            outline: none;
            width: 100%;
          }
          .input-fancy:focus {
            border: 2px solid #8ec5fc;
            box-shadow: 0 0 0 2px #a8edea80;
          }
          .success-pop {
            background: linear-gradient(90deg, #b7ffca 0%, #f7ffc4 100%);
            color: #18702b;
            padding: 11px 22px;
            border-radius: 20px;
            margin-bottom: 12px;
            font-weight: bold;
            font-size: 1.05em;
            box-shadow: 0 2px 8px 0 #b7ffca40;
            animation: popIn .6s;
          }
          @keyframes popIn {
            0% { transform: scale(0.85); opacity:0;}
            100% { transform: none; opacity:1;}
          }
        `}</style>
        <h1 style={{
          fontWeight: 900,
          fontSize: "2.4em",
          background: "linear-gradient(90deg, #8ec5fc 0%, #e0c3fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8,
          letterSpacing: "-1px"
        }}>
          PDF → Excel
        </h1>
        <p style={{
          marginBottom: 28,
          fontSize: "1.06em",
          color: "#444",
          fontWeight: 500
        }}>
          Sube uno o varios <b>PDF</b> con listados de contactos y obtén un <b>Excel</b> limpio con columnas: <b>Nombre</b>, <b>Teléfono</b>, <b>Correos</b>, <b>Web</b>.
        </p>

        {success && (
          <div className="success-pop">
            🎉 ¡Conversión exitosa! Tu Excel se descargó automáticamente.
          </div>
        )}

        <input
          ref={inputRef}
          className="input-fancy glow"
          type="file"
          multiple
          accept="application/pdf"
          onChange={onChange}
          disabled={busy}
        />

        <div style={{marginTop: 8, marginBottom: 6, minHeight: 30}}>
          {files.length > 0 && (
            <div>
              {files.map(f => (
                <span className="file-chip" key={f.name}>{f.name}</span>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn"
          disabled={!files.length || busy}
          onClick={onUpload}
        >
          {busy ? (
            <>
              <span style={{marginRight: 10, verticalAlign: "middle", display:"inline-block"}}>
                <svg width={20} height={20} viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="#8ec5fc" strokeWidth="5" strokeDasharray="31.4 31.4" transform="rotate(-90 25 25)"><animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 25 25;360 25 25"/></circle></svg>
              </span>
              Procesando...
            </>
          ) : (
            <>Convertir y Descargar Excel</>
          )}
        </button>

        {error && (
          <div style={{
            color: "#c62828",
            background: "#fff2f2",
            border: "1px solid #ffd6d6",
            borderRadius: 20,
            margin: "14px 0 0 0",
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: "1.01em",
            animation: "popIn .5s"
          }}>
            ⚠️ {error}
          </div>
        )}

        <hr style={{
          margin: "32px 0 12px 0",
          border: 0,
          borderTop: "1.5px solid #e9e9e9"
        }}/>

        <small style={{
          display: "block",
          color: "#888",
          fontSize: "0.97em",
          textAlign: "center"
        }}>
          <span style={{marginRight: 4, verticalAlign:"-2px"}}>🔒</span>
          Privacidad: los PDF se procesan para extraer texto (no se almacenan de forma persistente).
        </small>
      </div>
      <div style={{marginTop:40, marginBottom:16, opacity:.4, fontSize:"1.05em"}}>
        <span style={{
          background: "linear-gradient(90deg, #a8edea 0%, #fed6e3 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 600
        }}>
          Hecho con 💎 para gente que ama la productividad
        </span>
      </div>
    </div>
  );
}
