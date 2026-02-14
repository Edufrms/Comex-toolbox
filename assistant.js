(() => {
  const INTENTS = [
    {
      cat: "Buscadores de Ferias",
      keywords: ["feria","ferias","evento","eventos","exposicion","exposiciones","trade show","tradeshow","exhibition","calendar","calendario","congreso"],
      answer: (ctx) => {
        const a = [];
        a.push("Parece que buscas <strong>ferias/eventos</strong>.");
        if (ctx.country) a.push(`Destino: <strong>${ctx.country}</strong>.`);
        if (ctx.sector) a.push(`Sector: <strong>${ctx.sector}</strong>.`);
        return a.join(" ");
      }
    },
    {
      cat: "Acceso a Mercados",
      keywords: ["arancel","aranceles","taric","aduana","aduanas","normativa","requisitos","regulacion","regulaciones","acuerdo","acuerdos","origen","rules of origin","certificado","sanitario","fitosanitario"],
      answer: () => "Parece que buscas <strong>acceso a mercados</strong>: aranceles, normativa, requisitos o reglas de origen."
    },
    {
      cat: "Estadísticas y Datos",
      keywords: ["estadistica","estadisticas","datos","exportaciones","importaciones","comtrade","trademap","datacomex","eurostat","ranking","volumen","valor"],
      answer: () => "Parece que buscas <strong>estadísticas y datos</strong> de comercio (export/import, series, rankings)."
    },
    {
      cat: "Análisis de Mercados",
      keywords: ["analisis","mercado","oportunidad","potencial","competencia","tendencia","trend","atlas","complexity","market finder","demanda"],
      answer: () => "Parece que buscas <strong>análisis de mercados</strong>: oportunidades, potencial y tendencias."
    },
    {
      cat: "Financiación y Riesgos",
      keywords: ["riesgo","riesgo pais","cobertura","seguro","credito","coface","cesce","financiacion","cobro","pago"],
      answer: () => "Parece que buscas <strong>financiación y riesgo</strong>: riesgo país, seguro de crédito, medios de pago, etc."
    },
    {
      cat: "Formación y Recursos",
      keywords: ["curso","formacion","recursos","guia","tutorial","contenedor","searates","marinetraffic","icontainers","aprende","logistica"],
      answer: () => "Parece que buscas <strong>formación y recursos</strong> prácticos."
    }
  ];

  const COUNTRY_HINTS = [
    "alemania","francia","italia","portugal","espana","méxico","mexico","colombia","peru","chile","argentina",
    "brasil","usa","eeuu","estados unidos","canada","reino unido","uk","polonia","marruecos","turquia",
    "india","china","japon","corea","emiratos","arabia saudi","sudafrica","australia"
  ];

  const SECTOR_HINTS = [
    "alimentacion","agroalimentario","food","bebidas","vino","wine","packaging","envase","maquinaria",
    "textil","moda","construccion","automocion","farmaceutico","cosmetica","mueble","tecnologia","energia"
  ];

  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function detectHint(text, list) {
    for (const item of list) {
      const it = normalize(item);
      if (it && text.includes(it)) return item;
    }
    return "";
  }

  function scoreIntent(text, intent) {
    let score = 0;
    for (const kw of intent.keywords) {
      const k = normalize(kw);
      if (!k) continue;
      if (text.includes(k)) score += (k.length >= 6 ? 3 : 2);
    }
    return score;
  }

  function clickCategory(categoryName) {
    const btn = Array.from(document.querySelectorAll(".category-btn"))
      .find(b => b.dataset && b.dataset.category === categoryName);

    if (btn) btn.click();
  }

  function setSearchValue(val) {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    searchInput.value = val;
    // Dispara el listener que ya tienes en index
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function pickTopResources(categoryName, query, max = 6) {
    // OJO: aquí sí leemos `resources`, pero como IDENTIFICADOR global (no window.resources)
    if (typeof resources === "undefined" || !Array.isArray(resources)) return [];
    const q = normalize(query);
    const terms = q.split(" ").filter(t => t.length >= 3);

    return resources
      .filter(r => r.category === categoryName)
      .map(r => {
        const hay = normalize((r.title || "") + " " + (r.description || ""));
        let s = 1;
        for (const t of terms) if (hay.includes(t)) s += 2;
        return { r, s };
      })
      .sort((a,b) => b.s - a.s)
      .slice(0, max)
      .map(x => x.r);
  }

  function renderLinks(container, items) {
    if (!container) return;
    if (!items || !items.length) { container.innerHTML = ""; return; }
    container.innerHTML = items.map(it => `
      <a href="${it.learnUrl}" target="_blank" rel="noopener"
         style="display:inline-flex; gap:8px; align-items:center; padding:8px 10px; border:1px solid #e5e7eb; border-radius:999px; text-decoration:none; color:#111827; background:#fff;">
        📘 ${it.title}
      </a>
    `).join("");
  }

  function ensureUI() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return null;

    if (document.getElementById("assistantInput")) {
      return {
        input: document.getElementById("assistantInput"),
        btn: document.getElementById("assistantBtn"),
        ans: document.getElementById("assistantAnswer"),
        links: document.getElementById("assistantLinks")
      };
    }

    const wrap = document.createElement("div");
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

    // Inserta el asistente antes del buscador normal
    searchInput.parentElement.insertBefore(wrap, searchInput);

    return {
      input: wrap.querySelector("#assistantInput"),
      btn: wrap.querySelector("#assistantBtn"),
      ans: wrap.querySelector("#assistantAnswer"),
      links: wrap.querySelector("#assistantLinks")
    };
  }

  function run(raw, ui) {
    const text = normalize(raw);
    if (!text) {
      ui.ans.innerHTML = "Escribe algo como: <em>“ferias en Alemania”, “aranceles UE”, “estadísticas importación”</em>.";
      renderLinks(ui.links, []);
      return;
    }

    const country = detectHint(text, COUNTRY_HINTS);
    const sector = detectHint(text, SECTOR_HINTS);

    let best = { intent: null, score: 0 };
    for (const intent of INTENTS) {
      const s = scoreIntent(text, intent);
      if (s > best.score) best = { intent, score: s };
    }

    if (!best.intent || best.score < 2) {
      ui.ans.innerHTML = "No estoy seguro de qué tipo de recurso buscas. Te muestro resultados en <strong>Todos</strong> y puedes afinar con las categorías.";
      clickCategory("all");
      setSearchValue(raw);
      renderLinks(ui.links, []);
      document.getElementById("resourcesGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    ui.ans.innerHTML = best.intent.answer({ country, sector });

    // Aplica filtros SIN tocar variables internas: click + input event
    clickCategory(best.intent.cat);
    setSearchValue(raw);

    // Sugiere tutoriales de esa categoría
    renderLinks(ui.links, pickTopResources(best.intent.cat, raw, 6));

    document.getElementById("resourcesGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function init() {
    const ui = ensureUI();
    if (!ui) return;

    ui.btn.addEventListener("click", () => run(ui.input.value, ui));
    ui.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") run(ui.input.value, ui);
    });
  }

  // Espera a que exista #searchInput (tu DOM estático lo tiene)
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
