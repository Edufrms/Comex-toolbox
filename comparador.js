(function() {
"use strict";
const data=window.COMEX_COMPARE_DATA||[],root=document.getElementById("cmp-app");
if(!root||!data.length)return;
const lang=document.documentElement.lang==="en"?"en":"es",en=lang==="en";
const txt={
categories:{mercado:en?"Market analysis":"Análisis de mercados",datos:en?"Statistics and data":"Estadísticas y datos",acceso:en?"Rules and market access":"Normativa y acceso",riesgo:en?"Finance and risk":"Financiación y riesgos",logistica:en?"Logistics":"Logística",ferias:en?"Trade fairs":"Ferias",recursos:en?"Support and training":"Formación y apoyo"},
all:en?"All categories":"Todas las categorías",select:en?"Select":"Seleccionar",remove:en?"Remove":"Quitar",limit:en?"Maximum four tools per comparison.":"Puedes seleccionar hasta cuatro herramientas.",minimum:en?"Select at least two tools.":"Selecciona al menos dos herramientas.",nothing:en?"No matches. Try another keyword.":"No hay resultados. Prueba otra búsqueda.",counter:en?"tools found":"herramientas encontradas",selected:en?"selected":"seleccionadas",empty:en?"Choose two to four tools to compare their uses and limitations.":"Elige entre dos y cuatro herramientas para contrastar usos y limitaciones.",focus:en?"What it covers":"Información que ofrece",use:en?"When to choose it":"Cuándo utilizarla",caution:en?"What to verify":"Qué comprobar",category:en?"Category":"Categoría",tutorial:en?"Open tutorial":"Ver tutorial",combo:en?"How to combine them":"Cómo combinarlas",copyDone:en?"Summary copied.":"Resumen copiado.",copyFail:en?"Automatic copying is unavailable.":"No se pudo copiar automáticamente.",
different:en?"These tools address different stages of a trade operation and can complement one another.":"Las herramientas cubren distintas fases de una operación y pueden complementarse.",same:en?"These tools share a broad category, but their sources, methods and questions differ.":"Comparten una categoría general, pero sus fuentes, métodos y preguntas son diferentes.",
trade:en?"Trade Map reviews international trade flows; DataComex focuses on Spain and UN Comtrade helps cross-check reported mirror statistics.":"Trade Map ofrece flujos históricos internacionales; DataComex se centra en España y UN Comtrade permite contrastar datos espejo.",
tariff:en?"TARIC addresses EU import measures; Market Access Map compares international treatments. Use the correct HS code, origin and date.":"TARIC recoge medidas de importación UE; Market Access Map compara regímenes internacionales. Comprueba código, origen y fecha.",
fairs:en?"AUMA specialises in German exhibitions; 10times and EventsEye expand international discovery. Confirm event dates with organisers.":"AUMA se centra en ferias alemanas; 10times y Eventseye amplían la búsqueda global. Confirma fechas con los organizadores.",
risk:en?"Coface and CESCE address country risk; SanctionsKit screens possible sanctions matches, not buyer solvency.":"Coface y CESCE analizan riesgo país; SanctionsKit ayuda a identificar posibles sanciones, no a medir solvencia.",
freight:en?"iContainers compares freight options while Load Calculator estimates geometric capacity; neither replaces actual shipping terms or safe stowage.":"iContainers compara opciones de transporte y Load Calculator estima capacidad geométrica; ninguno sustituye condiciones reales o estiba segura."
};
const $=id=>document.getElementById(id),catalog=$("cmp-catalog"),chosenEl=$("cmp-selected"),out=$("cmp-results"),note=$("cmp-notice"),counter=$("cmp-count"),copy=$("cmp-copy"),count=$("cmp-selected-count"),search=$("cmp-search"),filter=$("cmp-category");
const lookup=new Map(data.map(t=>[t.id,t]));
let selected=[];
try{const u=new URL(location.href);selected=[...new Set((u.searchParams.get("tools")||"").split(",").map(Number).filter(id=>lookup.has(id)))].slice(0,4)}catch(e){}
if(!selected.length)selected=[3,19,20];
const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
const categories=["all",...new Set(data.map(t=>t.category))];
categories.forEach(cat=>{const o=node("option","",cat==="all"?txt.all:txt.categories[cat]);o.value=cat;filter.appendChild(o);});
function message(text){note.textContent=text;note.hidden=!text;}
function save(){try{const u=new URL(location.href);if(selected.length)u.searchParams.set("tools",selected.join(","));else u.searchParams.delete("tools");history.replaceState(null,"",u.pathname+u.search+u.hash)}catch(e){}}
function insight(){
const ids=selected,has=(a,b)=>ids.includes(a)&&ids.includes(b),list=selected.map(id=>lookup.get(id));
if(has(3,19)||has(3,20)||has(19,20))return txt.trade;
if(has(4,8)||has(8,14))return txt.tariff;
if(has(33,34)||has(33,36))return txt.fairs;
if(has(13,16)||has(16,38))return txt.risk;
if(has(27,28))return txt.freight;
return list.every(t=>t.category===list[0].category)?txt.same:txt.different;
}
function renderCatalog(){
catalog.replaceChildren();
const q=search.value.trim().toLocaleLowerCase(lang),cat=filter.value;
const filtered=data.filter(t=>(cat==="all"||t.category===cat)&&(!q||(t.name+" "+t.scope[lang]+" "+t.best[lang]).toLocaleLowerCase(lang).includes(q)));
counter.textContent=filtered.length+" "+txt.counter;
if(!filtered.length){catalog.append(node("p","cmp-empty",txt.nothing));return;}
filtered.forEach(t=>{
const active=selected.includes(t.id),card=node("article","cmp-tool"+(active?" is-selected":""));
const body=node("div","cmp-tool__body");body.append(node("span","cmp-tool__category",txt.categories[t.category]),node("h3","cmp-tool__name",t.name),node("p","cmp-tool__purpose",t.best[lang]));card.append(body);
const btn=node("button","cmp-tool__toggle",active?txt.remove:txt.select);btn.type="button";btn.setAttribute("aria-pressed",String(active));btn.setAttribute("aria-label",(active?txt.remove:txt.select)+" "+t.name);
btn.addEventListener("click",()=>{
if(active)selected=selected.filter(id=>id!==t.id);
else if(selected.length>=4){message(txt.limit);return;}else selected.push(t.id);
message("");refresh();
});
card.append(btn);catalog.append(card);
});
}
function renderChosen(){
count.textContent=selected.length+"/4 "+txt.selected;
chosenEl.replaceChildren();
selected.forEach(id=>{const t=lookup.get(id),chip=node("span","cmp-chip");chip.append(node("span","",t.name));const b=node("button","cmp-chip__remove","×");b.type="button";b.setAttribute("aria-label",txt.remove+" "+t.name);b.addEventListener("click",()=>{selected=selected.filter(x=>x!==id);message("");refresh()});chip.append(b);chosenEl.append(chip)});
}
function renderResults(){
out.replaceChildren();copy.disabled=selected.length<2;
if(selected.length<2){out.append(node("p","cmp-empty",txt.empty));return;}
const scroll=node("div","cmp-table-scroll");scroll.tabIndex=0;scroll.setAttribute("role","region");scroll.setAttribute("aria-label",en?"Comparison table":"Tabla comparativa");
const table=node("table","cmp-table"),thead=node("thead"),tr=node("tr");
const first=node("th","cmp-table__label",en?"Criterion":"Criterio");first.scope="col";tr.append(first);
selected.forEach(id=>{const th=node("th","cmp-table__name",lookup.get(id).name);th.scope="col";tr.append(th)});
thead.append(tr);table.append(thead);
const body=node("tbody"),fields=[["category",txt.category],["scope",txt.focus],["best",txt.use],["limit",txt.caution],["guide",txt.tutorial]];
fields.forEach(pair=>{
const row=node("tr"),h=node("th","cmp-table__label",pair[1]);h.scope="row";row.append(h);
selected.forEach(id=>{
const t=lookup.get(id),cell=node("td");
if(pair[0]==="category")cell.textContent=txt.categories[t.category];
else if(pair[0]==="guide"){const a=node("a","cmp-table__link",txt.tutorial+" ↗");a.href=en?t.guideEn:t.guide;a.target="_blank";a.rel="noopener noreferrer";cell.append(a)}
else cell.textContent=t[pair[0]][lang];
row.append(cell);
});body.append(row);
});table.append(body);scroll.append(table);out.append(scroll);
const extra=node("div","cmp-insight");extra.append(node("h3","",txt.combo),node("p","",insight()));out.append(extra);
}
function refresh(){save();renderCatalog();renderChosen();renderResults();}
search.addEventListener("input",renderCatalog);
filter.addEventListener("change",renderCatalog);
$("cmp-clear").addEventListener("click",()=>{selected=[];message("");refresh()});
$("cmp-view").addEventListener("click",()=>{if(selected.length<2){message(txt.minimum);return;}message("");out.scrollIntoView({behavior:"smooth",block:"start"})});
document.querySelectorAll("[data-cmp-preset]").forEach(btn=>btn.addEventListener("click",()=>{
selected=[...new Set(btn.getAttribute("data-cmp-preset").split(",").map(Number).filter(id=>lookup.has(id)))].slice(0,4);
message("");refresh();out.scrollIntoView({behavior:"smooth",block:"start"});
}));
copy.addEventListener("click",()=>{
if(selected.length<2)return;
const lines=[en?"ComexToolbox tool comparison":"Comparación de herramientas ComexToolbox",location.href,""];
selected.forEach(id=>{const t=lookup.get(id);lines.push(t.name,txt.focus+": "+t.scope[lang],txt.use+": "+t.best[lang],txt.caution+": "+t.limit[lang],txt.tutorial+": "+new URL(en?t.guideEn:t.guide,location.href).href,"")});
lines.push(txt.combo+": "+insight());
if(!navigator.clipboard||!navigator.clipboard.writeText){message(txt.copyFail);return;}
navigator.clipboard.writeText(lines.join("\n")).then(()=>message(txt.copyDone),()=>message(txt.copyFail));
});
refresh();
})();