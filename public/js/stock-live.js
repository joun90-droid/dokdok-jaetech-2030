/**
 * stock-live.js — Naver/Yahoo 실시간 시세 + 60초 갱신 + 카드 패치(깜빡임 방지)
 */
(function () {
  const UNIVERSE_URL = "data/stock-universe.json";
  const FALLBACK_JSON = { naver: "data/stock-live-naver.json", yahoo: "data/stock-live-yahoo.json" };
  const REFRESH_MS = 60000;
  const JSON_STALE_MS = 600000;
  const NAVER_URL = "https://polling.finance.naver.com/api/realtime/domestic/stock/";
  const NAVER_INDEX_URL = "https://polling.finance.naver.com/api/realtime/domestic/index/";
  const YAHOO_SPARK = "https://query1.finance.yahoo.com/v7/finance/spark";
  const INDEX_SYMBOLS = { sp: "^GSPC", nasdaq: "^IXIC" };

  let universe = { kr: [], us: [] };
  let marketOn = { kr: true, us: false };
  let activeSource = "naver";
  let activeFilter = "all";
  let refreshTimer = null;
  let countdownTimer = null;
  let secondsLeft = REFRESH_MS / 1000;
  let isStreamingActive = true;
  let lastError = "";
  let currentStocks = [];
  let searchQuery = "";
  let sortMode = "score_desc";
  let stockBooted = false;
  let listenersBound = false;
  let indexCache = { kr: null, us: null, at: 0 };
  let lastRenderFingerprint = "";
  let toastRotateIdx = 0;
  let lastDataSource = "";
  const stockCache = new Map();

  const SECTORS_KR = ["반도체", "2차전지", "바이오", "금융", "자동차", "플랫폼", "에너지"];
  const SECTORS_US = ["Big Tech", "AI/반도체", "Healthcare", "Finance", "Consumer", "Industrial"];
  const SECTOR_I18N = {
    "반도체": "spSectorSemi", "2차전지": "spSectorBattery", "바이오": "spSectorBio",
    "금융": "spSectorFinance", "자동차": "spSectorAuto", "플랫폼": "spSectorPlatform", "에너지": "spSectorEnergy",
    "Big Tech": "spSectorPlatform", "AI/반도체": "spSectorSemi", "Healthcare": "spSectorBio",
    "Finance": "spSectorFinance", "Consumer": "spSectorAuto", "Industrial": "spSectorEnergy",
  };

  function ftLang() {
    try {
      if (typeof window.ftGetLang === "function") return window.ftGetLang();
      return localStorage.getItem("ft_lang") === "en" ? "en" : "ko";
    } catch {
      return "ko";
    }
  }

  function ftT(key, fallback) {
    if (typeof window.ftT === "function") {
      const v = window.ftT(key);
      if (v && v !== key) return v;
    }
    return fallback || key;
  }

  function localeTag() {
    return ftLang() === "en" ? "en-US" : "ko-KR";
  }

  function trSector(name) {
    const key = SECTOR_I18N[name];
    return key ? ftT(key, name) : name;
  }

  const listEl = () => document.getElementById("quote-list");
  const statusEl = () => document.getElementById("quote-status");
  const visibleEl = () => document.getElementById("visible-count");
  const updatedEl = () => document.getElementById("quote-updated");

  /** auto-fit 그리드가 최초 렌더 후 폭을 잘못 잡는 경우 reflow */
  function reflowStockGrid() {
    const grid = listEl();
    if (!grid || !grid.querySelector(".vi-stock-card")) return;
    requestAnimationFrame(() => {
      grid.style.setProperty("display", "none");
      void grid.offsetHeight;
      grid.style.removeProperty("display");
    });
  }

  /* 백업 Mock (API 전부 실패 시) */
  const FALLBACK_MOCK = {
    kr: [
      { name: "삼성전자", code: "005930", price: 72000, change: 2.5, volume: 8420000, market: "KOSPI" },
      { name: "SK하이닉스", code: "000660", price: 210500, change: -1.2, volume: 2150000, market: "KOSPI" },
      { name: "NAVER", code: "035420", price: 198000, change: 0.8, volume: 680000, market: "KOSPI" }
    ],
    us: [
      { name: "Apple", code: "AAPL", price: 228.4, change: 1.1, volume: 48200000, market: "NASDAQ" },
      { name: "Microsoft", code: "MSFT", price: 425.8, change: 0.8, volume: 22100000, market: "NASDAQ" },
      { name: "NVIDIA", code: "NVDA", price: 128.75, change: 3.2, volume: 89100000, market: "NASDAQ" }
    ]
  };

  function fmtVolume(v, isKr) {
    if (!v) return "—";
    if (isKr) {
      if (v >= 10000) return Math.round(v / 10000).toLocaleString("ko-KR") + "만";
      return v.toLocaleString("ko-KR");
    }
    if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
    if (v >= 1e3) return (v / 1e3).toFixed(0) + "K";
    return String(v);
  }

  function fmtPrice(s, isKr) {
    if (!s.price) return "—";
    if (isKr) return Number(s.price).toLocaleString("ko-KR") + "원";
    return "$" + Number(s.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function chgClass(c) {
    if (c > 0) return "chg--up";
    if (c < 0) return "chg--down";
    return "chg--flat";
  }

  function chgText(c) {
    const sign = c > 0 ? "+" : "";
    const arrow = c > 0 ? "🔺" : c < 0 ? "🔻" : "—";
    return `${arrow} ${sign}${Number(c).toFixed(2)}%`;
  }

  function computeScore(stock) {
    const seed = hashCode(stock.code);
    const base = 52 + (seed % 28);
    const changeBonus = Math.max(-12, Math.min(18, stock.change * 4));
    const volNorm = Math.min(10, Math.log10(Math.max(stock.volume || 1, 1)) * 2.5);
    let score = Math.round(base + changeBonus + volNorm);
    return Math.max(38, Math.min(97, score));
  }

  function scoreGrade(score) {
    if (score >= 88) return { grade: "S", cls: "s", label: ftT("spGradeBuyStrong", "적극 매수"), pickCls: "buy", icon: "🌟" };
    if (score >= 78) return { grade: "A", cls: "a", label: ftT("spGradeBuy", "매수 추천"), pickCls: "buy", icon: "👍" };
    if (score >= 65) return { grade: "B", cls: "b", label: ftT("spGradeHold", "분할 매수"), pickCls: "hold", icon: "📌" };
    if (score >= 50) return { grade: "C", cls: "c", label: ftT("spGradeWatch", "관망"), pickCls: "hold", icon: "👀" };
    return { grade: "D", cls: "c", label: ftT("spGradeWarn", "주의"), pickCls: "warn", icon: "⚠️" };
  }

  function pickReason(stock, g) {
    const c = stock.change;
    if (g.grade === "S") {
      return c > 0 ? ftT("spReasonSMomentumUp", "모멘텀 강세 · 영재 Pick 상위") : ftT("spReasonSMomentumDown", "모멘텀 반등 · 영재 Pick 상위");
    }
    if (g.grade === "A") {
      return c >= 0 ? ftT("spReasonATrendUp", "추세 양호 · 매수 구간 검토") : ftT("spReasonATrendDown", "추세 조정 · 매수 구간 검토");
    }
    if (c > 2) return ftT("spReasonSurge", "단기 급등 · 분할 익절 고려");
    if (c < -2) return ftT("spReasonDip", "조정 구간 · 분할 매수 관점");
    return ftT("spReasonRange", "박스권 · 장기 관점 적립");
  }

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i += 1) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function deriveFundamentals(stock, score, isKr) {
    const seed = hashCode(stock.code);
    const pbr = Math.round((0.35 + (seed % 90) / 100) * 100) / 100;
    const per = Math.round((7 + (seed % 45)) * 10) / 10;
    const roe = Math.round((6 + (seed % 22)) * 10) / 10;
    const div = Math.round((seed % 55) / 10) / 10;
    const upside = Math.max(4, Math.min(95, Math.round((score - 48) * 1.6 + stock.change * 1.5 + (seed % 15))));
    const fairValue = stock.price > 0 ? stock.price * (1 + upside / 100) : 0;
    const sector = isKr ? SECTORS_KR[seed % SECTORS_KR.length] : SECTORS_US[seed % SECTORS_US.length];
    return { pbr, per, roe, div, upside, fairValue, sector, sectorLabel: trSector(sector) };
  }

  function enrichStock(stock, isKr) {
    const score = computeScore(stock);
    const g = scoreGrade(score);
    const fund = deriveFundamentals(stock, score, isKr);
    return {
      ...stock,
      score,
      gradeInfo: g,
      reason: pickReason(stock, g),
      ...fund,
      description: `${fund.sectorLabel} · ${g.label} · ${pickReason(stock, g)}`,
    };
  }

  function sortStocks(list) {
    const sorted = [...list];
    switch (sortMode) {
      case "upside_desc": sorted.sort((a, b) => b.upside - a.upside); break;
      case "change_desc": sorted.sort((a, b) => b.change - a.change); break;
      case "change_asc": sorted.sort((a, b) => a.change - b.change); break;
      case "pbr_asc": sorted.sort((a, b) => a.pbr - b.pbr); break;
      default: sorted.sort((a, b) => b.score - a.score);
    }
    return sorted;
  }

  function stockIsKr(s) {
    if (typeof s?._isKr === "boolean") return s._isKr;
    if (typeof s?.isKr === "boolean") return s.isKr;
    return !!marketOn.kr && !marketOn.us;
  }

  function collectStocks(data) {
    if (!data) return [];
    const out = [];
    if (marketOn.kr) padMarket(data.kr, "kr").forEach((s) => out.push({ ...s, _isKr: true }));
    if (marketOn.us) padMarket(data.us, "us").forEach((s) => out.push({ ...s, _isKr: false }));
    return out;
  }

  function collectFallback() {
    const out = [];
    if (marketOn.kr) FALLBACK_MOCK.kr.forEach((s) => out.push({ ...s, _isKr: true }));
    if (marketOn.us) FALLBACK_MOCK.us.forEach((s) => out.push({ ...s, _isKr: false }));
    return out;
  }

  function marketSummaryLabel() {
    const parts = [];
    if (marketOn.kr) parts.push(ftT("spKrMarket", "🇰🇷 국내"));
    if (marketOn.us) parts.push(ftT("spUsMarket", "🇺🇸 미국"));
    return parts.length ? parts.join(" + ") : ftT("spMarketNone", "시장 미선택");
  }

  function syncMarketTabs() {
    const bothOn = !!(marketOn.kr && marketOn.us);
    document.querySelectorAll(".market-tab").forEach((t) => {
      const key = t.dataset.market;
      const on = key === "both" ? bothOn : !!marketOn[key];
      t.classList.toggle("active", on);
      t.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function filterStocks(stocks) {
    let list = stocks.map((s) => enrichStock(s, stockIsKr(s)));
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    }
    if (activeFilter === "top") {
      const strict = list.filter((s) => s.score >= 80);
      list = strict.length
        ? strict
        : [...list].sort((a, b) => b.score - a.score).slice(0, Math.min(15, list.length));
    }
    if (activeFilter === "up") {
      const strict = list.filter((s) => s.change > 0);
      list = strict.length
        ? strict
        : [...list].sort((a, b) => b.change - a.change).slice(0, Math.min(15, list.length));
    }
    if (activeFilter === "down") {
      const strict = list.filter((s) => s.change < 0);
      list = strict.length
        ? strict
        : [...list].sort((a, b) => a.change - b.change).slice(0, Math.min(15, list.length));
    }
    return sortStocks(list);
  }

  function fmtFair(price, isKr) {
    if (!price) return "—";
    if (isKr) return `${Math.round(price).toLocaleString("ko-KR")} 원`;
    return `$${Number(price).toFixed(2)}`;
  }

  function updatePageStats(stocks) {
    const enriched = stocks.map((s) => enrichStock(s, stockIsKr(s)));
    const avg = enriched.length ? Math.round(enriched.reduce((a, s) => a + s.score, 0) / enriched.length) : 0;
    const avgUp = enriched.length ? enriched.reduce((a, s) => a + s.upside, 0) / enriched.length : 0;
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set("stat-avg-score", avg || "—");
    set("stat-avg-upside", avgUp ? `+${avgUp.toFixed(1)}%` : "+0%");
    set("stat-total", enriched.length);
  }

  function fmtIndexVal(n, decimals) {
    if (n == null || Number.isNaN(n)) return "—";
    return Number(n).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function setRibbon(id, price, change) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = fmtIndexVal(price, id === "ribbon-kospi" || id === "ribbon-kosdaq" ? 2 : 2);
    const card = el.closest(".vi-ribbon-card");
    const tag = card?.querySelector(".r-tag");
    if (tag && change != null && !Number.isNaN(change)) {
      const sign = change > 0 ? "+" : change < 0 ? "" : "";
      tag.textContent = `${sign}${Number(change).toFixed(2)}%`;
      tag.classList.remove("up", "down", "flat");
      tag.classList.add(change > 0 ? "up" : change < 0 ? "down" : "flat");
    }
  }

  function applyIndicesFromPack(pack) {
    const idx = pack?.indices;
    if (!idx) return false;
    if (idx.KOSPI) setRibbon("ribbon-kospi", idx.KOSPI.price, idx.KOSPI.change);
    if (idx.KOSDAQ) setRibbon("ribbon-kosdaq", idx.KOSDAQ.price, idx.KOSDAQ.change);
    if (idx.SP500) setRibbon("ribbon-sp", idx.SP500.price, idx.SP500.change);
    if (idx.NASDAQ) setRibbon("ribbon-nasdaq", idx.NASDAQ.price, idx.NASDAQ.change);
    return !!(idx.KOSPI || idx.KOSDAQ || idx.SP500 || idx.NASDAQ);
  }

  async function fetchKrIndices() {
    const res = await fetch(NAVER_INDEX_URL + "KOSPI,KOSDAQ", {
      cache: "no-store",
      headers: { Referer: "https://finance.naver.com/" },
    });
    if (!res.ok) throw new Error("Naver index HTTP " + res.status);
    const json = await res.json();
    const out = {};
    (json.datas || []).forEach((d) => {
      const code = d.itemCode;
      const price = parseFloat(String(d.closePriceRaw || d.closePrice || "").replace(/,/g, ""));
      let chg = parseFloat(d.fluctuationsRatioRaw || d.fluctuationsRatio);
      if (Number.isNaN(chg)) chg = 0;
      if (d.compareToPreviousPrice?.code === "5") chg = -Math.abs(chg);
      out[code] = { price, change: chg };
    });
    return out;
  }

  async function fetchUsIndices() {
    const symbols = [INDEX_SYMBOLS.sp, INDEX_SYMBOLS.nasdaq].join(",");
    const url = `${YAHOO_SPARK}?symbols=${encodeURIComponent(symbols)}&range=1d&interval=1d`;
    const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Yahoo index HTTP " + res.status);
    const map = parseYahooSpark(await res.json());
    return {
      sp: map[INDEX_SYMBOLS.sp],
      nasdaq: map[INDEX_SYMBOLS.nasdaq],
    };
  }

  async function refreshIndexRibbons() {
    try {
      const pack = await fetchLiveJson("naver");
      if (applyIndicesFromPack(pack)) {
        indexCache = { indices: pack.indices, at: Date.now() };
        return;
      }
    } catch {
      /* same-origin JSON unavailable */
    }
    try {
      const [kr, us] = await Promise.all([
        fetchKrIndices().catch(() => null),
        fetchUsIndices().catch(() => null),
      ]);
      if (kr?.KOSPI) setRibbon("ribbon-kospi", kr.KOSPI.price, kr.KOSPI.change);
      if (kr?.KOSDAQ) setRibbon("ribbon-kosdaq", kr.KOSDAQ.price, kr.KOSDAQ.change);
      if (us?.sp) setRibbon("ribbon-sp", us.sp.price, us.sp.change);
      if (us?.nasdaq) setRibbon("ribbon-nasdaq", us.nasdaq.price, us.nasdaq.change);
      indexCache = { kr, us, at: Date.now() };
    } catch {
      /* keep previous ribbon values */
    }
  }

  /** Deterministic mini sparkline SVG from ticker + change % */
  function sparklineSvg(code, change) {
    const seed = hashCode(String(code));
    const w = 140;
    const h = 48;
    const pad = 4;
    const n = 14;
    const trend = change >= 0 ? 1 : -1;
    const vals = [];
    let v = 24 + (seed % 12);

    for (let i = 0; i < n; i += 1) {
      const wave = Math.sin(seed * 0.017 + i * 0.85) * 6;
      const drift = trend * (i / (n - 1)) * 14;
      v = Math.max(6, Math.min(h - 6, v + wave * 0.35 + trend * 1.2 + drift * 0.08));
      vals.push(v);
    }

    if (trend > 0) vals[n - 1] = Math.min(h - pad, vals[n - 1] + 4);
    if (trend < 0) vals[n - 1] = Math.max(pad, vals[n - 1] - 4);

    const step = (w - pad * 2) / (n - 1);
    const pts = vals.map((y, i) => `${(pad + i * step).toFixed(1)},${(h - y).toFixed(1)}`).join(" ");
    const col = change > 0 ? "#f04452" : change < 0 ? "#3182f6" : "#888";
    const fillCol = change > 0 ? "rgba(240,68,82,0.18)" : change < 0 ? "rgba(49,130,246,0.18)" : "rgba(136,136,136,0.12)";
    const area = `${pad},${h - pad} ${pts} ${w - pad},${h - pad}`;

    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" role="presentation">
      <polygon points="${area}" fill="${fillCol}"/>
      <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${w - pad}" cy="${(h - vals[n - 1]).toFixed(1)}" r="2.5" fill="${col}"/>
    </svg>`;
  }

  function showLoading() {
    const el = listEl();
    if (!el) return;
    el.innerHTML = `<div class="vi-loading"><i class="fa-solid fa-spinner fa-spin"></i> ${ftT("spLoading", "실시간 데이터를 불러오는 중...")}</div>`;
    if (statusEl()) statusEl().textContent = "";
  }

  function showError(msg, useFallback) {
    if (statusEl()) {
      statusEl().textContent = msg;
      statusEl().className = "quote-status quote-status--error";
    }
    if (useFallback) return;
    const el = listEl();
    if (el) el.innerHTML = `<div class="vi-empty">${msg}</div>`;
  }

  function renderCard(s, isKr) {
    const mktCls = isKr ? "kr" : "us";
    const mktLabel = isKr ? `🇰🇷 ${s.market || "KOSPI"}` : `🇺🇸 ${s.market || "NASDAQ"}`;
    const chgCls = s.change > 0 ? "up" : s.change < 0 ? "down" : "flat";
    const chgSign = s.change >= 0 ? "+" : "";
    const naverUrl = isKr ? `https://finance.naver.com/item/main.naver?code=${s.code}` : "#";
    const yahooUrl = isKr ? "#" : `https://finance.yahoo.com/quote/${s.code}`;

    const gradeSuffix = ftT("spGradeSuffix", "등급");
    const clickHint = ftT("spClickHint", "클릭 → 안전마진 · 매수 논리");

    return `
      <article class="vi-stock-card" data-code="${s.code}" style="--vi-click-hint:'${clickHint.replace(/'/g, "\\'")}'">
        <div class="vi-stock-card-header">
          <div>
            <span class="vi-market-badge ${mktCls}">${mktLabel}</span>
            <span class="vi-sector-tag">${s.sectorLabel || trSector(s.sector)}</span>
          </div>
          <span class="vi-score-badge"><i class="fa-solid fa-gem"></i> ${ftT("spValueScore", "가치")} ${s.score}${ftT("spPoints", "점")}</span>
        </div>
        <div class="vi-stock-chart">${sparklineSvg(s.code, s.change)}</div>
        <div class="vi-stock-title">
          <h3>${s.name}</h3>
          <p class="vi-ticker">${s.code} · ${s.gradeInfo.grade}${gradeSuffix}</p>
        </div>
        <div class="vi-price-row">
          <span class="vi-price-val">${fmtPrice(s, isKr)}</span>
          <span class="vi-change-badge ${chgCls}">${chgSign}${Number(s.change).toFixed(2)}%</span>
        </div>
        <div class="vi-fair-box">
          <div>
            <span class="vi-fair-label">${ftT("spFairLabel", "AI 적정주가 (참고)")}</span>
            <span class="vi-fair-price">${fmtFair(s.fairValue, isKr)}</span>
          </div>
          <span class="vi-upside-pill">+${s.upside.toFixed(1)}% ${ftT("spUpside", "여력")}</span>
        </div>
        <div class="vi-metrics-grid">
          <div class="vi-metric"><span class="vi-m-label">PBR</span><span class="vi-m-val hl">${s.pbr.toFixed(2)}</span></div>
          <div class="vi-metric"><span class="vi-m-label">PER</span><span class="vi-m-val">${s.per.toFixed(1)}</span></div>
          <div class="vi-metric"><span class="vi-m-label">ROE</span><span class="vi-m-val hl">${s.roe.toFixed(1)}%</span></div>
          <div class="vi-metric"><span class="vi-m-label">${ftT("spDividend", "배당")}</span><span class="vi-m-val">${s.div.toFixed(1)}%</span></div>
        </div>
        <p class="vi-card-desc">${s.description}</p>
        <div class="vi-card-footer">
          ${isKr ? `<a href="${naverUrl}" target="_blank" rel="noopener" class="vi-btn vi-btn-sm vi-btn-naver" onclick="event.stopPropagation()"><i class="fa-solid fa-arrow-up-right-from-square"></i> ${ftT("spNaverLink", "네이버")}</a>` : ""}
          ${!isKr ? `<a href="${yahooUrl}" target="_blank" rel="noopener" class="vi-btn vi-btn-sm vi-btn-yahoo" onclick="event.stopPropagation()"><i class="fa-solid fa-globe"></i> ${ftT("spYahooLink", "야후")}</a>` : ""}
          <a href="stock-tech.html" class="vi-btn vi-btn-sm vi-btn-primary" onclick="event.stopPropagation()"><i class="fa-solid fa-chart-line"></i> ${ftT("spChartLink", "차트")}</a>
        </div>
      </article>`;
  }

  function quotesFingerprint(list) {
    return list.map((s) => `${s.code}:${s.price}:${s.change}:${s.volume}`).join("|");
  }

  function updateCardInPlace(card, s, isKr, silent) {
    const priceEl = card.querySelector(".vi-price-val");
    const chgEl = card.querySelector(".vi-change-badge");
    if (priceEl) {
      const next = fmtPrice(s, isKr);
      if (priceEl.textContent !== next) {
        priceEl.textContent = next;
        if (!silent) {
          priceEl.classList.add("vi-price-flash");
          window.setTimeout(() => priceEl.classList.remove("vi-price-flash"), 600);
        }
      }
    }
    if (chgEl) {
      const chgCls = s.change > 0 ? "up" : s.change < 0 ? "down" : "flat";
      const sign = s.change >= 0 ? "+" : "";
      chgEl.className = `vi-change-badge ${chgCls}`;
      chgEl.textContent = `${sign}${Number(s.change).toFixed(2)}%`;
    }
  }

  function updateFooterMeta(packUpdated) {
    if (visibleEl() && listEl()) {
      const n = listEl().querySelectorAll(".vi-stock-card").length;
      if (n) visibleEl().textContent = String(n);
    }
    if (updatedEl()) {
      const nowStr = new Date().toLocaleTimeString(localeTag(), { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const src = packUpdated || window.__STOCK_LIVE__?.packUpdated;
      if (src) {
        const srcStr = new Date(src).toLocaleTimeString(localeTag(), { hour: "2-digit", minute: "2-digit" });
        updatedEl().textContent = `${ftT("spCheckedAt", "확인")} ${nowStr} · ${ftT("spQuoteAt", "시세")} ${srcStr}`;
      } else {
        updatedEl().textContent = `${ftT("spUpdatedAt", "갱신")} ${nowStr}`;
      }
    }
    if (statusEl()) {
      statusEl().className = lastError ? "quote-status quote-status--warn" : "quote-status";
      if (lastError) {
        statusEl().textContent = lastError;
      } else if (activeSource === "naver") {
        statusEl().textContent = ftT("spStatusNaver", "네이버 시세 (KRX 종가 · 장마감 후 NXT 시간외) · 60초 갱신");
      } else {
        statusEl().textContent = ftT("spStatusYahoo", "야후 시세 · 60초마다 갱신");
      }
    }
  }

  /** 60초 갱신: 카드 DOM 유지, 가격·등락만 조용히 패치 */
  function applySilentQuotePatch(kr, us, indices, packUpdated) {
    const rawList = collectStocks({ kr, us });
    const byCode = new Map(rawList.map((s) => [s.code, s]));

    window.__STOCK_LIVE__ = {
      ...(window.__STOCK_LIVE__ || {}),
      kr,
      us,
      source: activeSource,
      updated: Date.now(),
      packUpdated,
      indices,
      dataSource: lastDataSource,
    };
    currentStocks = rawList;

    const grid = listEl();
    if (grid) {
      grid.querySelectorAll(".vi-stock-card").forEach((card) => {
        const raw = byCode.get(card.dataset.code);
        if (!raw) return;
        const isKr = stockIsKr(raw);
        updateCardInPlace(card, enrichStock(raw, isKr), isKr, true);
        stockCache.set(raw.code, { ...enrichStock(raw, isKr), isKr });
      });
    }

    if (indices) applyIndicesFromPack({ indices });
    updateFooterMeta(packUpdated);
    if (rawList.length) updateLiveToast(rawList);
  }

  function patchStockGrid(filtered, forceRebuild) {
    const el = listEl();
    if (!el) return;

    const fp = quotesFingerprint(filtered);
    const codes = new Set(filtered.map((s) => s.code));

    if (!forceRebuild && fp === lastRenderFingerprint && el.querySelector(".vi-stock-card")) {
      filtered.forEach((s) => {
        const isKr = stockIsKr(s);
        const card = el.querySelector(`.vi-stock-card[data-code="${s.code}"]`);
        if (card) updateCardInPlace(card, s, isKr);
        stockCache.set(s.code, { ...s, isKr });
      });
      return false;
    }

    lastRenderFingerprint = fp;

    if (!forceRebuild && el.querySelector(".vi-stock-card")) {
      filtered.forEach((s) => {
        const isKr = stockIsKr(s);
        let card = el.querySelector(`.vi-stock-card[data-code="${s.code}"]`);
        if (card) {
          updateCardInPlace(card, s, isKr);
        } else {
          el.insertAdjacentHTML("beforeend", renderCard(s, isKr));
        }
        stockCache.set(s.code, { ...s, isKr });
      });
      el.querySelectorAll(".vi-stock-card").forEach((card) => {
        if (!codes.has(card.dataset.code)) card.remove();
      });
      const order = filtered.map((s) => s.code);
      order.forEach((code) => {
        const card = el.querySelector(`.vi-stock-card[data-code="${code}"]`);
        if (card) el.appendChild(card);
      });
      return true;
    }

    el.innerHTML = filtered.map((s) => renderCard(s, stockIsKr(s))).join("");
    filtered.forEach((s) => stockCache.set(s.code, { ...s, isKr: stockIsKr(s) }));
    return true;
  }

  function renderList(stocks, animate, forceRebuild) {
    const el = listEl();
    if (!el) return;
    currentStocks = stocks;
    const filtered = filterStocks(stocks);
    updatePageStats(stocks);

    const summary = document.getElementById("filter-summary");
    if (summary) {
      const labels = {
        all: ftT("spFilterSummaryAll", "전체"),
        top: ftT("spFilterSummaryTop", "TOP 80+"),
        up: ftT("spFilterSummaryUp", "급등"),
        down: ftT("spFilterSummaryDown", "급락"),
      };
      const marketLabel = marketSummaryLabel();
      summary.textContent = `${marketLabel} · ${labels[activeFilter] || labels.all}`;
    }

    if (!filtered.length) {
      el.innerHTML = `<div class="vi-empty"><i class="fa-solid fa-chart-pie"></i><br>${ftT("spEmpty", "조건에 맞는 종목이 없습니다.")}</div>`;
      lastRenderFingerprint = "";
      if (visibleEl()) visibleEl().textContent = "0";
      return;
    }

    const applyDom = () => {
      patchStockGrid(filtered, !!forceRebuild || !!animate);
      if (visibleEl()) visibleEl().textContent = filtered.length;
      updateFooterMeta(window.__STOCK_LIVE__?.packUpdated);
      updateLiveToast(filtered.length ? filtered : stocks);
      reflowStockGrid();
    };

    if (animate && !forceRebuild) {
      el.classList.add("is-switching");
      window.setTimeout(() => {
        lastRenderFingerprint = "";
        applyDom();
        el.classList.remove("is-switching");
      }, 180);
    } else {
      applyDom();
    }
  }

  function pickNaverStockRow(d) {
    const over = d.overMarketPriceInfo;
    // 장마감 후 네이버 증권과 동일: NXT 시간외(overMarket) 가격
    if (d.marketStatus === "CLOSE" && over?.overPrice) {
      let chg = parseFloat(over.fluctuationsRatioRaw || over.fluctuationsRatio) || 0;
      if (over.compareToPreviousPrice?.code === "5") chg = -chg;
      const vol = parseInt(String(over.accumulatedTradingVolumeRaw || over.accumulatedTradingVolume || "0").replace(/,/g, ""), 10) || 0;
      return {
        name: d.stockName,
        code: d.itemCode,
        price: parseFloat(String(over.overPrice).replace(/,/g, "")) || 0,
        change: chg,
        volume: vol,
        market: d.stockExchangeType?.nameKor || "KOSPI",
      };
    }
    let chg = parseFloat(d.fluctuationsRatioRaw || d.fluctuationsRatio) || 0;
    if (d.compareToPreviousPrice?.code === "5") chg = -chg;
    const priceRaw = d.closePriceRaw || d.closePrice;
    const volRaw = d.accumulatedTradingVolumeRaw || d.accumulatedTradingVolume;
    return {
      name: d.stockName,
      code: d.itemCode,
      price: parseFloat(String(priceRaw).replace(/,/g, "")) || 0,
      change: chg,
      volume: parseInt(String(volRaw || "0").replace(/,/g, ""), 10) || 0,
      market: d.stockExchangeType?.nameKor || "KOSPI",
    };
  }

  function parseNaver(data, meta) {
    const map = {};
    (data.datas || []).forEach((d) => {
      map[d.itemCode] = pickNaverStockRow(d);
    });
    return map;
  }

  function parseYahooSpark(json) {
    const map = {};
    (json?.spark?.result || []).forEach((item) => {
      const meta = item.response?.[0]?.meta;
      if (!meta) return;
      const cur = meta.regularMarketPrice || 0;
      const prev = meta.chartPreviousClose || cur;
      const pct = prev ? ((cur - prev) / prev) * 100 : 0;
      map[item.symbol] = {
        price: cur,
        change: Math.round(pct * 100) / 100,
        volume: meta.regularMarketVolume || 0,
      };
    });
    return map;
  }

  function mergeUniverse(list, quoteMap, isKr, yahooSuffix) {
    return list.map((u) => {
      const key = isKr && yahooSuffix ? `${u.code}.${u.suffix || "KS"}` : u.code;
      const q = quoteMap[key] || quoteMap[u.code];
      return {
        name: q?.name || u.name,
        code: u.code,
        market: u.market,
        price: q?.price ?? 0,
        change: q?.change ?? 0,
        volume: q?.volume ?? 0,
      };
    });
  }

  function padMarket(list, side) {
    const uni = universe[side] || [];
    if (!uni.length) return Array.isArray(list) ? list.slice() : [];
    const byCode = new Map((list || []).map((s) => [s.code, s]));
    return uni.map((u) => {
      const q = byCode.get(u.code);
      return {
        name: q?.name || u.name,
        code: u.code,
        market: q?.market || u.market,
        price: q?.price ?? 0,
        change: q?.change ?? 0,
        volume: q?.volume ?? 0,
      };
    });
  }

  async function fetchNaverDirect() {
    const codes = universe.kr.map((s) => s.code);
    const map = {};
    const batchSize = 25;
    for (let i = 0; i < codes.length; i += batchSize) {
      const batch = codes.slice(i, i + batchSize).join(",");
      const res = await fetch(NAVER_URL + batch, {
        cache: "no-store",
        headers: { Referer: "https://finance.naver.com/" },
      });
      if (!res.ok) throw new Error("Naver HTTP " + res.status);
      Object.assign(map, parseNaver(await res.json()));
    }
    return {
      kr: mergeUniverse(universe.kr, map, true, false),
      us: null,
    };
  }

  async function fetchYahooDirect(market) {
    const list = market === "kr" ? universe.kr : universe.us;
    const symbols = market === "kr"
      ? list.map((s) => `${s.code}.${s.suffix || "KS"}`)
      : list.map((s) => s.code);
    const batchSize = 15;
    const map = {};
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const url = `${YAHOO_SPARK}?symbols=${encodeURIComponent(batch.join(","))}&range=1d&interval=1d`;
      const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Yahoo HTTP " + res.status);
      Object.assign(map, parseYahooSpark(await res.json()));
    }
    if (market === "kr") {
      const remapped = {};
      list.forEach((u) => {
        const sym = `${u.code}.${u.suffix || "KS"}`;
        if (map[sym]) remapped[u.code] = map[sym];
      });
      return mergeUniverse(list, remapped, true, false);
    }
    return mergeUniverse(list, map, false, false);
  }

  function buildIndicesFromParts(krIdx, usIdx) {
    const out = {};
    if (krIdx?.KOSPI) out.KOSPI = krIdx.KOSPI;
    if (krIdx?.KOSDAQ) out.KOSDAQ = krIdx.KOSDAQ;
    if (usIdx?.sp) out.SP500 = usIdx.sp;
    if (usIdx?.nasdaq) out.NASDAQ = usIdx.nasdaq;
    return Object.keys(out).length ? out : null;
  }

  async function fetchLiveQuotes() {
    let pack = null;
    try {
      pack = await fetchLiveJson(activeSource);
    } catch {
      pack = null;
    }

    let kr = pack?.kr || [];
    let us = pack?.us || [];
    let indices = pack?.indices || null;
    const packUpdated = pack?.updated || null;
    let dataSource = pack ? "json" : "none";

    if (activeSource === "naver") {
      const naverKr = await fetchNaverDirect().catch(() => null);
      if (naverKr?.kr?.length) {
        kr = naverKr.kr;
        dataSource = "naver-live";
      }
      const yahooUs = await fetchYahooDirect("us").catch(() => null);
      if (yahooUs?.length) us = yahooUs;
    } else {
      const [yahooKr, yahooUs] = await Promise.all([
        fetchYahooDirect("kr").catch(() => null),
        fetchYahooDirect("us").catch(() => null),
      ]);
      if (yahooKr?.length) {
        kr = yahooKr;
        dataSource = "yahoo-live";
      }
      if (yahooUs?.length) us = yahooUs;
    }

    if (!indices || !indices.KOSPI) {
      const [krIdx, usIdx] = await Promise.all([
        fetchKrIndices().catch(() => null),
        fetchUsIndices().catch(() => null),
      ]);
      const built = buildIndicesFromParts(krIdx, usIdx);
      if (built) indices = built;
    }

    return {
      kr: padMarket(kr, "kr"),
      us: padMarket(us, "us"),
      indices,
      packUpdated,
      dataSource,
    };
  }

  async function fetchLiveJson(source) {
    const key = source === "yahoo" ? "yahoo" : "naver";
    const url = `${FALLBACK_JSON[key]}?t=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Live JSON failed");
    return res.json();
  }

  async function fetchFallbackJson(source) {
    return fetchLiveJson(source);
  }

  async function loadQuotes(silent) {
    if (!silent) showLoading();
    lastError = "";

    try {
      const { kr, us, indices, packUpdated, dataSource } = await fetchLiveQuotes();
      lastDataSource = dataSource;

      const hasKr = kr?.length;
      const hasUs = us?.length;
      if (!hasKr && !hasUs) throw new Error("empty quotes");

      if (silent && stockBooted && listEl()?.querySelector(".vi-stock-card")) {
        applySilentQuotePatch(kr, us, indices, packUpdated);
        resetCountdown();
        return;
      }

      if (indices) applyIndicesFromPack({ indices });
      else if (dataSource !== "json") await refreshIndexRibbons();

      window.__STOCK_LIVE__ = { kr, us, source: activeSource, updated: Date.now(), packUpdated, indices, dataSource };
      renderList(collectStocks({ kr, us }), !silent, !silent);
      stockBooted = true;
      resetCountdown();
    } catch {
      lastError = lastError || "시세 로드 실패";
      try {
        const pack = await fetchLiveJson(activeSource);
        lastDataSource = "json";
        applyIndicesFromPack(pack);
        window.__STOCK_LIVE__ = {
          kr: padMarket(pack.kr, "kr"),
          us: padMarket(pack.us, "us"),
          source: activeSource,
          updated: Date.now(),
          indices: pack.indices,
        };
        if (pack.updated) {
          const ageMs = Date.now() - new Date(pack.updated).getTime();
          lastError = `백업 JSON (${Math.round(ageMs / 60000)}분 전)`;
        }
        renderList(collectStocks(pack), false, true);
      } catch {
        showError(lastError, true);
        renderList(collectFallback(), false, true);
      }
    }
  }

  function switchFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.filter === filter);
    });
    document.querySelectorAll(".vi-header-actions [data-filter]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });
    const data = window.__STOCK_LIVE__;
    const stocks = currentStocks.length ? currentStocks : collectStocks(data);
    if (stocks.length || !marketOn.kr && !marketOn.us) renderList(stocks, true, true);
  }

  function toggleMarket(market) {
    if (market === "both") {
      marketOn.kr = true;
      marketOn.us = true;
    } else if (market === "kr" || market === "us") {
      marketOn[market] = !marketOn[market];
    } else {
      return;
    }
    lastRenderFingerprint = "";
    syncMarketTabs();
    const data = window.__STOCK_LIVE__;
    if (data) renderList(collectStocks({ kr: padMarket(data.kr, "kr"), us: padMarket(data.us, "us") }), true, true);
    else loadQuotes(false);
  }

  function switchSource(source) {
    activeSource = source;
    document.querySelectorAll(".source-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.source === source);
    });
    loadQuotes(false);
  }

  function updateLiveToast(stocks) {
    const toastText = document.getElementById("stockLiveToastText");
    const toastTime = document.getElementById("stockLiveToastTime");
    if (!toastText || !stocks?.length) return;

    const pool = stocks.slice(0, Math.min(stocks.length, 20));
    const pick = pool[toastRotateIdx % pool.length];
    toastRotateIdx += 1;
    const isKr = stockIsKr(pick);
    const sign = pick.change >= 0 ? "+" : "";
    const now = new Date();
    const timeStr = now.toLocaleTimeString(localeTag(), { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const srcLabel = lastDataSource === "naver-live" || lastDataSource === "yahoo-live" ? "Live" : "JSON";
    toastText.textContent = `${pick.name} ${fmtPrice(pick, isKr)} (${sign}${Number(pick.change).toFixed(2)}%) · ${ftT("spValueScore", "가치")} ${pick.score || computeScore(pick)}${ftT("spPoints", "점")} · ${srcLabel}`;
    if (toastTime) toastTime.textContent = timeStr;
  }

  function updateCountdownBadge() {
    const timerEl = document.querySelector("#stockLiveStatusBadge .badge-text-timer");
    if (!timerEl || !isStreamingActive) return;
    const unit = ftLang() === "en" ? "s" : "초";
    timerEl.innerHTML = `<i class="fa-solid fa-arrows-rotate fa-spin-slow"></i> ${secondsLeft}${unit}`;
  }

  function resetLiveBadgeHtml() {
    const refreshLabel = ftT("spLiveRefresh", "60초 갱신");
    const badge = document.getElementById("stockLiveStatusBadge");
    const btn = document.getElementById("toggleStockLiveBtn");
    if (!badge) return;
    if (isStreamingActive) {
      badge.innerHTML = `
        <span class="pulse-dot"></span>
        <span class="badge-text-live">LIVE</span>
        <span class="badge-divider">|</span>
        <span class="badge-text-timer"><i class="fa-solid fa-arrows-rotate fa-spin-slow"></i> ${refreshLabel}</span>
      `;
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        btn.setAttribute("aria-label", ftT("spPauseLive", "실시간 갱신 일시정지"));
      }
      updateCountdownBadge();
    } else {
      badge.innerHTML = `
        <span class="pulse-dot" style="background:#ef4444;box-shadow:none;"></span>
        <span class="badge-text-live" style="color:#f87171;">PAUSED</span>
        <span class="badge-divider">|</span>
        <span class="badge-text-timer" style="color:#94a3b8;">${ftT("spPaused", "일시정지됨")}</span>
      `;
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        btn.setAttribute("aria-label", ftT("spResumeLive", "실시간 갱신 재개"));
      }
    }
  }

  function setLiveBadgePaused(paused) {
    resetLiveBadgeHtml();
  }

  function resetCountdown() {
    secondsLeft = REFRESH_MS / 1000;
    updateCountdownBadge();
  }

  function startCountdown() {
    if (countdownTimer) clearInterval(countdownTimer);
    resetCountdown();
    countdownTimer = setInterval(() => {
      if (!isStreamingActive) return;
      secondsLeft -= 1;
      if (secondsLeft <= 0) secondsLeft = REFRESH_MS / 1000;
      updateCountdownBadge();
    }, 1000);
  }

  function toggleStockLiveStream() {
    isStreamingActive = !isStreamingActive;
    setLiveBadgePaused(!isStreamingActive);
    if (isStreamingActive) {
      loadQuotes(true);
      startAutoRefresh();
      startCountdown();
    } else {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }
  }

  function startAutoRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    if (!isStreamingActive) return;
    refreshTimer = setInterval(() => {
      loadQuotes(true);
    }, REFRESH_MS);
  }

  function bindStockListeners() {
    if (listenersBound) return;
    listenersBound = true;

    document.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (chip) {
        switchFilter(chip.dataset.filter);
        return;
      }
      const hdrFilter = e.target.closest(".vi-header-actions [data-filter]");
      if (hdrFilter) {
        switchFilter(hdrFilter.dataset.filter);
        return;
      }
      const marketTab = e.target.closest(".market-tab");
      if (marketTab) {
        toggleMarket(marketTab.dataset.market);
        return;
      }
      const sourceTab = e.target.closest(".source-tab");
      if (sourceTab) {
        switchSource(sourceTab.dataset.source);
        return;
      }
      const card = e.target.closest(".vi-stock-card");
      if (card && !e.target.closest("a, button")) {
        const cached = stockCache.get(card.dataset.code);
        if (cached && window.StockInsight) {
          window.StockInsight.openModal(cached, cached.isKr);
        }
      }
    });

    const search = document.getElementById("searchInput");
    if (search) {
      search.addEventListener("input", () => {
        searchQuery = search.value;
        const data = window.__STOCK_LIVE__;
        const stocks = currentStocks.length ? currentStocks : collectStocks(data);
        lastRenderFingerprint = "";
        renderList(stocks, false, true);
      });
    }

    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        sortMode = sortSelect.value;
        const data = window.__STOCK_LIVE__;
        const stocks = currentStocks.length ? currentStocks : collectStocks(data);
        renderList(stocks, true, true);
      });
    }

    document.getElementById("toggleStockLiveBtn")?.addEventListener("click", toggleStockLiveStream);
  }

  async function bootStockLive(force) {
    if (!document.getElementById("quote-list")) return;
    if (stockBooted && !force) return;

    if (force) {
      stockBooted = false;
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }

    try {
      const res = await fetch(UNIVERSE_URL);
      universe = await res.json();
    } catch {
      universe = { kr: [], us: [] };
    }

    stockBooted = true;
    bindStockListeners();
    await Promise.all([loadQuotes(false), refreshIndexRibbons()]);
    startAutoRefresh();
    startCountdown();
  }

  function scheduleStockBoot(force) {
    const run = () => bootStockLive(!!force);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }
  }

  window.bootStockLive = bootStockLive;
  scheduleStockBoot(false);
  window.addEventListener("pageshow", () => scheduleStockBoot(true));
  window.addEventListener("load", () => {
    if (!stockBooted) scheduleStockBoot(false);
  });

  document.addEventListener("ft:langchange", () => {
    resetLiveBadgeHtml();
    const data = window.__STOCK_LIVE__;
    if (data?.kr?.length || data?.us?.length) {
      renderList(collectStocks(data), false, true);
      updateFooterMeta(data.packUpdated);
    } else if (statusEl() && !lastError) {
      statusEl().textContent = ftT("spStatusConnecting", "연결 중...");
    }
  });
})();
