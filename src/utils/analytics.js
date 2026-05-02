/** Optional GA-style events (loads gtag if VITE_GA_MEASUREMENT_ID is set). */
const GA_KEY = typeof import.meta !== "undefined" ? import.meta.env?.VITE_GA_MEASUREMENT_ID : "";

let gaInjected = false;

function injectGtag() {
  if (typeof window === "undefined" || gaInjected || !GA_KEY) return;
  gaInjected = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_KEY}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_KEY, { send_page_view: false });
}

/**
 * @param {string} name
 * @param {Record<string, string | number>} [params]
 */
export function trackEvent(name, params) {
  injectGtag();
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params ?? {});
  }
}
