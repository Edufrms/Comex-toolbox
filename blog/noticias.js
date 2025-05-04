// Array de noticias. Solo edita este array para agregar/quitar noticias.
const noticias = [
    {
        titulo: "¿Cómo afecta el conflicto entre India y Pakistán al comercio internacional?",
        resumen: "Análisis del impacto comercial y geopolítico del reciente conflicto entre India y Pakistán, con datos, contexto histórico y gráficas.",
        fecha: "2024-05-03",
        imagen: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80", // Puedes cambiar la URL por otra imagen relevante
        enlace: "articulo-india-pakistan.html"
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
