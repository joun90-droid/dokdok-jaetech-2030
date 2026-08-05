/**
 * site-chrome.js — 최상단 고정 바: 다크/라이트 · 한국어/English
 * localStorage: ft_theme (dark|light), ft_lang (ko|en)
 */
(function () {
  const THEME_KEY = "ft_theme";
  const LANG_KEY = "ft_lang";

  const I18N = {
    ko: {
      themeDark: "다크",
      themeLight: "화이트",
      langKo: "한국어",
      langEn: "English",
      home: "홈",
      stockPrice: "주식시세추천",
      stockEdu: "주식교육창",
      savings: "예적금",
      etf: "ETF",
      realEstate: "부동산",
      guide: "가이드",
      about: "운영자 소개",
      contact: "문의하기",
      privacy: "개인정보처리방침",
      brand: "영재 재테크",
      heroTitle: "똑똑한 재테크 2030",
      heroSub: "복잡한 정보는 줄이고, 꼭 필요한 재테크만. 아래 메뉴에서 바로 시작하세요.",
      cardStock: "주식시세추천",
      cardStockSub: "오늘의 추천 종목 · 시세",
      cardEstate: "부동산 실시간 시세",
      cardEstateSub: "지역별 시세 · 청약 · 트렌드",
      cardSavings: "예적금",
      cardSavingsSub: "청년도약계좌 · 우대 금리",
      cardEtf: "ETF",
      cardEtfSub: "S&P500 · KODEX 200 적립",
      cardGuide: "재테크 초보 가이드",
      cardGuideSub: "예적금 · ETF · 청약 가이드",
      cardPortfolio: "2030 맞춤 포트폴리오",
      cardPortfolioSub: "적립식 투자 · ISA 활용법",
      eduTitle: "주식교육창",
      eduSub: "주식 투자에 필요한 핵심 분석 방법을 배워보세요.",
      eduTech: "기술적 분석",
      eduTechSub: "차트, 이동평균선, RSI 분석법",
      eduFund: "기본적 분석",
      eduFundSub: "PER, PBR, ROE, 재무제표 분석",
      disclaimer: "본 사이트의 정보는 참고용이며 투자 권유가 아닙니다.",
      copyright: "© 2026 영재 재테크 2030",
      menuOpen: "메뉴 열기",
      menuClose: "메뉴 닫기",
    },
    en: {
      themeDark: "Dark",
      themeLight: "Light",
      langKo: "한국어",
      langEn: "English",
      home: "Home",
      stockPrice: "Stock Picks",
      stockEdu: "Stock School",
      savings: "Savings",
      etf: "ETF",
      realEstate: "Real Estate",
      guide: "Guides",
      about: "About",
      contact: "Contact",
      privacy: "Privacy Policy",
      brand: "Youngjae Finance",
      heroTitle: "Smart Investing 2030",
      heroSub: "Less noise, only what matters. Start from the menu below.",
      cardStock: "Stock Picks",
      cardStockSub: "Today’s picks · live quotes",
      cardEstate: "Live Real Estate",
      cardEstateSub: "Local prices · subscriptions · trends",
      cardSavings: "Savings",
      cardSavingsSub: "Youth accounts · preferential rates",
      cardEtf: "ETF",
      cardEtfSub: "S&P 500 · KODEX 200 DCA",
      cardGuide: "Beginner Guides",
      cardGuideSub: "Savings · ETF · housing guides",
      cardPortfolio: "2030 Portfolio",
      cardPortfolioSub: "DCA investing · ISA tips",
      eduTitle: "Stock School",
      eduSub: "Learn the core analysis methods for investing.",
      eduTech: "Technical Analysis",
      eduTechSub: "Charts, moving averages, RSI",
      eduFund: "Fundamental Analysis",
      eduFundSub: "PER, PBR, ROE, financial statements",
      disclaimer: "Information on this site is for reference only and is not investment advice.",
      copyright: "© 2026 Youngjae Finance 2030",
      menuOpen: "Open menu",
      menuClose: "Close menu",
    },
  };

  /** 네비/푸터 한글 라벨 → i18n 키 */
  const LABEL_KEYS = {
    "홈": "home",
    "주식시세추천": "stockPrice",
    "주식교육창": "stockEdu",
    "주식교육장": "stockEdu",
    "예적금": "savings",
    "ETF": "etf",
    "부동산": "realEstate",
    "가이드": "guide",
    "운영자 소개": "about",
    "문의하기": "contact",
    "개인정보처리방침": "privacy",
    "Home": "home",
    "Stock Picks": "stockPrice",
    "Stock School": "stockEdu",
    "Savings": "savings",
    "Real Estate": "realEstate",
    "Guides": "guide",
    "About": "about",
    "Contact": "contact",
    "Privacy Policy": "privacy",
  };

  function getTheme() {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" ? "light" : "dark";
  }

  function getLang() {
    const l = localStorage.getItem(LANG_KEY);
    return l === "en" ? "en" : "ko";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    syncChromeButtons();
  }

  function t(key, langOverride) {
    const lang = langOverride || getLang();
    return (I18N[lang] && I18N[lang][key]) || I18N.ko[key] || key;
  }

  function applyLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : "ko");
    const tr = (key) => t(key, lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const value = tr(key);
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = value;
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (key) el.setAttribute("aria-label", tr(key));
    });

    document.querySelectorAll(".nav-links a, .footer-nav a").forEach((a) => {
      const raw = (a.getAttribute("data-i18n-label") || a.textContent || "").trim();
      if (!a.getAttribute("data-i18n-label")) {
        a.setAttribute("data-i18n-label", raw);
      }
      const label = a.getAttribute("data-i18n-label");
      const key = LABEL_KEYS[label];
      if (key) a.textContent = tr(key);
    });

    document.querySelectorAll(".logo-text").forEach((el) => {
      const accent = el.querySelector(".logo-accent");
      const accentHtml = accent ? accent.outerHTML : '<span class="logo-accent">2030</span>';
      el.innerHTML = `${tr("brand")} ${accentHtml}`;
    });

    document.querySelectorAll(".menu-toggle").forEach((btn) => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-label", open ? tr("menuClose") : tr("menuOpen"));
    });

    syncChromeButtons();
  }

  function syncChromeButtons() {
    const theme = getTheme();
    const lang = getLang();
    document.querySelectorAll("[data-chrome-theme]").forEach((btn) => {
      const on = btn.getAttribute("data-chrome-theme") === theme;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-chrome-lang]").forEach((btn) => {
      const on = btn.getAttribute("data-chrome-lang") === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    const themeGroup = document.querySelector(".site-chrome-theme");
    if (themeGroup) themeGroup.setAttribute("data-active", theme);
    const langGroup = document.querySelector(".site-chrome-lang");
    if (langGroup) langGroup.setAttribute("data-active", lang);
  }

  function ensureCss() {
    if (document.querySelector('link[data-site-chrome-css]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/site-chrome.css?v=20260805d";
    link.setAttribute("data-site-chrome-css", "1");
    document.head.appendChild(link);
  }

  function injectBar() {
    if (document.querySelector(".site-chrome")) return;
    document.documentElement.classList.add("has-site-chrome");

    const bar = document.createElement("div");
    bar.className = "site-chrome";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Theme and language");
    bar.innerHTML = `
      <div class="site-chrome-inner">
        <div class="site-chrome-group site-chrome-theme" role="group" aria-label="Theme" data-active="dark">
          <span class="site-chrome-thumb" aria-hidden="true"></span>
          <button type="button" class="site-chrome-btn" data-chrome-theme="dark" data-i18n-aria="themeDark" aria-label="다크" aria-pressed="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/></svg>
          </button>
          <button type="button" class="site-chrome-btn" data-chrome-theme="light" data-i18n-aria="themeLight" aria-label="화이트" aria-pressed="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          </button>
        </div>
        <span class="site-chrome-sep" aria-hidden="true"></span>
        <div class="site-chrome-group site-chrome-lang" role="group" aria-label="Language" data-active="ko">
          <span class="site-chrome-thumb" aria-hidden="true"></span>
          <button type="button" class="site-chrome-btn" data-chrome-lang="ko" data-i18n-aria="langKo" aria-label="한국어" aria-pressed="false">
            <span class="site-chrome-btn-label">KO</span>
          </button>
          <button type="button" class="site-chrome-btn" data-chrome-lang="en" data-i18n-aria="langEn" aria-label="English" aria-pressed="false">
            <span class="site-chrome-btn-label">EN</span>
          </button>
        </div>
      </div>
    `;
    document.body.prepend(bar);

    bar.addEventListener("click", (e) => {
      const themeBtn = e.target.closest("[data-chrome-theme]");
      if (themeBtn) {
        applyTheme(themeBtn.getAttribute("data-chrome-theme"));
        return;
      }
      const langBtn = e.target.closest("[data-chrome-lang]");
      if (langBtn) {
        applyLang(langBtn.getAttribute("data-chrome-lang"));
      }
    });
  }

  function boot() {
    ensureCss();
    // 깜빡임 방지: 테마를 먼저 적용
    applyTheme(getTheme());
    injectBar();
    applyLang(getLang());
  }

  // 초기 테마는 head에서도 가능하도록 즉시 적용
  try {
    const early = localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", early);
  } catch (_) { /* ignore */ }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("spa:navigate", () => {
    applyLang(getLang());
  });
})();
