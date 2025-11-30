// ============================================
// NAVEGACIÓN Y MENÚ RESPONSIVE
// ============================================

// Toggle del menú hamburguesa
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

// ============================================
// SCROLL SUAVE
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Si el href es solo "#", prevenir el comportamiento por defecto
        if (href === '#') {
            e.preventDefault();
            return;
        }

        const target = document.querySelector(href);
        
        if (target) {
            e.preventDefault();
            
            // Calcular la posición considerando el header fijo
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// LIGHTBOX PARA GALERÍA
// ============================================

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCategory = document.getElementById('lightboxCategory');
const lightboxDescription = document.getElementById('lightboxDescription');
const lightboxClose = document.querySelector('.lightbox-close');

// Abrir lightbox al hacer clic en una imagen de la galería
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const imageWrapper = item.querySelector('.gallery-image-wrapper');
        const image = item.querySelector('.gallery-image');
        const info = item.querySelector('.gallery-info');
        
        if (image && info) {
            // Obtener información de la foto
            const title = info.querySelector('h3').textContent;
            const category = info.querySelector('.gallery-category').textContent;
            const description = info.querySelector('.gallery-description').textContent;
            const imageSrc = image.src;
            
            // Establecer contenido del lightbox
            lightboxImage.src = imageSrc;
            lightboxImage.alt = title;
            lightboxTitle.textContent = title;
            lightboxCategory.textContent = category;
            lightboxDescription.textContent = description;
            
            // Mostrar lightbox
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
        }
    });
});

// Cerrar lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll del body
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

// Cerrar lightbox al hacer clic fuera de la imagen
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// Cerrar lightbox con la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

// ============================================
// HISTORIAS / BLOG - MODAL
// ============================================

const storyReadMoreButtons = document.querySelectorAll('.story-read-more');

storyReadMoreButtons.forEach(button => {
    button.addEventListener('click', () => {
        const storyId = button.getAttribute('data-story');
        const storyFull = document.getElementById(storyId);
        
        if (storyFull) {
            storyFull.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

// Cerrar historias
const storyCloseButtons = document.querySelectorAll('.story-close');

storyCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
        const storyFull = button.closest('.story-full');
        if (storyFull) {
            storyFull.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Cerrar historias al hacer clic fuera del contenido
document.querySelectorAll('.story-full').forEach(storyFull => {
    storyFull.addEventListener('click', (e) => {
        if (e.target === storyFull) {
            storyFull.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Cerrar historias con la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeStory = document.querySelector('.story-full.active');
        if (activeStory) {
            activeStory.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// ============================================
// FORMULARIO DE CONTACTO
// ============================================

const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();
        
        // Validación básica
        if (!nombre || !email || !mensaje) {
            showFormMessage('Por favor, completa todos los campos.', 'error');
            return;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFormMessage('Por favor, introduce un email válido.', 'error');
            return;
        }
        
        // Simular envío (aquí iría la lógica real de envío)
        showFormMessage('¡Mensaje enviado correctamente! Te responderé pronto.', 'success');
        
        // Limpiar formulario
        contactForm.reset();
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    });
}

function showFormMessage(message, type) {
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
        
        // Scroll suave al mensaje
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ============================================
// EFECTO DE APARICIÓN AL HACER SCROLL
// ============================================

// Función para observar elementos y añadir animación
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos de la galería y historias
document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const storyCards = document.querySelectorAll('.story-card');
    
    [...galleryItems, ...storyCards].forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
});

// ============================================
// HEADER CON EFECTO AL HACER SCROLL
// ============================================

let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (header) {
        // Añadir sombra cuando se hace scroll
        if (currentScroll > 50) {
            header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        }
    }
    
    lastScroll = currentScroll;
});

// ============================================
// PREVENIR CARGAR IMÁGENES ROTAS (OPCIONAL)
// ============================================

// Añadir placeholder para imágenes que no se encuentren
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        // Si la imagen no se carga, mostrar un placeholder simple
        this.style.backgroundColor = '#f0f0f0';
        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'center';
        this.style.minHeight = '300px';
        this.alt = 'Imagen no disponible';
    });
});

