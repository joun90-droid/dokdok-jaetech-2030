/**
 * stock-insight.js — 안전마진 · 매수 논리 · 종목 상세 모달
 */
(function (global) {
  function safetyMargin(stock) {
    if (!stock?.fairValue || !stock?.price) {
      return { pct: 0, discount: 0, fair: 0, price: 0, grade: "—", cls: "neutral", summary: "적정가 데이터 없음" };
    }
    const fair = Number(stock.fairValue);
    const price = Number(stock.price);
    const pct = fair > 0 ? ((fair - price) / fair) * 100 : 0;
    const discount = price < fair ? pct : -Math.abs(pct);
    let grade, cls, summary;
    if (pct >= 25) {
      grade = "A+";
      cls = "excellent";
      summary = "넉넉한 안전마진 — 가치 대비 저평가 구간";
    } else if (pct >= 15) {
      grade = "A";
      cls = "good";
      summary = "양호한 안전마진 — 분할 매수 적합";
    } else if (pct >= 5) {
      grade = "B";
      cls = "fair";
      summary = "적정 수준 — 추세 확인 후 진입";
    } else if (pct >= 0) {
      grade = "C";
      cls = "thin";
      summary = "안전마진 얇음 — 보수적 접근";
    } else {
      grade = "D";
      cls = "risk";
      summary = "적정가 대비 고평가 — 관망 또는 익절 검토";
    }
    return { pct: Math.round(pct * 10) / 10, discount, fair, price, grade, cls, summary };
  }

  function buyThesis(stock, isKr) {
    const mos = safetyMargin(stock);
    const reasons = [];
    const risks = [];
    const g = stock.gradeInfo || {};

    if (mos.pct >= 15) {
      reasons.push({
        icon: "fa-shield-halved",
        title: "안전마진 확보",
        body: `AI 적정주가 대비 ${mos.pct.toFixed(1)}% 할인 구간입니다. Graham식 안전마진 관점에서 매수 여유가 있습니다.`,
      });
    } else if (mos.pct >= 0) {
      reasons.push({
        icon: "fa-scale-balanced",
        title: "적정가 근접",
        body: `현재가가 적정주가 대비 ${mos.pct.toFixed(1)}% 수준입니다. 추가 조정 시 매력도가 높아집니다.`,
      });
    }

    if (stock.pbr < 1.2) {
      reasons.push({
        icon: "fa-book",
        title: "PBR 저평가 신호",
        body: `PBR ${stock.pbr.toFixed(2)}배 — 순자산 대비 주가가 낮아 자산가치 대비 매력적입니다. (업종 평균 1.5~2.0배 대비)`,
      });
    } else if (stock.pbr < 2) {
      reasons.push({
        icon: "fa-book-open",
        title: "합리적 PBR",
        body: `PBR ${stock.pbr.toFixed(2)}배 — 과도한 프리미엄 없이 성장 기대가 반영된 수준입니다.`,
      });
    } else {
      risks.push("PBR이 높아 자산 대비 프리미엄 — 성장 실현 여부 확인 필요");
    }

    if (stock.per < 12) {
      reasons.push({
        icon: "fa-coins",
        title: "PER 저평가",
        body: `PER ${stock.per.toFixed(1)}배 — 이익 대비 주가가 낮아 ${isKr ? "국내" : "해외"} 대형주 평균(15~20배) 대비 저렴합니다.`,
      });
    } else if (stock.per > 35) {
      risks.push(`PER ${stock.per.toFixed(1)}배 — 고PER 구간, 실적 서프라이즈 없으면 조정 가능`);
    }

    if (stock.roe >= 15) {
      reasons.push({
        icon: "fa-chart-line",
        title: "ROE 우수",
        body: `ROE ${stock.roe.toFixed(1)}% — 자기자본 대비 수익성이 높아 주주가치 창출력이 양호합니다.`,
      });
    } else if (stock.roe < 8) {
      risks.push(`ROE ${stock.roe.toFixed(1)}% — 수익성 부진, 구조적 개선 필요`);
    }

    if (stock.change > 1) {
      reasons.push({
        icon: "fa-fire",
        title: "단기 모멘텀",
        body: `당일 +${stock.change.toFixed(2)}% — 매수세 유입 중. 분할 매수로 추격 리스크 관리 권장.`,
      });
    } else if (stock.change < -2) {
      reasons.push({
        icon: "fa-arrow-down",
        title: "조정 매수 기회",
        body: `당일 ${stock.change.toFixed(2)}% 조정 — 우량주 눌림목에서 분할 매수 관점 검토.`,
      });
    }

    if (stock.score >= 78) {
      reasons.push({
        icon: "fa-gem",
        title: "영재 가치점수 상위",
        body: `가치점수 ${stock.score}점 (${g.grade || "A"}등급) — PER·PBR·ROE·모멘텀 종합 평가 상위권입니다.`,
      });
    }

    if (stock.upside >= 20) {
      reasons.push({
        icon: "fa-rocket",
        title: "상승 여력",
        body: `AI 모델 기준 +${stock.upside.toFixed(1)}% 상승 여력 — ${stock.sector} 섹터 내 상대적 매력.`,
      });
    }

    if (stock.div >= 2) {
      reasons.push({
        icon: "fa-hand-holding-dollar",
        title: "배당 매력",
        body: `배당수익률 ${stock.div.toFixed(1)}% — 장기 보유 시 현금흐름 보완.`,
      });
    }

    if (!reasons.length) {
      reasons.push({
        icon: "fa-eye",
        title: "관망 후 재평가",
        body: "현재 지표만으로는 강한 매수 근거가 부족합니다. 실적 발표·섹터 동향 확인 후 재검토하세요.",
      });
    }

    risks.push("본 분석은 교육·참고용이며 투자 권유가 아닙니다");
    if (isKr) risks.push("환율·금리·외국인 수급 변동에 민감할 수 있음");
    else risks.push("달러 강세·금리 변동 시 변동성 확대 가능");

    const action =
      g.grade === "S" || g.grade === "A"
        ? "1차 30% 분할 매수 → 지지선 확인 후 2·3차 추가"
        : g.grade === "B"
          ? "소액 분할 매수 후 추세 확인"
          : "관망 — 안전마진 15% 이상 확보 시 재검토";

    return {
      summary: `${stock.name} — ${g.label || "분석"} · ${mos.summary}`,
      reasons,
      risks,
      action,
      mos,
    };
  }

  function fmtMoney(n, isKr) {
    if (!n) return "—";
    if (isKr) return Math.round(n).toLocaleString("ko-KR") + "원";
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderModalBody(stock, isKr) {
    const thesis = buyThesis(stock, isKr);
    const mos = thesis.mos;
    const g = stock.gradeInfo || {};

    return `
      <header class="vi-modal-head">
        <div class="vi-modal-title-wrap">
          <span class="vi-market-badge ${isKr ? "kr" : "us"}">${isKr ? "🇰🇷" : "🇺🇸"} ${stock.market || ""}</span>
          <h2 id="vi-modal-title">${stock.name}</h2>
          <p class="vi-modal-code">${stock.code} · ${stock.sector} · ${g.grade || "—"}등급 (${stock.score}점)</p>
        </div>
        <button type="button" class="vi-modal-close" aria-label="닫기"><i class="fa-solid fa-xmark"></i></button>
      </header>
      <div class="vi-modal-body">
        <section class="vi-modal-section vi-mos-hero mos-${mos.cls}">
          <div class="vi-mos-main">
            <span class="vi-mos-label"><i class="fa-solid fa-shield-halved"></i> 안전마진 (Margin of Safety)</span>
            <strong class="vi-mos-pct">${mos.pct >= 0 ? "+" : ""}${mos.pct.toFixed(1)}%</strong>
            <span class="vi-mos-grade">등급 ${mos.grade}</span>
          </div>
          <p class="vi-mos-desc">${mos.summary}</p>
          <div class="vi-mos-bars">
            <div class="vi-mos-row"><span>현재가</span><strong>${fmtMoney(mos.price, isKr)}</strong></div>
            <div class="vi-mos-row"><span>AI 적정주가</span><strong>${fmtMoney(mos.fair, isKr)}</strong></div>
            <div class="vi-mos-row"><span>할인폭</span><strong class="${mos.pct >= 0 ? "up" : "down"}">${mos.pct >= 0 ? "" : "−"}${Math.abs(mos.pct).toFixed(1)}%</strong></div>
          </div>
        </section>

        <section class="vi-modal-section">
          <h3><i class="fa-solid fa-lightbulb"></i> 매수해야 하는 논리적 이유</h3>
          <ul class="vi-thesis-list">
            ${thesis.reasons.map((r) => `
              <li>
                <span class="vi-thesis-icon"><i class="fa-solid ${r.icon}"></i></span>
                <div><strong>${r.title}</strong><p>${r.body}</p></div>
              </li>`).join("")}
          </ul>
        </section>

        <section class="vi-modal-section vi-modal-metrics">
          <h3><i class="fa-solid fa-table"></i> 핵심 지표 스냅샷</h3>
          <div class="vi-modal-mgrid">
            <div><span>PBR</span><strong>${stock.pbr.toFixed(2)}</strong></div>
            <div><span>PER</span><strong>${stock.per.toFixed(1)}</strong></div>
            <div><span>ROE</span><strong>${stock.roe.toFixed(1)}%</strong></div>
            <div><span>배당</span><strong>${stock.div.toFixed(1)}%</strong></div>
            <div><span>상승여력</span><strong class="up">+${stock.upside.toFixed(1)}%</strong></div>
            <div><span>등락률</span><strong class="${stock.change >= 0 ? "up" : "down"}">${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}%</strong></div>
          </div>
        </section>

        <section class="vi-modal-section vi-modal-action">
          <h3><i class="fa-solid fa-route"></i> 추천 매매 전략</h3>
          <p>${thesis.action}</p>
        </section>

        <section class="vi-modal-section vi-modal-risks">
          <h3><i class="fa-solid fa-triangle-exclamation"></i> 리스크 · 유의사항</h3>
          <ul>${thesis.risks.map((r) => `<li>${r}</li>`).join("")}</ul>
        </section>
      </div>
      <footer class="vi-modal-foot">
        <a href="stock-tech.html" class="vi-btn vi-btn-outline"><i class="fa-solid fa-chart-line"></i> 기술적 분석</a>
        <a href="stock-fund.html" class="vi-btn vi-btn-outline"><i class="fa-solid fa-book"></i> 기본적 분석</a>
        <button type="button" class="vi-btn vi-btn-primary vi-modal-close-btn">확인</button>
      </footer>`;
  }

  function openModal(stock, isKr) {
    const modal = document.getElementById("stock-detail-modal");
    if (!modal || !stock) return;
    const panel = modal.querySelector(".vi-modal-panel");
    if (panel) panel.innerHTML = renderModalBody(stock, isKr);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("vi-modal-open");
    modal.querySelector(".vi-modal-close")?.focus();
  }

  function closeModal() {
    const modal = document.getElementById("stock-detail-modal");
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("vi-modal-open");
  }

  function bindModal() {
    const modal = document.getElementById("stock-detail-modal");
    if (!modal || modal.dataset.bound) return;
    modal.dataset.bound = "1";
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("vi-modal-backdrop") || e.target.closest(".vi-modal-close, .vi-modal-close-btn")) {
        closeModal();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  global.StockInsight = { safetyMargin, buyThesis, openModal, closeModal, bindModal };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindModal);
  } else {
    bindModal();
  }
})(window);
