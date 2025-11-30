# Portfolio Fotográfico

Página web minimalista y profesional para mostrar tu trabajo fotográfico.

## 📁 Estructura del Proyecto

```
webfoto/
├── index.html       # Página principal
├── styles.css       # Estilos CSS
├── scripts.js       # Funcionalidad JavaScript
├── img/            # Carpeta para tus fotografías
└── README.md       # Este archivo
```

## 🚀 Cómo Empezar

1. **Coloca tus fotografías** en la carpeta `img/` con estos nombres:
   - `foto1.jpg`, `foto2.jpg`, `foto3.jpg`, etc. (para la galería)
   - `story1.jpg`, `story2.jpg`, etc. (para las historias)
   - `perfil.jpg` (tu foto de perfil para la sección "Sobre mí")

2. **Abre `index.html`** en tu navegador para ver la página.

3. **Personaliza los textos** editando directamente `index.html`:
   - Títulos y subtítulos
   - Descripciones de las fotos
   - Textos de las historias
   - Información personal en "Sobre mí"

## 🎨 Características

- ✅ Diseño minimalista y elegante
- ✅ Totalmente responsive (móvil, tablet, escritorio)
- ✅ Galería con lightbox para ver fotos en grande
- ✅ Sección de historias/blog
- ✅ Navegación suave entre secciones
- ✅ Menú hamburguesa en móvil
- ✅ Formulario de contacto (sin backend)
- ✅ Efectos sutiles y animaciones suaves

## ✏️ Personalización

### Cambiar Colores

Edita las variables CSS en `styles.css` (líneas al inicio):

```css
:root {
    --color-accent: #5b8fa3;        /* Color principal */
    --color-bg: #ffffff;            /* Fondo */
    --color-text: #2c2c2c;         /* Texto */
}
```

### Añadir Más Fotos

1. Añade la imagen a la carpeta `img/`
2. Copia una tarjeta de galería en `index.html` (dentro de `.gallery-grid`)
3. Cambia la ruta de la imagen y actualiza los textos

### Cambiar Tipografía

En `index.html`, cambia el enlace a Google Fonts en el `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=TU_FUENTE:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Luego actualiza `--font-primary` en `styles.css`.

## 📝 Notas

- Las imágenes usan rutas relativas, así que asegúrate de mantener la estructura de carpetas.
- El formulario de contacto solo tiene validación frontend. Para enviar emails reales, necesitarías un backend.
- Todas las imágenes deben tener nombres descriptivos y el formato `.jpg` (o cambiar la extensión en el HTML).

## 🌐 Compatibilidad

- Funciona en todos los navegadores modernos
- No requiere servidor, funciona abriendo directamente el HTML
- Sin dependencias externas (solo Google Fonts)

---

¡Disfruta mostrando tus fotografías! 📸

