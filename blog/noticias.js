// Array de noticias. Solo edita este array para agregar/quitar noticias.
const noticias = [
    {
        titulo: "¿Cómo afecta el conflicto entre India y Pakistán al comercio internacional?",
        resumen: "Análisis del impacto comercial y geopolítico del reciente conflicto entre India y Pakistán, con datos, contexto histórico y gráficas.",
        fecha: "2025-05-03",
        imagen: "imagen/portada_blog_india_pakistan.webp", // Puedes cambiar la URL por otra imagen relevante
        enlace: "articulo-india-pakistan.html"
      },
    {
        titulo: "Plan de Internazionalización-Parte 1",
        resumen: "Conceptos básico en el proceso de internacionalización.",
        fecha: "2025-05-30",
        imagen: "Comex-toolbox/img/Qué-es-ComexToolbox.webp", // Puedes cambiar la URL por otra imagen relevante
        enlace: "blog/Plan de Internacionalización-1.html"
      }
  ];

// Renderizado dinámico de las tarjetas
function renderNoticias() {
  const contenedor = document.getElementById('blog-list');
  contenedor.innerHTML = '';
  noticias.forEach(noticia => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${noticia.imagen}" alt="${noticia.titulo}" class="card-img">
      <div class="card-content">
        <div class="card-date">${new Date(noticia.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div class="card-title">${noticia.titulo}</div>
        <div class="card-summary">${noticia.resumen}</div>
        <a href="${noticia.enlace}" class="card-link">Leer más</a>
      </div>
    `;
    contenedor.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderNoticias); 
