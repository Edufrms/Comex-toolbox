/* ComexToolbox: optional analytics consent. Advertising consent is managed by Google's certified CMP in AdSense. */
(function () {
  "use strict";
  const STORAGE_KEY = "comextoolbox-analytics-consent-v1";
  const MEASUREMENT_ID = "G-J1YVJESR6W";
  const english = document.documentElement.lang === "en";
  const t = english ? {
    title: "Optional analytics cookies",
    description: "Allow Google Analytics to measure visits and improve ComexToolbox? This choice is separate from the advertising consent managed by Google.",
    accept: "Allow analytics", reject: "Reject analytics",
    settings: "Analytics settings", close: "Close analytics settings",
    policy: "Privacy policy", statusOn: "Analytics enabled.", statusOff: "Analytics disabled."
  } : {
    title: "Cookies de analítica opcionales",
    description: "¿Permites que Google Analytics mida las visitas para mejorar ComexToolbox? Esta elección es independiente del consentimiento publicitario gestionado por Google.",
    accept: "Aceptar analítica", reject: "Rechazar analítica",
    settings: "Configurar analítica", close: "Cerrar configuración",
    policy: "Política de privacidad", statusOn: "Analítica activada.", statusOff: "Analítica desactivada."
  };
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  // This must execute before the AdSense script or any Google tag.
  window.gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied",
    ad_personalization: "denied", analytics_storage: "denied",
    wait_for_update: 500
  });
  window.gtag("set", "ads_data_redaction", true);
  let choice = null;
  try { const stored = localStorage.getItem(STORAGE_KEY); if (stored === "yes" || stored === "no") choice = stored; } catch (_) {}
  let analyticsLoaded = false;
  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID);
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);
  }
  if (choice === "yes") {
    window.gtag("consent", "update", {analytics_storage: "granted"});
    loadAnalytics();
  }
  function choose(value) {
    choice = value;
    try { localStorage.setItem(STORAGE_KEY, value); } catch (_) {}
    window.gtag("consent", "update", {analytics_storage: value === "yes" ? "granted" : "denied"});
    if (value === "yes") loadAnalytics();
    // Revoke consent for subsequent requests. Refresh to stop already loaded Analytics.
    if (value === "no" && analyticsLoaded) window.location.reload();
    if (panel) panel.hidden = true;
    if (launcher) launcher.setAttribute("aria-label", t.settings);
    if (live) live.textContent = value === "yes" ? t.statusOn : t.statusOff;
  }
  let panel, launcher, live;
  function button(label, callback, className) {
    const element = document.createElement("button");
    element.type = "button";
    element.textContent = label;
    element.className = className;
    element.addEventListener("click", callback);
    return element;
  }
  function init() {
    panel = document.createElement("section");
    panel.className = "analytics-consent-panel";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", t.title);
    panel.hidden = choice !== null;
    const heading = document.createElement("h2"); heading.textContent = t.title;
    const description = document.createElement("p"); description.textContent = t.description;
    const policy = document.createElement("a");
    policy.href = english ? "privacy.html" : "privacidad.html"; policy.textContent = t.policy;
    const actions = document.createElement("div"); actions.className = "analytics-consent-actions";
    actions.append(button(t.reject, () => choose("no"), "analytics-consent-reject"),
      button(t.accept, () => choose("yes"), "analytics-consent-accept"));
    panel.append(heading, description, policy, actions);
    launcher = button(t.settings, () => { panel.hidden = !panel.hidden; if (!panel.hidden) panel.querySelector("button").focus(); }, "analytics-consent-launcher");
    launcher.setAttribute("aria-label", t.settings);
    live = document.createElement("span"); live.className = "analytics-consent-sr-only";
    live.setAttribute("role", "status"); live.setAttribute("aria-live", "polite");
    document.body.append(panel, launcher, live);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
