import React from "react";

/**
 * Fondo animado: gradiente + blobs SVG
 * Coloca este componente en el layout de la app (posición fixed, z-index bajo).
 */
export default function AnimatedBackground(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="animated-bg"
      style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden" }}
    >
      <div className="gradient-overlay" />

      <svg
        className="bg-blobs"
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="g2" x1="0" x2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FB7185" />
          </linearGradient>
        </defs>

        <g opacity="0.45">
          <ellipse className="blob blob1" cx="20%" cy="30%" rx="300" ry="220" fill="url(#g1)" />
          <ellipse className="blob blob2" cx="80%" cy="70%" rx="360" ry="260" fill="url(#g2)" />
        </g>
      </svg>
    </div>
  );
}
