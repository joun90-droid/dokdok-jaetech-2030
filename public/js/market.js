/**
 * 시세 엔진 v5 TURBO — 사전계산 팩 즉시 렌더 + IndexedDB + 점진적 페인트
 */
(function () {
  const PACK_URL = "/data/market-pack.json";
  const PACK_VER = 7;
  const IDB_NAME = "ft2030_turbo";
  const IDB_STORE = "pack";
  const REFRESH_MS = 120000;
  const PAINT = { summary: 1, picks: 2, tickers: 3, cards: 4, table: 8, chart: 16, fundamentals: 32 };

  let marketData = [];
  let chartInstance = null;
  let fundChartInstance = null;
  let cardFilter = null;
  let loadStart = 0;

  /* ── IndexedDB (재방문 0ms에 가깝게) ── */
  function idbGet() {
    return new Promise((resolve) => {
      if (!("indexedDB" in window)) return resolve(null);
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
      req.onsuccess = () => {
        const tx = req.result.transaction(IDB_STORE, "readonly");
        const get = tx.objectStore(IDB_STORE).get("pack");
        get.onsuccess = () => resolve(get.result || null);
        get.onerror = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  }

  function idbSet(pack) {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
      req.onsuccess = () => {
        const tx = req.result.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).put(pack, "pack");
      };
    } catch { /* */ }
  }

  /* ── 포맷 ── */
  function formatPrice(v, currency, unit) {
    if (unit) {
      const u = unit === "manwon/m2" ? "만원/㎡" : unit;
      return `${Number(v).toLocaleString("ko-KR")} ${u}`;
    }
    if (currency === "KRW") return `${Number(v).toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`;
    return `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }

  function formatChange(pct) {
    return `${pct >= 0 ? "+" : ""}${Number(pct).toFixed(2)}%`;
  }

  function getInitials(name) {
    if (/^[A-Za-z]/.test(name)) return name.slice(0, 2).toUpperCase();
    return name.slice(0, 2);
  }

  function getPickReason(d) {
    const { score, label, ratio } = d.fair;
    const sector = d.sector ? `${d.sector} · ` : "";
    if (d.type === "stock") {
      if (score >= 80) return `${sector}52주 적정가 대비 ${label}. ${d.name} 장기 적립 매수 구간.`;
      if (score >= 65) return `${sector}적정가의 ${ratio}%. 분할 매수 권장.`;
      if (score >= 45) return `${sector}밸류에이션 ${label}. 관망·적립 추천.`;
      return `${sector}단기 ${label}. 신규 진입 보수적 접근.`;
    }
    if (d.type === "etf") return `분산 ETF · ${label} (${score}점). 2030 장기 적립 핵심.`;
    if (d.type === "index") return `시장 지수 · ${label}. 전체 흐름 참고.`;
    if (d.estateType) {
      const types = { apt: "아파트", land: "토지", forest: "임야", building: "건물" };
      return `${d.region} ${types[d.estateType] || ""} · ${label}. 실거주·투자 참고 지수.`;
    }
    return `부동산 참고 · ${label}.`;
  }

  function enrichReasons(data) {
    const pickKo = { "Strong Buy": "적극 매수", Buy: "매수 추천", "DCA Buy": "분할 매수", Hold: "장기 관망", Reduce: "비중 축소", Wait: "관망" };
    const labelKo = { undervalued: "저평가", slight_undervalued: "약간 저평가", fair: "적정", slight_overvalued: "약간 고평가", overvalued: "고평가" };
    const emojiMap = { A: "🍎", M: "💻", N: "🎮", G: "🔍", Z: "📦", T: "⚡", F: "👤", J: "🏦", S: "📱", H: "💾", K: "💬", L: "🔋", B: "💊", C: "🧬", US: "🇺🇸", KR: "🇰🇷", ETF: "📊", APT: "🏢", LAND: "🌍", FOR: "🌲", BLD: "🏗️" };
    return data.map((d) => ({
      ...d,
      emoji: emojiMap[d.emoji] || d.emoji,
      pick: { ...d.pick, text: pickKo[d.pick?.text] || d.pick?.text },
      fair: { ...d.fair, label: labelKo[d.fair?.label] || d.fair?.label },
      reason: getPickReason({ ...d, fair: { ...d.fair, label: labelKo[d.fair?.label] || d.fair?.label } }),
    }));
  }

  /* ── 렌더 (점진적) ── */
  function isDashboard() {
    return !!document.getElementById("section-picks");
  }

  function chipEl(action, inner, cls = "") {
    if (isDashboard()) {
      return `<button type="button" class="g-chip g-chip-btn ${cls}" data-chip="${action}">${inner}</button>`;
    }
    const hash = { all: "section-market", stock: "section-picks", estate: "section-estate-map", up: "section-market", down: "section-market", top: "section-picks", fund: "section-fundamentals" };
    return `<a class="g-chip g-chip-btn ${cls}" href="dashboard.html#${hash[action] || "section-market"}">${inner}</a>`;
  }

  function stockLink(d) {
    if (d.type === "stock" && d.id) return `stock.html?id=${encodeURIComponent(d.id)}`;
    if (d.type === "etf" && d.id) return `stock.html?id=${encodeURIComponent(d.id)}`;
    return null;
  }

  function renderSummary() {
    const el = document.getElementById("market-summary");
    if (!el || !marketData.length) return;
    const stocks = marketData.filter((d) => d.type === "stock");
    const estate = marketData.filter((d) => d.type === "estate");
    const up = marketData.filter((d) => d.quote.changePct >= 0).length;
    const top = [...marketData].sort((a, b) => b.fair.score - a.fair.score)[0];
    el.innerHTML =
      chipEl("all", `<span class="g-dot blue"></span>전체 <strong>${marketData.length}</strong>`) +
      chipEl("stock", `<span class="g-dot green"></span>개별주 <strong>${stocks.length}</strong>`) +
      chipEl("estate", `<span class="g-dot yellow"></span>부동산 <strong>${estate.length}</strong>`) +
      chipEl("up", `<span class="g-dot green"></span>↑ <strong>${up}</strong>`) +
      chipEl("down", `<span class="g-dot red"></span>↓ <strong>${marketData.length - up}</strong>`) +
      chipEl("top", `<span class="g-dot yellow"></span>TOP <strong>${top?.name} ${top?.grade?.grade}</strong>`, "highlight");
  }

  function renderRecommendations() {
    const el = document.getElementById("pick-list");
    if (!el) return;
    const limit = el.dataset.limit ? parseInt(el.dataset.limit, 10) : 0;
    const picks = marketData
      .filter((d) => d.type === "stock" || d.type === "etf")
      .sort((a, b) => b.fair.score - a.fair.score)
      .slice(0, limit || undefined);

    if (!picks.length) {
      el.innerHTML = '<div class="pick-skeleton">' + Array(4).fill('<div class="sk-card"></div>').join("") + "</div>";
      return;
    }

    el.innerHTML = picks.map((d, i) => {
      const up = d.quote.changePct >= 0;
      const ticker = (d.symbol || d.quote.ticker || "").replace(".KS", "");
      const href = stockLink(d);
      const tag = href ? "a" : "article";
      const linkAttr = href ? ` href="${href}" class="pick-card pick-card-link"` : ` class="pick-card"`;
      return `<${tag}${linkAttr} style="animation-delay:${i * 0.03}s">
        <div class="pick-rank">${i + 1}</div>
        <div class="pick-avatar" style="background:${d.color}22;border-color:${d.color}55;color:${d.color}">${d.emoji || getInitials(d.name)}</div>
        <div class="pick-body">
          <div class="pick-head"><h3>${d.name} <span class="pick-ticker">${ticker}</span></h3><span class="grade-badge ${d.grade.cls}">${d.grade.grade}</span></div>
          ${d.sector ? `<span class="pick-sector">${d.sector}</span>` : ""}
          <p class="pick-price">${formatPrice(d.quote.current, d.quote.currency, d.unit)} <span class="pick-chg ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${formatChange(d.quote.changePct)}</span></p>
          <div class="pick-metrics">
            <span>적정가 <strong>${formatPrice(d.fair.fairPrice, d.quote.currency, d.unit)}</strong></span>
            <span>가치 <strong>${d.fair.score}점</strong></span>
            ${d.fundamentals ? `<span>PER <strong>${d.fundamentals.per}</strong></span>` : ""}
          </div>
          <p class="pick-reason">${d.reason || ""}</p>
          <span class="pick-action ${d.pick.cls}">${d.pick.text}</span>
          ${href ? '<span class="pick-more">상세 보기 →</span>' : ""}
        </div>
      </${tag}>`;
    }).join("");
  }

  function renderTickers() {
    const el = document.getElementById("market-tickers");
    if (!el || !marketData.length) return;
    const show = marketData.filter((d) => d.type !== "estate" || d.estateType === "apt").slice(0, 24);
    el.innerHTML = show.map((d) => {
      const up = d.quote.changePct >= 0;
      const href = stockLink(d);
      const inner = `<span class="ticker-dot" style="background:${d.color}"></span>
        <span class="ticker-name">${d.name}</span>
        <span class="ticker-price">${formatPrice(d.quote.current, d.quote.currency, d.unit)}</span>
        <span class="ticker-chg">${formatChange(d.quote.changePct)}</span>`;
      return href
        ? `<a class="ticker-item ${up ? "up" : "down"}" href="${href}">${inner}</a>`
        : `<div class="ticker-item ${up ? "up" : "down"}">${inner}</div>`;
    }).join("");
  }

  function renderCards(filter) {
    const el = document.getElementById("market-cards");
    if (!el) return;
    const map = {
      all: () => true,
      us: (d) => d.market === "us",
      kr: (d) => d.market === "kr",
      re: (d) => d.market === "re",
      stock: (d) => d.type === "stock",
      estate: (d) => d.type === "estate",
    };
    const fn = map[filter] || map.all;
    const labels = { us: "미장", kr: "국장", re: "부동산", index: "지수", etf: "ETF", stock: "개별주", estate: "부동산" };
    const estateLabels = { apt: "아파트", land: "토지", forest: "임야", building: "건물" };

    let filtered = marketData.filter(fn);
    if (cardFilter === "up") filtered = filtered.filter((d) => d.quote.changePct >= 0);
    if (cardFilter === "down") filtered = filtered.filter((d) => d.quote.changePct < 0);

    el.innerHTML = filtered.map((d) => {
      const up = d.quote.changePct >= 0;
      const tag = d.estateType ? estateLabels[d.estateType] : (labels[d.type] || labels[d.market]);
      const href = stockLink(d);
      const inner = `<div class="market-card-top">
          <span class="market-tag" style="--tag-color:${d.color}">${tag}</span>
          <span class="grade-badge ${d.grade.cls}">${d.grade.grade}</span>
        </div>
        <h3>${d.emoji} ${d.name}</h3>
        <p class="market-price">${formatPrice(d.quote.current, d.quote.currency, d.unit)}</p>
        <p class="market-chg ${up ? "up" : "down"}">${formatChange(d.quote.changePct)}</p>
        <div class="score-bar"><div class="score-fill" style="width:${d.fair.score}%"></div></div>
        <p class="grade-desc">${d.pick.text} · ${d.fair.label}</p>
        ${d.fundamentals ? `<p class="fund-mini">PER ${d.fundamentals.per} · PBR ${d.fundamentals.pbr} · ROE ${d.fundamentals.roe}%</p>` : ""}`;
      return href
        ? `<a class="market-card market-card-link ${up ? "up" : "down"}" href="${href}">${inner}</a>`
        : `<article class="market-card ${up ? "up" : "down"}">${inner}</article>`;
    }).join("");
  }

  function renderGradeTable() {
    const el = document.getElementById("grade-table-body");
    if (!el) return;
    const typeLabel = { stock: "개별주", etf: "ETF", index: "지수", estate: "부동산" };
    const estateLabels = { apt: "아파트", land: "토지", forest: "임야", building: "건물" };
    el.innerHTML = [...marketData].sort((a, b) => b.fair.score - a.fair.score).map((d, i) => {
      let type = typeLabel[d.type] || d.market;
      if (d.estateType) type = estateLabels[d.estateType];
      return `<tr class="grade-row${stockLink(d) ? " grade-row-link" : ""}" ${stockLink(d) ? `data-href="${stockLink(d)}"` : ""}>
        <td>${i + 1}</td>
        <td><strong>${d.name}</strong>${d.sector ? `<br><small>${d.sector}</small>` : ""}${d.region ? `<br><small>${d.region}</small>` : ""}</td>
        <td>${type}</td>
        <td>${formatPrice(d.quote.current, d.quote.currency, d.unit)}</td>
        <td>${formatPrice(d.fair.fairPrice, d.quote.currency, d.unit)}</td>
        <td>${d.fair.label} (${d.fair.score})</td>
        <td><span class="grade-badge ${d.grade.cls}">${d.grade.grade}</span></td>
        <td><span class="pick-action ${d.pick.cls}">${d.pick.text}</span></td>
        ${d.fundamentals ? `<td class="fund-cell">PER ${d.fundamentals.per}<br>PBR ${d.fundamentals.pbr}<br>ROE ${d.fundamentals.roe}%</td>` : "<td>—</td>"}
      </tr>`;
    }).join("");
  }

  function renderFundamentals() {
    const canvas = document.getElementById("fundamentalsChart");
    const table = document.getElementById("fundamentals-table-body");
    const stocks = marketData.filter((d) => d.type === "stock" && d.fundamentals).slice(0, 10);
    if (table) {
      table.innerHTML = stocks.map((d) => `<tr class="grade-row-link" data-href="stock.html?id=${encodeURIComponent(d.id)}">
        <td><strong>${d.name}</strong></td>
        <td>${d.fundamentals.per}</td><td>${d.fundamentals.pbr}</td><td>${d.fundamentals.roe}%</td>
        <td><span class="grade-badge ${d.grade.cls}">${d.grade.grade}</span></td>
        <td><a href="stock.html?id=${encodeURIComponent(d.id)}" class="btn-link">상세 →</a></td>
      </tr>`).join("");
    }
    if (!canvas || typeof Chart === "undefined" || !stocks.length) return;
    if (fundChartInstance) fundChartInstance.destroy();
    fundChartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: stocks.map((d) => d.name),
        datasets: [
          { label: "PER", data: stocks.map((d) => d.fundamentals.per), backgroundColor: "#4285F488", borderRadius: 6 },
          { label: "PBR", data: stocks.map((d) => d.fundamentals.pbr), backgroundColor: "#FBBC0488", borderRadius: 6 },
          { label: "ROE", data: stocks.map((d) => d.fundamentals.roe), backgroundColor: "#34A85388", borderRadius: 6 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 200 },
        plugins: { legend: { labels: { color: "#9aa0a6" } } },
        scales: {
          x: { ticks: { color: "#9aa0a6", font: { size: 9 }, maxRotation: 45 }, grid: { display: false } },
          y: { ticks: { color: "#9aa0a6" }, grid: { color: "rgba(255,255,255,0.04)" } },
        },
      },
    });
  }

  function renderChart() {
    const canvas = document.getElementById("fairValueChart");
    if (!canvas || typeof Chart === "undefined" || !marketData.length) return;
    const stocks = marketData.filter((d) => d.type === "stock").sort((a, b) => b.fair.score - a.fair.score).slice(0, 12);
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: stocks.map((d) => d.name),
        datasets: [{ data: stocks.map((d) => d.fair.score), backgroundColor: stocks.map((d) => d.color + "CC"), borderRadius: 10, borderSkipped: false }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 200 },
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#9aa0a6", font: { size: 10 } }, grid: { display: false } },
          y: { min: 0, max: 100, ticks: { color: "#9aa0a6" }, grid: { color: "rgba(255,255,255,0.04)" } },
        },
      },
    });
  }

  function updateMeta(fromCache, ms) {
    const updated = document.getElementById("market-updated");
    const status = document.getElementById("market-status");
    const speed = document.getElementById("load-speed");
    const src = fromCache ? " · 캐시" : "";
    if (updated) updated.textContent = `갱신 ${new Date().toLocaleTimeString("ko-KR")}${src}`;
    if (speed) speed.textContent = `⚡ ${ms}ms`;
    if (status) status.textContent = marketData.length ? `${marketData.length}종목 로드 완료` : "";
  }

  const CRITICAL = PAINT.summary | PAINT.picks | PAINT.tickers;
  const FULL = CRITICAL | PAINT.cards | PAINT.table | PAINT.chart;

  function paintStage(stage, fromCache, ms) {
    if (stage & PAINT.summary) renderSummary();
    if (stage & PAINT.picks) renderRecommendations();
    if (stage & PAINT.tickers) renderTickers();
    if (stage & PAINT.cards) {
      const active = document.querySelector(".market-tab.active")?.dataset.market || "all";
      renderCards(active);
    }
    if (stage & PAINT.table) renderGradeTable();
    if (stage & PAINT.chart) renderChart();
    if (stage & PAINT.fundamentals) renderFundamentals();
    if (stage & CRITICAL) updateMeta(fromCache, ms);
  }

  function turboPaint(fromCache) {
    const ms = Math.round(performance.now() - loadStart);
    paintStage(PAINT.summary | PAINT.picks | PAINT.tickers, fromCache, ms);
    requestAnimationFrame(() => paintStage(PAINT.cards, fromCache, ms));
    const idle = () => {
      paintStage(PAINT.table | PAINT.chart | PAINT.fundamentals, fromCache, ms);
      initChipNav();
      initTableLinks();
      handleHashScroll();
      window.dispatchEvent(new CustomEvent("market:ready", { detail: marketData }));
    };
    requestIdleCallback ? requestIdleCallback(idle) : setTimeout(idle, 50);
  }

  async function fetchPack() {
    const res = await fetch(PACK_URL, { cache: "default" });
    if (!res.ok) throw new Error("pack fetch failed");
    const pack = await res.json();
    if (pack.v !== PACK_VER || !pack.items?.length) throw new Error("invalid pack");
    return pack;
  }

  function applyPack(pack, fromCache) {
    marketData = enrichReasons(pack.items);
    idbSet(pack);
    turboPaint(fromCache);
  }

  async function boot() {
    loadStart = performance.now();

    /* 1단계: IndexedDB 즉시 (0~5ms) */
    const cached = await idbGet();
    if (cached?.items?.length) applyPack(cached, true);

    /* 2단계: 네트워크 팩 (CDN 캐시, 사전계산) */
    try {
      const pack = await fetchPack();
      if (!cached || cached.updated !== pack.updated) applyPack(pack, false);
    } catch {
      if (!marketData.length) {
        const el = document.getElementById("market-status");
        if (el) el.textContent = "시세 로드 실패 — 새로고침 해주세요";
      }
    }
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }

  function setMarketTab(market) {
    document.querySelectorAll(".market-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.market === market);
    });
    renderCards(market);
  }

  function initChipNav() {
    document.getElementById("market-summary")?.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-chip]");
      if (!chip || !isDashboard()) return;
      e.preventDefault();
      const action = chip.dataset.chip;
      cardFilter = null;
      if (action === "all") { setMarketTab("all"); scrollToSection("section-market"); return; }
      if (action === "stock") { setMarketTab("stock"); scrollToSection("section-picks"); return; }
      if (action === "estate") { setMarketTab("estate"); scrollToSection("section-estate-map"); return; }
      if (action === "up") { cardFilter = "up"; setMarketTab("all"); scrollToSection("section-market"); return; }
      if (action === "down") { cardFilter = "down"; setMarketTab("all"); scrollToSection("section-market"); return; }
      if (action === "top") scrollToSection("section-picks");
      if (action === "fund") scrollToSection("section-fundamentals");
    });
  }

  function initTableLinks() {
    document.querySelectorAll(".grade-row-link[data-href]").forEach((row) => {
      row.style.cursor = "pointer";
      row.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        location.href = row.dataset.href;
      });
    });
  }

  function handleHashScroll() {
    const hash = location.hash.replace("#", "");
    if (!hash) return;
    setTimeout(() => scrollToSection(hash), 300);
  }

  function initTabs() {
    document.querySelectorAll(".market-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".market-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        cardFilter = null;
        renderCards(tab.dataset.market);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("market-dashboard")) return;
    initTabs();
    boot();
    handleHashScroll();
    setInterval(boot, REFRESH_MS);
  });

  window.FT2030Market = { getData: () => marketData, refresh: boot, scrollToSection };
})();
