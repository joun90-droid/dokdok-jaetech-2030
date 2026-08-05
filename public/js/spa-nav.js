/**
 * spa-nav.js — 같은 사이트 .html 링크 클릭 시 main 영역만 부드럽게 교체 (MPA + 가벼운 SPA)
 * data-full-nav 속성이 있는 링크·외부 링크·복잡한 페이지는 전체 새로고침
 */
(function () {
  // 페이지별 CSS/스크립트가 많은 화면은 전체 로드 (SPA main 교체만 하면 스타일 누락)
  const SKIP_PATHS = /\/(stock-tech|stock-fund|stock-education|dashboard|stock-price|real-estate)(\.html)?$/;
  const FADE_MS = 220;

  function sameOriginPage(href) {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return null;
      if (url.pathname.match(/\.(pdf|zip|png|jpg|jpeg|gif|svg|json|xml)$/i)) return null;
      return url.pathname + url.search + url.hash;
    } catch {
      return null;
    }
  }

  function shouldSpaNavigate(anchor, path) {
    if (!path || anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
    if (anchor.dataset.fullNav === "true") return false;
    const bare = path.split("#")[0];
    if (SKIP_PATHS.test(bare) || SKIP_PATHS.test(location.pathname)) return false;
    if (path.includes("#") && bare === location.pathname + location.search) return false;
    return !!document.querySelector("main");
  }

  function absUrl(href) {
    try {
      return new URL(href, location.href).href;
    } catch {
      return href;
    }
  }

  function applyPageStyles(doc) {
    document.querySelectorAll("[data-spa-style]").forEach((el) => el.remove());

    doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const abs = absUrl(href);
      const exists = [...document.querySelectorAll('link[rel="stylesheet"]')].some((l) => l.href === abs);
      if (exists) return;
      const el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = href.startsWith("http") || href.startsWith("/") ? href : abs;
      el.setAttribute("data-spa-style", "1");
      document.head.appendChild(el);
    });

    doc.querySelectorAll("head style").forEach((style) => {
      const el = document.createElement("style");
      el.textContent = style.textContent || "";
      el.setAttribute("data-spa-style", "1");
      document.head.appendChild(el);
    });
  }

  function runPageScripts(doc) {
    applyPageStyles(doc);
    doc.querySelectorAll("script[src]").forEach((script) => {
      const src = script.getAttribute("src");
      if (!src || src.includes("spa-nav.js") || src.includes("main.js")) return;
      const abs = absUrl(src);
      if ([...document.querySelectorAll("script[src]")].some((s) => absUrl(s.getAttribute("src") || "") === abs)) {
        return;
      }
      const el = document.createElement("script");
      el.src = src.startsWith("http") || src.startsWith("/") ? src : abs;
      el.defer = true;
      document.body.appendChild(el);
    });
    document.dispatchEvent(new CustomEvent("spa:navigate", { detail: { path: location.pathname } }));
  }

  async function navigateTo(path, push) {
    const fetchPath = path.split("#")[0] || "/";
    document.body.classList.add("spa-loading");

    try {
      const res = await fetch(fetchPath, { headers: { Accept: "text/html" } });
      if (!res.ok) {
        location.href = path;
        return;
      }

      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const nextMain = doc.querySelector("main");
      const curMain = document.querySelector("main");

      if (!nextMain || !curMain) {
        location.href = path;
        return;
      }

      const doSwap = () => {
        curMain.replaceWith(nextMain);
        if (doc.title) document.title = doc.title;
        if (push) history.pushState({ spaPath: fetchPath }, "", path);
        runPageScripts(doc);
        const hash = path.includes("#") ? path.slice(path.indexOf("#")) : "";
        if (hash) {
          const id = hash.slice(1);
          const target = document.getElementById(id);
          if (target) {
            requestAnimationFrame(() => {
              const top = target.getBoundingClientRect().top + window.scrollY - 80;
              window.scrollTo({ top, behavior: "smooth" });
            });
          }
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      };

      if (document.startViewTransition) {
        await document.startViewTransition(doSwap).finished;
      } else {
        curMain.style.transition = `opacity ${FADE_MS}ms ease`;
        curMain.style.opacity = "0";
        await new Promise((r) => setTimeout(r, FADE_MS));
        doSwap();
        nextMain.style.opacity = "0";
        nextMain.style.transition = `opacity ${FADE_MS}ms ease`;
        requestAnimationFrame(() => { nextMain.style.opacity = "1"; });
      }
    } catch {
      location.href = path;
    } finally {
      document.body.classList.remove("spa-loading");
    }
  }

  document.addEventListener("click", (e) => {
    const anchor = e.target.closest("a[href]");
    if (!anchor) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const path = sameOriginPage(anchor.getAttribute("href"));
    if (!shouldSpaNavigate(anchor, path)) return;

    e.preventDefault();
    navigateTo(path, true);
  });

  window.addEventListener("popstate", (e) => {
    if (e.state?.spaPath) navigateTo(e.state.spaPath + location.hash, false);
  });
})();
