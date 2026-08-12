/**
 * estate-i18n.js — Real-estate live widget UI strings (KO/EN)
 */
(function () {
  const UI = {
    ko: {
      pricePerPyeong: "평당 매매가:",
      jeonseChange: "전세가율 / 1년변동:",
      manwon: "만원",
      eok: "억",
      justNow: "방금 전",
      paused: "일시정지됨",
      refresh1h: "1시간 갱신",
      loadingData: "부동산 시세 시뮬레이션 데이터 불러오는 중...",
      loadingNews: "이슈 요약 불러오는 중...",
      chartPrice: "평당가 (만원)",
      chartJeonse: "전세가율 (%)",
      liveDeal: "시세 변동 예시",
      breaking: "이슈",
      millionKRW: "만",
      billionKRW: "억",
      won: "원",
      perMonth: "/월",
    },
    en: {
      pricePerPyeong: "Price per pyeong:",
      jeonseChange: "Jeonse ratio / 1-yr change:",
      manwon: "10k KRW",
      eok: "100M KRW",
      justNow: "Just now",
      paused: "Paused",
      refresh1h: "Hourly refresh",
      loadingData: "Loading real estate simulation data...",
      loadingNews: "Loading issue summaries...",
      chartPrice: "Price per pyeong (10k KRW)",
      chartJeonse: "Jeonse ratio (%)",
      liveDeal: "Sample update",
      breaking: "Issue",
      millionKRW: "0k",
      billionKRW: "00M",
      won: "KRW",
      perMonth: "/mo",
    },
  };

  const CATEGORY_EN = {
    "투기과열지구": "Speculative zone",
    "조정대상지역": "Adjustment zone",
    "비규제지역": "Non-regulated",
    "1기신도시 특별법 대상": "1st-gen new town",
  };

  const REGION_EN = {
    "경기 파주 운정신도시": "Paju Unjeong New Town (Gyeonggi)",
    "서울 강남구": "Seoul Gangnam-gu",
    "서울 용산구": "Seoul Yongsan-gu",
    "서울 성동구 (성수·옥수)": "Seoul Seongdong (Seongsu·Okku)",
    "경기 성남 분당·판교": "Seongnam Bundang·Pangyo (Gyeonggi)",
    "경기 화성 동탄신도시": "Hwaseong Dongtan New Town (Gyeonggi)",
    "경기 평택 고덕국제신도시": "Pyeongtaek Godeok New Town (Gyeonggi)",
    "인천 연수 송도국제도시": "Incheon Songdo Intl. City",
    "충남 천안 불당·아산 배방": "Cheonan·Asan (Chungnam)",
    "대전 유성구 (도안·노은)": "Daejeon Yuseong (Doan·Noeun)",
    "세종 조치원·세종시": "Sejong City",
    "부산 해운대·센텀": "Busan Haeundae·Centum",
    "대구 수성구 범어": "Daegu Suseong Beomeo",
    "광주 상무·첨단": "Gwangju Sangmu·Advanced",
    "강원 원주 기업도시": "Wonju Enterprise City (Gangwon)",
  };

  function lang() {
    return (window.ftGetLang && window.ftGetLang() === "en") ? "en" : "ko";
  }

  window.estateIsEn = () => lang() === "en";

  window.estateTr = function estateTr(key) {
    const bag = UI[lang()];
    return (bag && bag[key]) || key;
  };

  window.estateTrCategory = function estateTrCategory(cat) {
    if (lang() !== "en") return cat;
    if (CATEGORY_EN[cat]) return CATEGORY_EN[cat];
    if (cat.includes("투기")) return "Speculative zone";
    if (cat.includes("조정")) return "Adjustment zone";
    if (cat.includes("비규제")) return "Non-regulated";
    return window.ftTranslatePhrase ? window.ftTranslatePhrase(cat, "en") : cat;
  };

  window.estateTrRegion = function estateTrRegion(name) {
    if (lang() !== "en") return name;
    if (REGION_EN[name]) return REGION_EN[name];
    return window.ftTranslatePhrase ? window.ftTranslatePhrase(name, "en") : name;
  };

  window.estateTrText = function estateTrText(str) {
    if (lang() !== "en" || !str) return str;
    return window.ftTranslatePhrase ? window.ftTranslatePhrase(str, "en") : str;
  };
})();
