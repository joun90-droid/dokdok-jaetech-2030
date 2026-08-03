/** 부동산 페이지 — CSS 누락·bfcache 복원 시 스타일/데이터 재적용 */
(function () {
  function cssReady() {
    const app = document.querySelector(".estate-live-app");
    if (!app) return true;
    const br = parseFloat(getComputedStyle(app).borderRadius || "0");
    return br >= 8;
  }

  function injectCss(cb) {
    document.querySelectorAll('link[href*="estate-live.css"]').forEach((l) => l.remove());
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/estate-live.css?v=" + Date.now();
    link.onload = () => setTimeout(cb, 40);
    link.onerror = cb;
    document.head.appendChild(link);
  }

  function ensurePage(force) {
    const boot = () => {
      if (typeof window.bootEstateLive === "function") window.bootEstateLive(!!force);
    };
    if (cssReady()) {
      boot();
      return;
    }
    injectCss(boot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ensurePage(false));
  } else {
    ensurePage(false);
  }
  window.addEventListener("pageshow", () => ensurePage(true));
})();
