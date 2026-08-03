/**
 * stock-edu-detail.js — 기술적/기본적 분석 카드 클릭 심화 정보
 */
(function () {
  const TECH_DEEP = {
    "망치형": {
      subtitle: "Hammer · 하락 추세 반전",
      sections: [
        { title: "정의", body: "긴 하단 꼬리 + 작은 몸통. 저가에서 매수세가 유입되어 하락을 막았다는 신호입니다." },
        { title: "진입 조건", body: "① 하락 추세 또는 지지선 근처 ② 다음 봉 양봉 확인 ③ 거래량 전일 대비 120% 이상" },
        { title: "손절·목표", body: "손절: 망치 저가 −1~2% / 목표: 최근 스윙 고점 또는 R:R 1:2" },
        { title: "실전 팁", body: "RSI 30 이하 과매도 구간에서 나온 망치는 신뢰도가 높습니다. 단독 캔들보다 2~3일 추세 확인 후 진입." },
      ],
    },
    "교수형": {
      subtitle: "Hanging Man · 상승 추세 경고",
      sections: [
        { title: "정의", body: "망치와 형태는 같으나 상승 추세 고점권에서 출현 — 매도 압력 증가 신호." },
        { title: "진입 조건", body: "매수보다 매도·관망 관점. 익절 또는 비중 축소 트리거로 활용." },
        { title: "손절·목표", body: "공매도 진입 시: 고점 +2% 손절 / 목표: 최근 지지선" },
        { title: "실전 팁", body: "다음 봉 음봉 + 거래량 증가 시 신뢰도 상승. 지지선 이탈 시 추세 전환 가능." },
      ],
    },
    "흡수형 (양)": {
      subtitle: "Bullish Engulfing",
      sections: [
        { title: "정의", body: "전일 음봉 몸통을 완전히 감싸는 양봉 — 매수세가 매도세를 압도." },
        { title: "진입 조건", body: "하락/조정 후 지지선 근처 + 거래량 급증 + MACD 골든크로스 동반 시 강력." },
        { title: "손절·목표", body: "손절: 흡수형 양봉 저가 / 목표: 전고점 또는 피보나치 61.8%" },
        { title: "실전 팁", body: "바닥권에서 2연속 출현 시 반등 확률 ↑. 뉴스 호재 직후 캔들은 가짜 신호 주의." },
      ],
    },
    "RSI (14)": {
      subtitle: "Relative Strength Index",
      sections: [
        { title: "계산 원리", body: "RSI = 100 − (100 / (1 + RS)), RS = 평균 상승폭 / 평균 하락폭 (14일). 0~100 스케일." },
        { title: "해석 구간", body: "70↑ 과매수(차익실현·조정) / 30↓ 과매도(반등 기대) / 50 = 중립선" },
        { title: "다이버전스", body: "가격 신저가 + RSI 고점 상승 = 강세 다이버전스(매수). 반대는 약세 다이버전스." },
        { title: "실전 팁", body: "강한 추세장에서는 RSI 70/30 돌파 후에도 추세 지속 가능 — 추세선·MA와 병행." },
      ],
    },
    "MACD (12,26,9)": {
      subtitle: "Moving Average Convergence Divergence",
      sections: [
        { title: "구성", body: "MACD Line = EMA12 − EMA26 / Signal = MACD 9일 EMA / Histogram = MACD − Signal" },
        { title: "신호", body: "골든크로스(MACD↑Signal) 매수 / 데드크로스 매도 / Histogram 0선 돌파 = 모멘텀 전환" },
        { title: "다이버전스", body: "가격 고점 갱신 + MACD 고점 하락 = 약세 다이버전스 → 조정 경고" },
        { title: "실전 팁", body: "0선 위 골든크로스 > 0선 아래. 횡보장에서는 휩소(whipsaw) 잦음 — ADX 25↑ 추세 확인." },
      ],
    },
    "Head & Shoulders (머리어깨)": {
      subtitle: "반전 패턴 · 하락",
      sections: [
        { title: "구조", body: "좌어깨–머리(고점)–우어깨 + 넥라인. 대칭성·거래량(머리 구간 감소)이 핵심." },
        { title: "진입", body: "넥라인 종가 이탈 + 거래량 증가 시 숏 또는 현물 비중 축소" },
        { title: "목표가", body: "목표 = 넥라인 − (머리 고점 − 넥라인). 손절 = 우어깨 고점 재돌파." },
        { title: "실전 팁", body: "넥라인 이탈 후 되돌림(retest)에서 2차 진입이 리스크 대비 유리." },
      ],
    },
  };

  const FUND_DEEP = {
    per: {
      title: "PER (주가수익비율)",
      formula: "PER = 주가 ÷ EPS",
      sections: [
        { title: "깊이 있는 해석", body: "PER 10배 = 투자금 회수에 10년 이익 필요. 성장률이 높으면 PER 프리미엄 정당화. PEG(PER÷성장률) 1 이하면 저평가 가능." },
        { title: "업종별 기준", body: "금융 5~8배 / 제조 10~15배 / IT·바이오 20~40배. 동종 비교가 필수." },
        { title: "함정", body: "일회성 이익·자사주 매입으로 EPS 부풀리면 PER 왜곡. 정상화 EPS로 재계산." },
        { title: "실전 체크", body: "① 5년 PER 밴드 ② Forward PER(예상 EPS) ③ 동종 대비 percentile" },
      ],
    },
    pbr: {
      title: "PBR (주가순자산비율)",
      formula: "PBR = 주가 ÷ BPS",
      sections: [
        { title: "깊이 있는 해석", body: "PBR 1 = 장부가와 시장가 일치. 1 미만은 이론적 청산가치 이하 거래(가치함정 주의)." },
        { title: "ROE와 연계", body: "ROE 15% 기업의 적정 PBR ≈ ROE÷요구수익률. ROE 높을수록 PBR 프리미엄 정당화." },
        { title: "함정", body: "부실 자산·재고평가·무형자산 상각 미반영 시 BPS 왜곡." },
        { title: "실전 체크", body: "① 순자산 성장 추이 ② PBR-ROE scatter 동종 비교 ③ 1 미만 지속 시 구조적 이유 분석" },
      ],
    },
    roe: {
      title: "ROE (자기자본이익률)",
      formula: "ROE = 당기순이익 ÷ 자기자본 × 100",
      sections: [
        { title: "듀퐁 분석", body: "ROE = 순이익률 × 자산회전율 × 재무레버리지. 어느 요인이 ROE를 견인하는지 분해." },
        { title: "기준", body: "15%↑ 우수 / 10~15% 양호 / 10%↓ 개선 필요. 5년 평균 ROE > 단년도." },
        { title: "함정", body: "자사주 소각·부채 급증으로 ROE 부풀림. 부채비율 200%↑ 시 레버리지 리스크." },
        { title: "실전 체크", body: "① ROE 추세 ② 잉여현금흐름(FCF) 동반 성장 ③ 배당성향과의 균형" },
      ],
    },
    eps: {
      title: "EPS (주당순이익)",
      formula: "EPS = 당기순이익 ÷ 발행주식수",
      sections: [
        { title: "깊이 있는 해석", body: "EPS 성장 = 기업 가치 성장의 핵심. 3년 CAGR 10%↑ 우량, 희석(유상증자) 시 EPS 하락 주의." },
        { title: "종류", body: "Trailing EPS(과거 4분기) vs Forward EPS(예상). PER 계산 시 Forward가 전망 반영." },
        { title: "함정", body: "회계 변경·특수관계자 거래·일회성 손익 제외한 Adjusted EPS 확인." },
        { title: "실전 체크", body: "① 분기 EPS surprise ② 컨센서스 대비 ③ 자사주 소각으로 EPS accretion" },
      ],
    },
  };

  function openEduModal(title, subtitle, sections) {
    let modal = document.getElementById("edu-detail-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "edu-detail-modal";
      modal.className = "edu-detail-modal";
      modal.innerHTML = '<div class="edu-modal-backdrop"></div><div class="edu-modal-panel" role="dialog"></div>';
      document.body.appendChild(modal);
      modal.addEventListener("click", (e) => {
        if (e.target.classList.contains("edu-modal-backdrop") || e.target.closest(".edu-modal-close")) {
          modal.hidden = true;
          document.body.classList.remove("edu-modal-open");
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hidden) {
          modal.hidden = true;
          document.body.classList.remove("edu-modal-open");
        }
      });
    }
    const panel = modal.querySelector(".edu-modal-panel");
    panel.innerHTML = `
      <header class="edu-modal-head">
        <div><h2>${title}</h2><p>${subtitle || ""}</p></div>
        <button type="button" class="edu-modal-close" aria-label="닫기"><i class="fa-solid fa-xmark"></i></button>
      </header>
      <div class="edu-modal-body">
        ${sections.map((s) => `
          <article class="edu-modal-block">
            <h4>${s.title}</h4>
            <p>${s.body}</p>
          </article>`).join("")}
      </div>`;
    modal.hidden = false;
    document.body.classList.add("edu-modal-open");
  }

  function defaultTechSections(name, meaning) {
    return [
      { title: "개요", body: meaning || `${name} 패턴에 대한 심화 학습입니다.` },
      { title: "확인 방법", body: "차트에서 패턴 위치(추세·지지/저항)와 거래량을 함께 확인하세요." },
      { title: "진입·청산", body: "패턴 완성 후 다음 봉 종가 확인 → 손절은 패턴 저점/고점 바깥 1~2%." },
      { title: "주의", body: "단일 패턴만으로 매매하지 말고 RSI·MACD·이동평균과 병행하세요." },
    ];
  }

  function bindTechCards() {
    document.querySelectorAll(".pat-card, .chart-pat-card, .ind-card").forEach((card) => {
      card.style.cursor = "pointer";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      const open = () => {
        const title = card.querySelector("h4")?.textContent?.trim() || "기술적 분석";
        const meaning = card.querySelector("p")?.textContent?.trim() || "";
        const deep = TECH_DEEP[title];
        openEduModal(title, deep?.subtitle || card.querySelector(".en")?.textContent || "", deep?.sections || defaultTechSections(title, meaning));
      };
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }

  function bindFundCards() {
    document.querySelectorAll("[data-fund-key]").forEach((card) => {
      const key = card.dataset.fundKey;
      const deep = FUND_DEEP[key];
      if (!deep) return;
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        openEduModal(deep.title, deep.formula, deep.sections);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { bindTechCards(); bindFundCards(); });
  } else {
    bindTechCards();
    bindFundCards();
  }

  window.addEventListener("load", () => {
    setTimeout(bindTechCards, 500);
  });
})();
