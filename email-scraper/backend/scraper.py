"""
Módulo para extraer correos electrónicos de páginas web.
"""
import re
import asyncio
import time
from typing import List, Set, Tuple, Dict
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Patrón regex para encontrar correos electrónicos
EMAIL_PATTERN = re.compile(
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
)

# Rutas comunes donde buscar correos
COMMON_CONTACT_ROUTES = [
    '/contact',
    '/contacto',
    '/contact-us',
    '/contacto.html',
    '/about',
    '/about-us',
    '/sobre-nosotros',
    '/about.html',
    '/kontakt',
    '/contato',
    '/contacto.php',
    '/contact.php',
    '/contacto.aspx',
    '/contact.aspx',
]


class EmailScraper:
    """Clase para extraer correos electrónicos de sitios web."""
    
    def __init__(self, delay: float = 1.0, timeout: int = 10):
        """
        Inicializa el scraper.
        
        Args:
            delay: Tiempo de espera entre peticiones (segundos)
            timeout: Tiempo máximo de espera para cada petición (segundos)
        """
        self.delay = delay
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def extract_emails_from_text(self, text: str) -> Set[str]:
        """
        Extrae correos electrónicos de un texto usando regex.
        
        Args:
            text: Texto donde buscar correos
            
        Returns:
            Set de correos encontrados
        """
        emails = set()
        matches = EMAIL_PATTERN.findall(text)
        for email in matches:
            # Filtrar correos comunes que no son de contacto
            email_lower = email.lower()
            if not any(excluded in email_lower for excluded in [
                'example.com', 'test.com', 'domain.com', 
                'email.com', 'mail.com', 'noreply', 'no-reply',
                'donotreply', 'do-not-reply'
            ]):
                emails.add(email.lower())
        return emails
    
    def extract_emails_from_html(self, html: str, url: str) -> Set[str]:
        """
        Extrae correos electrónicos de HTML.
        
        Args:
            html: Contenido HTML
            url: URL de origen
            
        Returns:
            Set de correos encontrados
        """
        emails = set()
        
        try:
            soup = BeautifulSoup(html, 'html.parser')
            
            # Buscar en enlaces mailto:
            mailto_links = soup.find_all('a', href=re.compile(r'^mailto:', re.I))
            for link in mailto_links:
                href = link.get('href', '')
                email_match = re.search(r'mailto:([^\?&]+)', href, re.I)
                if email_match:
                    email = email_match.group(1).strip()
                    if email:
                        emails.add(email.lower())
            
            # Buscar en el texto del HTML
            text_content = soup.get_text()
            emails.update(self.extract_emails_from_text(text_content))
            
            # Buscar en atributos data-* y otros atributos
            for tag in soup.find_all(True):
                for attr in tag.attrs:
                    attr_value = str(tag.attrs[attr])
                    emails.update(self.extract_emails_from_text(attr_value))
                    
        except Exception as e:
            logger.warning(f"Error al parsear HTML de {url}: {e}")
        
        return emails
    
    def fetch_url(self, url: str) -> Tuple[str, Set[str]]:
        """
        Obtiene el contenido de una URL y extrae correos.
        
        Args:
            url: URL a visitar
            
        Returns:
            Tupla (url, set de correos encontrados)
        """
        emails = set()
        
        try:
            # Normalizar URL
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            logger.info(f"Visitando: {url}")
            response = self.session.get(url, timeout=self.timeout, allow_redirects=True)
            response.raise_for_status()
            
            # Extraer correos de la página principal
            emails.update(self.extract_emails_from_html(response.text, url))
            
            # Intentar visitar rutas comunes de contacto
            parsed_url = urlparse(url)
            base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
            
            for route in COMMON_CONTACT_ROUTES:
                try:
                    contact_url = urljoin(base_url, route)
                    time.sleep(self.delay * 0.5)  # Delay más corto para rutas secundarias
                    
                    contact_response = self.session.get(
                        contact_url, 
                        timeout=self.timeout, 
                        allow_redirects=True
                    )
                    
                    if contact_response.status_code == 200:
                        contact_emails = self.extract_emails_from_html(
                            contact_response.text, 
                            contact_url
                        )
                        emails.update(contact_emails)
                        logger.info(f"Encontrados {len(contact_emails)} correos en {contact_url}")
                        
                except requests.RequestException:
                    # Si falla una ruta, continuar con la siguiente
                    continue
                except Exception as e:
                    logger.warning(f"Error al visitar {contact_url}: {e}")
                    continue
            
        except requests.RequestException as e:
            logger.error(f"Error al obtener {url}: {e}")
        except Exception as e:
            logger.error(f"Error inesperado con {url}: {e}")
        
        return url, emails
    
    async def scrape_urls(self, urls: List[str]) -> Dict[str, str]:
        """
        Procesa una lista de URLs y extrae correos.
        
        Args:
            urls: Lista de URLs a procesar
            
        Returns:
            Diccionario {url: correos_separados_por_punto_y_coma}
        """
        results = {}
        total = len(urls)
        
        for idx, url in enumerate(urls, 1):
            logger.info(f"Procesando {idx}/{total}: {url}")
            
            # Usar run_in_executor para no bloquear el event loop
            loop = asyncio.get_event_loop()
            _, emails = await loop.run_in_executor(None, self.fetch_url, url)
            
            # Convertir set a string separado por punto y coma
            emails_str = '; '.join(sorted(emails)) if emails else ''
            results[url] = emails_str
            
            logger.info(f"URL {idx}/{total} completada. Correos encontrados: {len(emails)}")
            
            # Delay entre peticiones (excepto en la última)
            if idx < total:
                await asyncio.sleep(self.delay)
        
        return results

