import React from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import "../styles/globals.css";
import PrimaryButton from "../components/PrimaryButton";

/**
 * Layout App Router (frontend/app/layout.tsx)
 * Si tu proyecto usa App Router (veo frontend/app/tools -> probablemente sí), pega/reescribe este archivo.
 * Ajusta textos y estructura donde actualmente renderizas el UI del convertidor.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AnimatedBackground />
        <main className="app-container">
          <div className="card">
            <h1 style={{ margin: 0, marginBottom: 12 }}>Convertidor PDF → Excel</h1>
            <p style={{ marginTop: 0, color: "var(--muted)", marginBottom: 20 }}>
              Arrastra tu PDF o selecciónalo desde tu equipo. Mantén la privacidad: los archivos no se comparten.
            </p>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
              <input className="input" type="file" accept="application/pdf" />
              <PrimaryButton>Convertir</PrimaryButton>
            </div>

            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
