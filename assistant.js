(function () {
  // Espera a que exista todo (resources, inputs, etc.)
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function normalizeText(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const ASSISTANT_INTENTS = [
    {
      name: "Buscadores de Ferias",
      keywords: ["feria","ferias","evento","eventos","exposicion","exposiciones","trade show","tradeshow","exhibition","calendar","calendario","congreso"],
      answer: (ctx) => {
        const parts = [];
        parts.push("Parece que buscas <strong>ferias/eventos</strong>.");
        if (ctx.country) parts.push(`Destino: <strong>${ctx.country}</strong>.`);
        if (ctx.sector) parts.push(`Sector: <strong>${ctx.sector}</strong>.`);
        return parts.join(" ");
      }
    },
    {
      name: "Acceso a Mercados",
      keywords: ["arancel","aranceles","taric","aduana","aduanas","normativa","requisitos","regulacion","regulaciones","acuerdo","acuerdos","origen","rules of origin","certificado","sanitario","fitosanitario"],
      answer: () => "Parece que buscas <strong>acceso a mercados</strong>: aranceles, normativa, requisitos o reglas de origen."
    },
    {
      name: "Estadísticas y Datos",
      keywords: ["estadistica","estadisticas","datos","exportaciones","importaciones","comtrade","trademap","datacomex","eurostat","ranking","volumen","valor"],
      answer: () => "Parece que buscas <strong>estadísticas y datos</strong> de comercio (export/import, series, rankings)."
    },
    {
      name: "Análisis de Mercados",
      keywords: ["analisis","mercado","oportunidad","potencial","competencia","tendencia","trend","atlas","complexity","market finder","demanda"],
      answer: () => "Parece que buscas <strong>análisis de mercados</strong>: oportunidades, potencial y tendencias."
    },
    {
      name: "Financiación y Riesgos",
      keywords: ["riesgo","riesgo pais","cobertura","seguro","credito","coface","cesce","financiacion","cobro","pago"],
      answer: () => "Parece que buscas <strong>financiación y riesgo</strong>: riesgo país, seguro de crédito, medios de pago, etc."
    },
    {
      name: "Formación y Recursos",
      keywords: ["curso","formacion","recursos","guia","tutorial","contenedor","searates","marinetraffic","icontainers","aprende","logistica"],
      answer: () => "Parece que buscas <strong>formación y recursos</strong> prácticos."
    }
  ];

  const COUNTRY_HINTS = [
    "alemania","francia","italia","portugal","espana","mexico","colombia","peru","chile","argentina",
    "brasil","usa","eeuu","estados unidos","canada","reino unido","uk","polonia","marruecos","turquia",
    "india","china","japon","corea","emiratos","arabia saudi","sudafrica","australia"
  ];

  const SECTOR_HINTS = [
    "alimentacion","agroalimentario","food","bebidas","vino","wine","packaging","envase","maquinaria",
    "textil","moda","construccion","automocion","farmaceutico","cosmetica","mueble","tecnologia","energia"
  ];

  function detectHint(text, list) {
    for (const item of list) if (text.includes(item)) return item;
    return "";
  }

  function scoreIntent(text, intent) {
    let score = 0;
    for (const kw of intent.keywords) {
      const k = normalizeText(kw);
      if (k && text.includes(k)) score += (k.length >= 6 ? 3 : 2);
    }
    return score;
  }

  function pickTopResources(resources, category, query, max = 6) {
    const q = normalizeText(query);
    return resources
      .filter(r => r.category === category)
      .map(r => {
        const hay = normalizeText(r.title + " " + r.description);
        let s = 1;
        if (q) {
          const terms = q.split(" ").filter(t => t.length >= 3);
          for (const t of terms) if (hay.includes(t)) s += 2;
        }
        return { r, s };
      })
      .sort((a,b) => b.s - a.s)
      .slice(0, max)
      .map(x => x.r);
  }

  function ensureAssistantUI() {
    // Inserta UI justo antes del input existente #searchInput
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return null;

    // Evita duplicados
    if (document.getElementById("assistantInput")) return {
      assistantInput: document.getElementById("assistantInput"),
      assistantBtn: document.getElementById("assistantBtn"),
      assistantAnswer: document.getElementById("assistantAnswer"),
      assistantLinks: document.getElementById("assistantLinks")
    };

    const wrap = document.createElement("div");
    wrap.className = "assistant-box";
    wrap.style.maxWidth = "820px";
    wrap.style.margin = "0 auto 14px auto";

    wrap.innerHTML = `
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <input
          type="text"
          id="assistantInput"
          placeholder="¿Qué es lo que buscas? (ej: ferias en Alemania, aranceles UE, estadísticas importación...)"
          style="flex:1; min-width:260px; padding:12px 14px; border:1px solid #ddd; border-radius:10px;"
        />
        <button
          id="assistantBtn"
          type="button"
          style="padding:12px 14px; border:1px solid #ddd; border-radius:10px; cursor:pointer; background:#fff;"
        >
          Buscar
        </button>
      </div>
      <div id="assistantAnswer" style="margin-top:10px; font-size:0.98rem; color:#374151;"></div>
      <div id="assistantLinks" style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;"></div>
    `;

    // Mete el asistente antes del buscador normal
    searchInput.parentElement.insertBefore(wrap, searchInput);

    return {
      assistantInput: wrap.querySelector("#assistantInput"),
      assistantBtn: wrap.querySelector("#assistantBtn"),
      assistantAnswer: wrap.querySelector("#assistantAnswer"),
      assistantLinks: wrap.querySelector("#assistantLinks"),
    };
  }

  function applyFilters(categoryName, query) {
    // Usa tus variables globales si existen
    if (typeof window.currentCategory !== "undefined") window.currentCategory = categoryName;
    if (typeof window.searchTerm !== "undefined") window.searchTerm = query || "";

    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = query || "";

    // Activa botón de categoría
    const categoryButtons = document.querySelectorAll(".category-btn");
    categoryButtons.forEach(btn => btn.classList.remove("active"));
    categoryButtons.forEach(btn => {
      if ((categoryName === "all" && btn.dataset.category === "all") || btn.dataset.category === categoryName) {
        btn.classList.add("active");
      }
    });

    // Renderiza si existe tu función
    if (typeof window.renderResources === "function") window.renderResources();

    document.getElementById("resourcesGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderLinks(el, items) {
    if (!el) return;
    if (!items.length) { el.innerHTML = ""; return; }
    el.innerHTML = items.map(it => `
      <a href="${it.learnUrl}" target="_blank" rel="noopener"
         style="display:inline-flex; gap:8px; align-items:center; padding:8px 10px; border:1px solid #e5e7eb; border-radius:999px; text-decoration:none; color:#111827; background:#fff;">
        📘 ${it.title}
      </a>
    `).join("");
  }

  function runAssistant(raw, ui, resources) {
    const text = normalizeText(raw);
    if (!text) {
      ui.assistantAnswer.innerHTML = "Escribe algo como: <em>“ferias en Alemania”, “aranceles UE”, “estadísticas importación”</em>.";
      renderLinks(ui.assistantLinks, []);
      return;
    }

    const country = detectHint(text, COUNTRY_HINTS);
    const sector = detectHint(text, SECTOR_HINTS);

    let best = { intent: null, score: 0 };
    for (const intent of ASSISTANT_INTENTS) {
      const s = scoreIntent(text, intent);
      if (s > best.score) best = { intent, score: s };
    }

    if (!best.intent || best.score < 2) {
      ui.assistantAnswer.innerHTML = "No estoy seguro de qué tipo de recurso buscas. Te muestro resultados en <strong>Todos</strong> y puedes afinar con las categorías.";
      applyFilters("all", raw);
      renderLinks(ui.assistantLinks, []);
      return;
    }

    ui.assistantAnswer.innerHTML = best.intent.answer({ country, sector });
    applyFilters(best.intent.name, raw);
    renderLinks(ui.assistantLinks, pickTopResources(resources, best.intent.name, raw, 6));
  }

  ready(function () {
    // Comprueba que existe tu array resources
    if (!Array.isArray(window.resources)) {
      // Si no existe todavía, reintenta un poco
      let tries = 0;
      const t = setInterval(() => {
        tries++;
        if (Array.isArray(window.resources)) {
          clearInterval(t);
          init();
        }
        if (tries > 40) clearInterval(t); // ~4s
      }, 100);
      return;
    }
    init();
  });

  function init() {
    const ui = ensureAssistantUI();
    if (!ui) return;

    ui.assistantBtn.addEventListener("click", () => runAssistant(ui.assistantInput.value, ui, window.resources));
    ui.assistantInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runAssistant(ui.assistantInput.value, ui, window.resources);
    });
  }
})();
