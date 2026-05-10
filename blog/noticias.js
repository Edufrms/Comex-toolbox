// ============================================================
// COMEXTOOLBOX — noticias.js
// Edita solo el array "noticias" para agregar/quitar entradas.
//
// Campos disponibles:
//   titulo    → título del artículo
//   resumen   → 1–2 frases de descripción
//   fecha     → "YYYY-MM-DD"
//   imagen    → ruta a la imagen de portada
//   enlace    → URL del artículo
//   categoria → "radar" | "analisis" | "herramientas" | "guias"
//   tags      → array de strings con etiquetas (máx 3)
//   lectura   → tiempo estimado de lectura, ej. "4 min"
//   destacado → true para mostrar como tarjeta grande al inicio
// ============================================================

const noticias = [
  {
    titulo: "Radar Comex #1 — Las 10 noticias del comercio internacional esta semana",
    resumen: "Aranceles, logística, nuevos acuerdos y mucho más: el resumen semanal que necesitas para estar al día en comercio exterior.",
    fecha: "2025-05-11",
    imagen: "imagen/portada_radar_comex_1.webp",
    enlace: "radar-comex-01.html",
    categoria: "radar",
    tags: ["Aranceles", "Logística", "Ferias"],
    lectura: "6 min",
    destacado: true
  },
  {
    titulo: "¿Cómo afecta el conflicto entre India y Pakistán al comercio internacional?",
    resumen: "Análisis del impacto comercial y geopolítico del reciente conflicto, con datos, contexto histórico y gráficas.",
    fecha: "2025-05-03",
    imagen: "imagen/portada_blog_india_pakistan.webp",
    enlace: "articulo-india-pakistan.html",
    categoria: "analisis",
    tags: ["Geopolítica", "Supply Chain"],
    lectura: "7 min",
    destacado: false
  },
  {
    titulo: "Plan de Internacionalización — Parte 1: conceptos fundamentales",
    resumen: "Los conceptos básicos que toda empresa debe conocer antes de dar el salto al mercado internacional.",
    fecha: "2025-05-30",
    imagen: "../img/Qué-es-ComexToolbox.webp",
    enlace: "Plan_de_Internacionalización_1.html",
    categoria: "guias",
    tags: ["Internacionalización", "Guía"],
    lectura: "5 min",
    destacado: false
  }
];

// ── Renderizado ──────────────────────────────────────────────
function formatFecha(dateStr) {
  // Parsear la fecha como local (no UTC) para evitar desfase de un día
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function crearCard(noticia) {
  const article = document.createElement('article');
  const clases = ['card'];
  if (noticia.destacado) clases.push('card-featured');
  if (noticia.categoria === 'radar') clases.push('card-radar');
  article.className = clases.join(' ');
  article.dataset.categoria = noticia.categoria || 'todos';

  const catLabel = {
    radar: '📡 Radar Comex',
    analisis: 'Análisis',
    herramientas: 'Herramientas',
    guias: 'Guía'
  }[noticia.categoria] || 'Artículo';

  const tagsHTML = (noticia.tags || [])
    .map(t => `<span class="tag">${t}</span>`)
    .join('');

  article.innerHTML = `
    <div class="card-img-wrap">
      <img src="${noticia.imagen}" alt="${noticia.titulo}" class="card-img" loading="lazy">
      <span class="card-cat">${catLabel}</span>
    </div>
    <div class="card-body">
      <div class="card-meta">
        <span class="card-date">${formatFecha(noticia.fecha)}</span>
        ${noticia.lectura ? `<span class="card-read">${noticia.lectura} lectura</span>` : ''}
      </div>
      <h2 class="card-title">${noticia.titulo}</h2>
      <p class="card-summary">${noticia.resumen}</p>
    </div>
    <div class="card-footer">
      <a href="${noticia.enlace}" class="card-link">Leer artículo</a>
      <div class="card-tags">${tagsHTML}</div>
    </div>
  `;

  return article;
}

function renderNoticias() {
  const contenedor = document.getElementById('blog-list');
  if (!contenedor) return;
  contenedor.innerHTML = '';

  // Ordenar: destacados primero, luego por fecha desc
  const sorted = [...noticias].sort((a, b) => {
    if (a.destacado && !b.destacado) return -1;
    if (!a.destacado && b.destacado) return 1;
    return new Date(b.fecha) - new Date(a.fecha);
  });

  sorted.forEach(n => contenedor.appendChild(crearCard(n)));
}

document.addEventListener('DOMContentLoaded', renderNoticias);
