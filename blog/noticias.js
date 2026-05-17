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
    titulo: "Radar Comex #1 — Semana del 11 al 17 de mayo de 2026",
    resumen: "Petróleo a 105 USD, medicamentos críticos en Europa, tensión EEUU-China y el acuerdo comercial México-UE que se firma el 22 de mayo.",
    fecha: "2026-05-17",
    imagen: "noticias/portada_radar_comex_1.webp",
    enlace: "noticias/mayo-11-17.html",
    categoria: "radar",
    tags: ["Energía", "Geopolítica", "Acuerdos comerciales"],
    lectura: "8 min",
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

// ── Helpers ──────────────────────────────────────────────────
function formatFecha(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

const catLabel = {
  radar:       '📡 Radar Comex',
  analisis:    '📊 Análisis',
  herramientas:'🛠 Herramientas',
  guias:       '📖 Guía'
};

// ── Crear tarjeta ────────────────────────────────────────────
function crearCard(noticia) {
  const article = document.createElement('article');
  const clases = ['card'];
  if (noticia.destacado) clases.push('card-featured');
  if (noticia.categoria === 'radar') clases.push('card-radar');
  article.className = clases.join(' ');
  article.dataset.categoria = noticia.categoria || 'todos';

  const label = catLabel[noticia.categoria] || 'Artículo';

  const tagsHTML = (noticia.tags || [])
    .slice(0, 3)
    .map(t => `<span class="tag">${t}</span>`)
    .join('');

  // Imagen con fallback si no carga
  article.innerHTML = `
    <a href="${noticia.enlace}" class="card-img-link" tabindex="-1" aria-hidden="true">
      <div class="card-img-wrap">
        <img
          src="${noticia.imagen}"
          alt="Portada: ${noticia.titulo}"
          class="card-img"
          loading="lazy"
          onerror="this.closest('.card-img-wrap').classList.add('img-fallback'); this.style.display='none';"
        >
        <span class="card-cat">${label}</span>
        ${noticia.destacado ? '<span class="card-badge-featured">Última edición</span>' : ''}
      </div>
    </a>
    <div class="card-body">
      <div class="card-meta">
        <time datetime="${noticia.fecha}" class="card-date">${formatFecha(noticia.fecha)}</time>
        ${noticia.lectura ? `<span class="card-read">⏱ ${noticia.lectura}</span>` : ''}
      </div>
      <h2 class="card-title">
        <a href="${noticia.enlace}">${noticia.titulo}</a>
      </h2>
      <p class="card-summary">${noticia.resumen}</p>
    </div>
    <div class="card-footer">
      <a href="${noticia.enlace}" class="card-link" aria-label="Leer: ${noticia.titulo}">
        Leer artículo <span aria-hidden="true">→</span>
      </a>
      <div class="card-tags">${tagsHTML}</div>
    </div>
  `;

  return article;
}

// ── Render principal ─────────────────────────────────────────
function renderNoticias(filtro = 'todos') {
  const contenedor = document.getElementById('blog-list');
  if (!contenedor) return;

  // Ordenar: destacados primero, luego por fecha desc
  const sorted = [...noticias].sort((a, b) => {
    if (a.destacado && !b.destacado) return -1;
    if (!a.destacado && b.destacado) return 1;
    return new Date(b.fecha) - new Date(a.fecha);
  });

  const filtradas = filtro === 'todos'
    ? sorted
    : sorted.filter(n => n.categoria === filtro);

  // Animación de salida/entrada
  contenedor.style.opacity = '0';
  contenedor.style.transform = 'translateY(8px)';

  setTimeout(() => {
    contenedor.innerHTML = '';

    if (filtradas.length === 0) {
      contenedor.innerHTML = '<p class="empty-state">No hay entradas en esta categoría todavía.</p>';
    } else {
      filtradas.forEach(n => contenedor.appendChild(crearCard(n)));
    }

    contenedor.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    contenedor.style.opacity = '1';
    contenedor.style.transform = 'translateY(0)';
  }, 150);
}

// ── Filtros ──────────────────────────────────────────────────
function initFiltros() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderNoticias(btn.dataset.filter);
    });
  });
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderNoticias();
  initFiltros();
});
