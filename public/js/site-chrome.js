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
      contactTitle: "Contact Us · 문의하기",
      contactLead: "영재 재테크 2030을 방문해 주셔서 감사합니다.",
      contactBody: "블로그 콘텐츠에 대한 제안, 오류 수정 요청, 협업·기고 문의는 아래 이메일로 보내 주세요. 영업일 기준 3~5일 내 답변을 드리겠습니다.",
      contactEmailLabel: "📧 이메일:",
      contactNoteTitle: "문의 시 참고해 주세요",
      contactNote1: "투자 종목·매수·매도 등 개별 투자 자문은 제공하지 않습니다.",
      contactNote2: "스팸·광고성 메일은 답변하지 않을 수 있습니다.",
      contactNote3: "개인정보(주민번호, 계좌번호 등)는 메일에 포함하지 말아 주세요.",
      contactSignoff: "감사합니다.",
      contactAuthor: "영재 재테크 2030 · 전영재",
      contactPageTitle: "문의하기 | 영재 재테크 2030",
      contactPageDesc: "영재 재테크 2030 문의하기 — 콘텐츠 제안, 오류 수정, 협업 문의는 joun90@gmail.com 으로 연락해 주세요.",
      rePageTitle: "영재 재테크 2030 | 청년 부동산·청약",
      reHeroTitle: "청년 부동산 가이드 — 실시간 매매·청약·내 집 마련",
      reHeroLead: "전국 지역별 실시간 매매·전세 동향, 투자가치 진단, 임대수익·DSR 계산기와 청년 주택드림 청약 가이드를 한곳에서 확인하세요.",
      reBtnLive: "🏠 지역별 실시간 시세 보기",
      reBtnMap: "🗺️ 시세 지도",
      reAppTitle: "전국 지역별 매매·전세 실거래 현황",
      reAppSub: "매매동향 · 정밀표 · 투자가치 · 임대수익 · DSR 계산기",
      rePageDesc: "청년 부동산 투자·내 집 마련 가이드. 청년 주택드림 청약 자격, 청약 가점, 전세 vs 월세, LTV·DSR 기초. 2030 청년을 위한 부동산 정보.",
      reNavTrends: "매매동향",
      reNavTable: "정밀표",
      reNavInvest: "투자가치",
      reNavRoi: "임대수익",
      reNavLoan: "대출DSR",
      reNavNews: "이슈요약",
      reTickerLabel: "이슈",
      reMapTabApt: "🏢 아파트",
      eduTechTitle: "📈 기술적 분석",
      eduTechHero: '차트 패턴, 캔들스틱, 보조지표를 <strong style="color:var(--cyan)">시각적으로</strong> 학습하세요 — SVG·Canvas 기반 실전 차트',
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
      /* stock-price page */
      spPageTitle: "실시간 주식 시세 추천 | 영재 재테크 2030",
      spPageDesc: "네이버·야후 실시간 API · 가치점수 · PBR/PER/ROE · 100종목 큐레이션",
      spBrand: "영재 재테크",
      spBadge: "주식시세 추천",
      spSubtitle: "네이버 · 야후 실시간 연동 · 🇰🇷국내 & 🇺🇸미국 100종목 · 가치점수 큐레이션",
      spLiveRefresh: "60초 갱신",
      spPauseLive: "실시간 갱신 일시정지",
      spResumeLive: "실시간 갱신 재개",
      spStatTotal: "발굴 종목",
      spStatScore: "평균 가치점수",
      spStatUpside: "평균 상승여력",
      spToastLive: "실시간 LIVE",
      spToastConnecting: "시세 스트리밍 연결 중...",
      spTopPick: "TOP",
      spKr50: "국내",
      spUs50: "미국",
      spBoth: "둘다",
      spNaverData: "네이버",
      spYahooData: "야후",
      spRibbonLive: "실시간 연동",
      spRibbonGrowth: "성장주",
      spRibbonUsLarge: "미국 대형",
      spRibbonTech: "기술주",
      spScreener: "맞춤 스크리너",
      spMarketSelect: "시장 선택",
      spKrMarket: "🇰🇷 국내",
      spUsMarket: "🇺🇸 미국",
      spMarketNone: "시장 미선택",
      spSearchLabel: "종목명 / 코드",
      spSearchPh: "예: 삼성전자, 005930, AAPL",
      spThemeFilter: "테마 필터",
      spFilterAll: "전체",
      spFilterTop: "💎 TOP 80+",
      spFilterUp: "🔺 급등",
      spFilterDown: "🔻 급락",
      spCorsWarn: "⚠️ file:// 로 열면 API(CORS) 차단됩니다.",
      spDeployUrl: "배포 URL",
      spDeployHint: "에서 이용하세요.",
      spPickPrefix: "영재 Pick",
      spPickSuffix: "개",
      spSortScore: "가치점수 높은순",
      spSortUpside: "상승여력 높은순",
      spSortChangeDesc: "등락률 높은순",
      spSortChangeAsc: "등락률 낮은순",
      spSortPbr: "PBR 낮은순",
      spStatusConnecting: "연결 중...",
      spStatusNaver: "네이버 시세 (KRX 종가 · 장마감 후 NXT 시간외) · 60초 갱신",
      spStatusYahoo: "야후 시세 · 60초마다 갱신",
      spLoading: "실시간 데이터를 불러오는 중...",
      spEmpty: "조건에 맞는 종목이 없습니다.",
      spPaused: "일시정지됨",
      spValueScore: "가치",
      spPoints: "점",
      spGradeSuffix: "등급",
      spFairLabel: "AI 적정주가 (참고)",
      spUpside: "여력",
      spDividend: "배당",
      spNaverLink: "네이버",
      spYahooLink: "야후",
      spChartLink: "차트",
      spClickHint: "클릭 → 안전마진 · 매수 논리",
      spFilterSummaryAll: "전체",
      spFilterSummaryTop: "TOP 80+",
      spFilterSummaryUp: "급등",
      spFilterSummaryDown: "급락",
      spCheckedAt: "확인",
      spQuoteAt: "시세",
      spUpdatedAt: "갱신",
      spGradeBuyStrong: "적극 매수",
      spGradeBuy: "매수 추천",
      spGradeHold: "분할 매수",
      spGradeWatch: "관망",
      spGradeWarn: "주의",
      spReasonSMomentumUp: "모멘텀 강세 · 영재 Pick 상위",
      spReasonSMomentumDown: "모멘텀 반등 · 영재 Pick 상위",
      spReasonATrendUp: "추세 양호 · 매수 구간 검토",
      spReasonATrendDown: "추세 조정 · 매수 구간 검토",
      spReasonSurge: "단기 급등 · 분할 익절 고려",
      spReasonDip: "조정 구간 · 분할 매수 관점",
      spReasonRange: "박스권 · 장기 관점 적립",
      spSectorSemi: "반도체",
      spSectorBattery: "2차전지",
      spSectorBio: "바이오",
      spSectorFinance: "금융",
      spSectorAuto: "자동차",
      spSectorPlatform: "플랫폼",
      spSectorEnergy: "에너지",
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
      contactTitle: "Contact Us",
      contactLead: "Thank you for visiting Youngjae Finance 2030.",
      contactBody: "For content suggestions, error reports, or collaboration inquiries, please email us below. We reply within 3–5 business days.",
      contactEmailLabel: "📧 Email:",
      contactNoteTitle: "Before You Contact Us",
      contactNote1: "We do not provide individual investment advice on specific stocks, buys, or sells.",
      contactNote2: "Spam or promotional emails may not receive a reply.",
      contactNote3: "Please do not include personal information (e.g. ID numbers, account numbers) in your email.",
      contactSignoff: "Thank you.",
      contactAuthor: "Youngjae Finance 2030 · Jeon Youngjae",
      contactPageTitle: "Contact | Youngjae Finance 2030",
      contactPageDesc: "Contact Youngjae Finance 2030 — content suggestions, corrections, and collaboration: joun90@gmail.com",
      rePageTitle: "Youngjae Finance 2030 | Youth Real Estate & Housing",
      reHeroTitle: "Youth Real Estate Guide — Live Prices, Subscriptions & Home Ownership",
      reHeroLead: "Regional sale·jeonse trends, investment diagnostics, rental yield & DSR calculators, and Youth Housing Dream guides — all in one place.",
      reBtnLive: "🏠 View live regional prices",
      reBtnMap: "🗺️ Price map",
      reAppTitle: "Regional sale·jeonse transaction data",
      reAppSub: "Trends · Tables · Investment · Rental yield · DSR calculator",
      rePageDesc: "Youth real estate & home ownership guide: Housing Dream subscription, points, jeonse vs rent, LTV·DSR basics for the 2030 generation.",
      reNavTrends: "Sale trends",
      reNavTable: "Data table",
      reNavInvest: "Investment value",
      reNavRoi: "Rental yield",
      reNavLoan: "Loan DSR",
      reNavNews: "News feed",
      reTickerLabel: "Issues",
      reMapTabApt: "🏢 Apartments",
      eduTechTitle: "📈 Technical Analysis",
      eduTechHero: 'Learn chart patterns, candlesticks, and indicators <strong style="color:var(--cyan)">visually</strong> — SVG·Canvas live charts',
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
      spPageTitle: "Live Stock Picks | Youngjae Finance 2030",
      spPageDesc: "Naver & Yahoo live API · value score · PBR/PER/ROE · 100 curated stocks",
      spBrand: "Youngjae Finance",
      spBadge: "Stock Picks",
      spSubtitle: "Naver & Yahoo live · 🇰🇷 KR & 🇺🇸 US 100 stocks · value score curation",
      spLiveRefresh: "60s refresh",
      spPauseLive: "Pause live refresh",
      spResumeLive: "Resume live refresh",
      spStatTotal: "Stocks screened",
      spStatScore: "Avg. value score",
      spStatUpside: "Avg. upside",
      spToastLive: "LIVE",
      spToastConnecting: "Connecting to quote stream...",
      spTopPick: "TOP",
      spKr50: "KR",
      spUs50: "US",
      spBoth: "Both",
      spNaverData: "Naver",
      spYahooData: "Yahoo",
      spRibbonLive: "Live feed",
      spRibbonGrowth: "Growth",
      spRibbonUsLarge: "US large-cap",
      spRibbonTech: "Tech",
      spScreener: "Custom screener",
      spMarketSelect: "Market",
      spKrMarket: "🇰🇷 Korea",
      spUsMarket: "🇺🇸 US",
      spMarketNone: "No market",
      spSearchLabel: "Name / ticker",
      spSearchPh: "e.g. Samsung, 005930, AAPL",
      spThemeFilter: "Theme filter",
      spFilterAll: "All",
      spFilterTop: "💎 TOP 80+",
      spFilterUp: "🔺 Gainers",
      spFilterDown: "🔻 Losers",
      spCorsWarn: "⚠️ Opening via file:// blocks APIs (CORS).",
      spDeployUrl: "Live site",
      spDeployHint: " to use this page.",
      spPickPrefix: "Youngjae Pick",
      spPickSuffix: "",
      spSortScore: "Value score (high)",
      spSortUpside: "Upside (high)",
      spSortChangeDesc: "Change % (high)",
      spSortChangeAsc: "Change % (low)",
      spSortPbr: "PBR (low)",
      spStatusConnecting: "Connecting...",
      spStatusNaver: "Naver quotes (KRX close · NXT after-hours) · 60s refresh",
      spStatusYahoo: "Yahoo quotes · refreshed every 60s",
      spLoading: "Loading live data...",
      spEmpty: "No stocks match your filters.",
      spPaused: "Paused",
      spValueScore: "Value",
      spPoints: "pts",
      spGradeSuffix: " grade",
      spFairLabel: "AI fair value (ref.)",
      spUpside: "upside",
      spDividend: "Div.",
      spNaverLink: "Naver",
      spYahooLink: "Yahoo",
      spChartLink: "Chart",
      spClickHint: "Click → margin of safety · buy thesis",
      spFilterSummaryAll: "All",
      spFilterSummaryTop: "TOP 80+",
      spFilterSummaryUp: "Gainers",
      spFilterSummaryDown: "Losers",
      spCheckedAt: "Checked",
      spQuoteAt: "Quotes",
      spUpdatedAt: "Updated",
      spGradeBuyStrong: "Strong buy",
      spGradeBuy: "Buy",
      spGradeHold: "Scale in",
      spGradeWatch: "Watch",
      spGradeWarn: "Caution",
      spReasonSMomentumUp: "Strong momentum · top Youngjae pick",
      spReasonSMomentumDown: "Rebound momentum · top Youngjae pick",
      spReasonATrendUp: "Healthy trend · consider entry",
      spReasonATrendDown: "Pullback · consider entry",
      spReasonSurge: "Short-term surge · consider taking profits",
      spReasonDip: "Pullback zone · scale-in view",
      spReasonRange: "Range-bound · long-term DCA",
      spSectorSemi: "Semiconductor",
      spSectorBattery: "Battery",
      spSectorBio: "Biotech",
      spSectorFinance: "Finance",
      spSectorAuto: "Auto",
      spSectorPlatform: "Platform",
      spSectorEnergy: "Energy",
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
    return "ko";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    syncChromeButtons();
    document.dispatchEvent(new CustomEvent("ft:themechange", { detail: { theme } }));
  }

  function t(key, langOverride) {
    const lang = langOverride || getLang();
    return (I18N[lang] && I18N[lang][key]) || I18N.ko[key] || key;
  }

  const origTextNodes = new WeakMap();
  const origAttrValues = new WeakMap();

  function shouldReplacePhrase(text, phrase) {
    if (text === phrase) return true;
    if (phrase.length >= 5) return true;
    if (/[\s,.!?·—\-()\/]/.test(phrase)) return true;
    return false;
  }

  function translatePhrase(str, lang) {
    if (lang !== "en" || !str || !window.FT_KO_EN) return str;
    let out = str;
    for (let i = 0; i < window.FT_KO_EN.length; i += 1) {
      const pair = window.FT_KO_EN[i];
      if (!out.includes(pair[0]) || !shouldReplacePhrase(out, pair[0])) continue;
      out = out.split(pair[0]).join(pair[1]);
    }
    return out;
  }

  function shouldSkipTranslate(el) {
    if (!el) return true;
    if (el.closest(".site-chrome")) return true;
    const tag = el.tagName;
    return tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT";
  }

  function deepTranslate(root, lang) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || shouldSkipTranslate(parent)) return NodeFilter.FILTER_REJECT;
        if (parent.closest("[data-i18n]")) return NodeFilter.FILTER_REJECT;
        if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let node = walker.nextNode();
    while (node) {
      if (!origTextNodes.has(node)) origTextNodes.set(node, node.textContent);
      const original = origTextNodes.get(node);
      node.textContent = lang === "en" ? translatePhrase(original, "en") : original;
      node = walker.nextNode();
    }

    root.querySelectorAll("[placeholder], [aria-label], [title]").forEach((el) => {
      if (shouldSkipTranslate(el) || el.hasAttribute("data-i18n") || el.hasAttribute("data-i18n-aria")) return;
      ["placeholder", "aria-label", "title"].forEach((attr) => {
        const val = el.getAttribute(attr);
        if (!val) return;
        const storeKey = `${attr}:${val}`;
        if (!origAttrValues.has(el)) origAttrValues.set(el, {});
        const bag = origAttrValues.get(el);
        if (!bag[attr]) bag[attr] = val;
        el.setAttribute(attr, lang === "en" ? translatePhrase(bag[attr], "en") : bag[attr]);
      });
    });

    const titleEl = document.querySelector("title");
    if (titleEl && !titleEl.hasAttribute("data-i18n")) {
      if (!titleEl.dataset.ftOrigTitle) titleEl.dataset.ftOrigTitle = titleEl.textContent;
      titleEl.textContent = lang === "en"
        ? translatePhrase(titleEl.dataset.ftOrigTitle, "en")
        : titleEl.dataset.ftOrigTitle;
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && !metaDesc.hasAttribute("data-i18n")) {
      if (!metaDesc.dataset.ftOrigContent) metaDesc.dataset.ftOrigContent = metaDesc.getAttribute("content") || "";
      const orig = metaDesc.dataset.ftOrigContent;
      metaDesc.setAttribute("content", lang === "en" ? translatePhrase(orig, "en") : orig);
    }
  }

  let deepTranslateTimer = null;
  function scheduleDeepTranslate(lang) {
    if (deepTranslateTimer) window.clearTimeout(deepTranslateTimer);
    deepTranslateTimer = window.setTimeout(() => {
      deepTranslate(document.body, lang);
    }, 50);
  }

  function ensureDict(cb) {
    if (window.FT_KO_EN) {
      cb();
      return;
    }
    if (document.querySelector("script[data-ft-i18n-dict]")) {
      document.querySelector("script[data-ft-i18n-dict]").addEventListener("load", cb, { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = "/js/ft-i18n-dict.js?v=20260806e";
    s.setAttribute("data-ft-i18n-dict", "1");
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
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
      } else if (el.tagName === "OPTION") {
        el.textContent = value;
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (key) el.innerHTML = tr(key);
    });

    const titleKey = document.querySelector("title[data-i18n]");
    if (titleKey) document.title = tr(titleKey.getAttribute("data-i18n"));

    const metaDesc = document.querySelector('meta[name="description"][data-i18n]');
    if (metaDesc) metaDesc.setAttribute("content", tr(metaDesc.getAttribute("data-i18n")));

    document.querySelectorAll("select option[data-i18n]").forEach((opt) => {
      const key = opt.getAttribute("data-i18n");
      if (key) opt.textContent = tr(key);
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
    const runDeep = () => {
      deepTranslate(document.body, lang);
      scheduleDeepTranslate(lang);
      document.dispatchEvent(new CustomEvent("ft:langchange", { detail: { lang } }));
    };
    if (window.FT_KO_EN) runDeep();
    else ensureDict(runDeep);
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
    link.href = "/css/site-chrome.css?v=20260902a";
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

  window.ftT = t;
  window.ftGetLang = getLang;
  window.ftTranslatePhrase = translatePhrase;

  function boot() {
    ensureCss();
    applyTheme(getTheme());
    injectBar();
    ensureDict(() => applyLang(getLang()));
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
    ensureDict(() => applyLang(getLang()));
  });

  if (typeof MutationObserver !== "undefined") {
    let moPending = false;
    const mo = new MutationObserver(() => {
      if (getLang() !== "en" || moPending) return;
      moPending = true;
      requestAnimationFrame(() => {
        moPending = false;
        scheduleDeepTranslate("en");
      });
    });
    const startMo = () => {
      if (!document.body) return;
      mo.observe(document.body, { childList: true, subtree: true });
    };
    if (document.body) startMo();
    else document.addEventListener("DOMContentLoaded", startMo, { once: true });
  }
})();
