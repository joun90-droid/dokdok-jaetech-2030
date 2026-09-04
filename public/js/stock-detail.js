(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  function fmt(v, cur, unit) {
    if (unit) return `${Number(v).toLocaleString("ko-KR")} ${unit === "manwon/m2" ? "만원/㎡" : unit}`;
    if (cur === "KRW") return `${Number(v).toLocaleString("ko-KR")}원`;
    return `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }

  function analyzeFund(f) {
    if (!f) return "재무 지표 데이터 없음";
    const parts = [];
    if (f.per < 15) parts.push("PER 낮음 — 이익 대비 저평가 가능");
    else if (f.per > 35) parts.push("PER 높음 — 성장 기대 반영");
    else parts.push("PER 적정 수준");
    if (f.pbr < 1.5) parts.push("PBR 1.5 미만 — 자산가치 대비 저렴");
    else if (f.pbr > 5) parts.push("PBR 높음 — 프리미엄 구간");
    if (f.roe >= 15) parts.push("ROE 15%+ — 수익성 우수");
    else if (f.roe < 8) parts.push("ROE 낮음 — 수익성 개선 필요");
    return parts.join(" · ");
  }

  function renderChart(canvas, f, color) {
    if (!f || typeof Chart === "undefined") return;
    new Chart(canvas, {
      type: "radar",
      data: {
        labels: ["PER (↓좋음)", "PBR (↓좋음)", "ROE (↑좋음)"],
        datasets: [{
          data: [Math.min(f.per, 50), Math.min(f.pbr * 5, 50), Math.min(f.roe * 2, 50)],
          backgroundColor: color + "44",
          borderColor: color,
          borderWidth: 2,
          pointBackgroundColor: color,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0, max: 50,
            ticks: { display: false },
            grid: { color: "rgba(255,255,255,0.08)" },
            pointLabels: { color: "#9aa0a6", font: { size: 12 } },
          },
        },
      },
    });
  }

  async function load() {
    const root = document.getElementById("stock-detail-root");
    if (!id) {
      root.innerHTML = "<p class='map-error'>종목 ID가 없습니다. <a href='dashboard.html'>대시보드</a>에서 선택하세요.</p>";
      return;
    }
    try {
      const res = await fetch("/data/market-pack.json");
      const pack = await res.json();
      const d = pack.items.find((x) => x.id === id);
      if (!d) throw new Error("not found");

      const up = d.quote.changePct >= 0;
      const f = d.fundamentals;
      const ticker = (d.symbol || "").replace(".KS", "");

      document.title = `${d.name} (${ticker}) | 영재 2030재테크`;

      const pickKo = { "Strong Buy": "적극 매수", Buy: "매수 추천", "DCA Buy": "분할 매수", Hold: "장기 관망", Reduce: "비중 축소", Wait: "관망" };
      root.innerHTML = `
        <nav class="breadcrumb"><a href="index.html">홈</a> › <a href="dashboard.html#section-picks">시세·추천</a> › ${d.name}</nav>
        <div class="stock-detail-hero">
          <div class="pick-avatar stock-detail-avatar" style="background:${d.color}22;border-color:${d.color};color:${d.color}">${d.emoji || d.name.slice(0,2)}</div>
          <div>
            <h1>${d.name} <span class="pick-ticker">${ticker}</span></h1>
            ${d.sector ? `<span class="pick-sector">${d.sector}</span>` : ""}
            <p class="stock-detail-price">${fmt(d.quote.current, d.quote.currency, d.unit)}
              <span class="pick-chg ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${d.quote.changePct >= 0 ? "+" : ""}${Number(d.quote.changePct).toFixed(2)}%</span>
            </p>
            <span class="grade-badge ${d.grade.cls}">${d.grade.grade}</span>
            <span class="pick-action ${d.pick.cls}">${pickKo[d.pick.text] || d.pick.text}</span>
          </div>
        </div>
        <div class="stock-metrics-grid">
          <div class="metric-box"><span>현재가</span><strong>${fmt(d.quote.current, d.quote.currency, d.unit)}</strong></div>
          <div class="metric-box"><span>적정가</span><strong>${fmt(d.fair.fairPrice, d.quote.currency, d.unit)}</strong></div>
          <div class="metric-box"><span>가치점수</span><strong>${d.fair.score}점</strong></div>
          <div class="metric-box"><span>52주 최고</span><strong>${fmt(d.quote.high52, d.quote.currency, d.unit)}</strong></div>
          <div class="metric-box"><span>52주 최저</span><strong>${fmt(d.quote.low52, d.quote.currency, d.unit)}</strong></div>
          <div class="metric-box"><span>밸류에이션</span><strong>${d.fair.label}</strong></div>
        </div>
        ${f ? `
        <section class="g-panel stock-fund-panel">
          <h2>📊 PER · PBR · ROE</h2>
          <div class="fund-layout">
            <div class="fund-chart-wrap"><canvas id="fundRadar"></canvas></div>
            <div class="fund-stats">
              <div class="fund-stat"><span>PER</span><strong>${f.per}</strong><small>주가수익비율</small></div>
              <div class="fund-stat"><span>PBR</span><strong>${f.pbr}</strong><small>주가순자산비율</small></div>
              <div class="fund-stat"><span>ROE</span><strong>${f.roe}%</strong><small>자기자본이익률</small></div>
            </div>
          </div>
          <p class="fund-analysis">${analyzeFund(f)}</p>
        </section>` : ""}
        <div class="info-box"><p>${d.reason || ""}</p></div>
        <div class="info-box warning"><p><strong>면책:</strong> PER/PBR/ROE·등급은 참고용이며 투자 권유가 아닙니다.</p></div>
        <p class="cta-center"><a href="dashboard.html#section-picks" class="btn btn-primary">← 전체 종목 보기</a></p>`;

      if (f) renderChart(document.getElementById("fundRadar"), f, d.color || "#4285F4");
    } catch {
      root.innerHTML = "<p class='map-error'>종목을 찾을 수 없습니다. <a href='dashboard.html'>대시보드</a></p>";
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
