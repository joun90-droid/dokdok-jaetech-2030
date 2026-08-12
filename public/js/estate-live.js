// 대한민국 전국 주요 지역별 실시간 부동산 데이터 (2026년 실거래가/감정가 연동 - 파주 운정 및 전국 확대)

function eTr(key) { return (window.estateTr && window.estateTr(key)) || key; }
function eRegion(name) { return (window.estateTrRegion && window.estateTrRegion(name)) || name; }
function eCat(cat) { return (window.estateTrCategory && window.estateTrCategory(cat)) || cat; }
function eText(s) { return (window.estateTrText && window.estateTrText(s)) || s; }
function eIsEn() { return window.estateIsEn && window.estateIsEn(); }

const regionalData = [
  {
    id: 'gyeonggi-paju',
    name: '경기 파주 운정신도시',
    province: '경기도',
    category: '비규제지역',
    avgPricePerPyeong: 2200, // 만원
    avgApartmentPrice: 6.8, // 억원
    jeonseRatio: 65.4, // %
    sentimentIndex: 106.8, // 매수우위
    priceChange1Yr: 5.4, // %
    tradeVolumeChange: 19.2,
    landRating: 'A',
    buildingRating: 'A',
    topIssues: ['GTX-A 운정역 개통 및 역세권 개발', '지하철 3호선 운정 연장', '운정 테크노밸리 산단'],
    propertyTypes: {
      apartment: { price: '6.8억', rentalYield: '3.8%', landRatio: '상' },
      building: { price: '28억', rentalYield: '4.9%', capRate: '4.6%' },
      land: { price: '평당 2,500만', developmentPotential: '상' },
      villa: { price: '2.8억', rentalYield: '5.2%', moaTown: '해당' }
    },
    scores: { transport: 94, school: 92, commerce: 90, development: 97, liquidity: 92 }
  },
  {
    id: 'seoul-gangnam',
    name: '서울 강남구',
    province: '서울특별시',
    category: '투기과열지구',
    avgPricePerPyeong: 8800,
    avgApartmentPrice: 26.5,
    jeonseRatio: 48.2,
    sentimentIndex: 112.4,
    priceChange1Yr: 7.2,
    tradeVolumeChange: 14.5,
    landRating: 'A+',
    buildingRating: 'A+',
    topIssues: ['영동대로 복합환승센터', '압구정·대치 재건축 규제완화', 'GBD 테크 기업 수요'],
    propertyTypes: {
      apartment: { price: '26.5억', rentalYield: '2.1%', landRatio: '고' },
      building: { price: '120억', rentalYield: '3.4%', capRate: '3.2%' },
      land: { price: '평당 1.5억', developmentPotential: '최상' },
      villa: { price: '8.5억', rentalYield: '3.8%', moaTown: '진행중' }
    },
    scores: { transport: 98, school: 99, commerce: 97, development: 95, liquidity: 98 }
  },
  {
    id: 'seoul-yongsan',
    name: '서울 용산구',
    province: '서울특별시',
    category: '투기과열지구',
    avgPricePerPyeong: 7600,
    avgApartmentPrice: 22.8,
    jeonseRatio: 51.0,
    sentimentIndex: 108.9,
    priceChange1Yr: 8.5,
    tradeVolumeChange: 18.2,
    landRating: 'A+',
    buildingRating: 'A+',
    topIssues: ['용산정비창 국제업무지구 개발', '용산 국가공원 조성', '한남뉴타운 재개발'],
    propertyTypes: {
      apartment: { price: '22.8억', rentalYield: '2.3%', landRatio: '고' },
      building: { price: '95억', rentalYield: '3.6%', capRate: '3.4%' },
      land: { price: '평당 1.2억', developmentPotential: '최상' },
      villa: { price: '9.2억', rentalYield: '3.5%', moaTown: '유력' }
    },
    scores: { transport: 96, school: 88, commerce: 95, development: 99, liquidity: 95 }
  },
  {
    id: 'seoul-seongdong',
    name: '서울 성동구 (성수·옥수)',
    province: '서울특별시',
    category: '조정대상지역',
    avgPricePerPyeong: 6300,
    avgApartmentPrice: 18.9,
    jeonseRatio: 53.5,
    sentimentIndex: 105.1,
    priceChange1Yr: 9.1,
    tradeVolumeChange: 21.0,
    landRating: 'A+',
    buildingRating: 'A',
    topIssues: ['성수동 글로벌 IT/패션 클러스터', '삼표레미콘 부지 첨단개발', '성수전략정비구역'],
    propertyTypes: {
      apartment: { price: '18.9억', rentalYield: '2.5%', landRatio: '중상' },
      building: { price: '80억', rentalYield: '3.9%', capRate: '3.7%' },
      land: { price: '평당 1.1억', developmentPotential: '상' },
      villa: { price: '7.8억', rentalYield: '4.0%', moaTown: '추진중' }
    },
    scores: { transport: 93, school: 86, commerce: 98, development: 96, liquidity: 94 }
  },
  {
    id: 'gyeonggi-bundang',
    name: '경기 성남 분당·판교',
    province: '경기도',
    category: '1기신도시 특별법 대상',
    avgPricePerPyeong: 5100,
    avgApartmentPrice: 15.2,
    jeonseRatio: 56.4,
    sentimentIndex: 104.5,
    priceChange1Yr: 6.3,
    tradeVolumeChange: 15.8,
    landRating: 'A+',
    buildingRating: 'A',
    topIssues: ['노후계획도시 재건축 선도지구 지정', '판교 제2·제3 테크노밸리', 'GTX-A 개통 효과'],
    propertyTypes: {
      apartment: { price: '15.2억', rentalYield: '2.7%', landRatio: '상' },
      building: { price: '65억', rentalYield: '4.1%', capRate: '3.9%' },
      land: { price: '평당 6,800만', developmentPotential: '상' },
      villa: { price: '6.0억', rentalYield: '4.2%', moaTown: '해당없음' }
    },
    scores: { transport: 95, school: 96, commerce: 92, development: 94, liquidity: 93 }
  },
  {
    id: 'gyeonggi-dongtan',
    name: '경기 화성 동탄신도시',
    province: '경기도',
    category: '비규제지역',
    avgPricePerPyeong: 2900,
    avgApartmentPrice: 9.5,
    jeonseRatio: 62.1,
    sentimentIndex: 102.3,
    priceChange1Yr: 4.9,
    tradeVolumeChange: 16.4,
    landRating: 'A',
    buildingRating: 'A',
    topIssues: ['GTX-A 동탄역 개통', '동탄 도시철도 트램 건설', '용인 삼성 반도체 메가클러스터'],
    propertyTypes: {
      apartment: { price: '9.5억', rentalYield: '3.4%', landRatio: '중상' },
      building: { price: '38억', rentalYield: '4.7%', capRate: '4.4%' },
      land: { price: '평당 3,100만', developmentPotential: '상' },
      villa: { price: '3.5억', rentalYield: '5.1%', moaTown: '해당없음' }
    },
    scores: { transport: 93, school: 91, commerce: 91, development: 96, liquidity: 91 }
  },
  {
    id: 'gyeonggi-pyeongtaek',
    name: '경기 평택 고덕국제신도시',
    province: '경기도',
    category: '비규제지역',
    avgPricePerPyeong: 1950,
    avgApartmentPrice: 6.4,
    jeonseRatio: 68.0,
    sentimentIndex: 96.5,
    priceChange1Yr: 2.8,
    tradeVolumeChange: 9.1,
    landRating: 'B+',
    buildingRating: 'A',
    topIssues: ['삼성전자 평택 캠퍼스 세계최대 반도체', '평택 지제역 GTX-A·C 연장', '브레인시티'],
    propertyTypes: {
      apartment: { price: '6.4억', rentalYield: '4.1%', landRatio: '중' },
      building: { price: '26억', rentalYield: '5.3%', capRate: '5.0%' },
      land: { price: '평당 2,100만', developmentPotential: '상' },
      villa: { price: '2.6억', rentalYield: '5.8%', moaTown: '해당없음' }
    },
    scores: { transport: 87, school: 86, commerce: 85, development: 95, liquidity: 86 }
  },
  {
    id: 'incheon-songdo',
    name: '인천 연수 송도국제도시',
    province: '인천광역시',
    category: '비규제지역',
    avgPricePerPyeong: 2500,
    avgApartmentPrice: 8.2,
    jeonseRatio: 61.5,
    sentimentIndex: 89.5,
    priceChange1Yr: 1.5,
    tradeVolumeChange: 3.1,
    landRating: 'A',
    buildingRating: 'B+',
    topIssues: ['GTX-B 노선 착공', '세계 최대 바이오 클러스터 조성', '송도 11공구 첨단산업단지'],
    propertyTypes: {
      apartment: { price: '8.2억', rentalYield: '3.6%', landRatio: '중' },
      building: { price: '35억', rentalYield: '5.1%', capRate: '4.8%' },
      land: { price: '평당 2,800만', developmentPotential: '상' },
      villa: { price: '2.5억', rentalYield: '5.5%', moaTown: '해당없음' }
    },
    scores: { transport: 85, school: 89, commerce: 86, development: 92, liquidity: 84 }
  },
  {
    id: 'chungnam-cheonan',
    name: '충남 천안 불당·아산 배방',
    province: '충청남도',
    category: '비규제지역',
    avgPricePerPyeong: 1750,
    avgApartmentPrice: 5.8,
    jeonseRatio: 71.2,
    sentimentIndex: 93.4,
    priceChange1Yr: 1.9,
    tradeVolumeChange: 6.8,
    landRating: 'B+',
    buildingRating: 'B+',
    topIssues: ['KTX 천안아산역 광역복합환승센터', '삼성디스플레이 아산캠퍼스', '천안 불당2지구'],
    propertyTypes: {
      apartment: { price: '5.8억', rentalYield: '4.2%', landRatio: '중' },
      building: { price: '22억', rentalYield: '5.5%', capRate: '5.2%' },
      land: { price: '평당 1,800만', developmentPotential: '중상' },
      villa: { price: '2.1억', rentalYield: '6.0%', moaTown: '해당없음' }
    },
    scores: { transport: 89, school: 91, commerce: 88, development: 88, liquidity: 85 }
  },
  {
    id: 'daejeon-yuseong',
    name: '대전 유성구 (도안·노은)',
    province: '대전광역시',
    category: '비규제지역',
    avgPricePerPyeong: 2100,
    avgApartmentPrice: 6.9,
    jeonseRatio: 66.8,
    sentimentIndex: 97.2,
    priceChange1Yr: 3.1,
    tradeVolumeChange: 8.5,
    landRating: 'A',
    buildingRating: 'A',
    topIssues: ['대덕연구개발특구 첨단 R&D', '유성 나노·반도체 국가산업단지', '도안신도시 2·3단계'],
    propertyTypes: {
      apartment: { price: '6.9억', rentalYield: '3.7%', landRatio: '중상' },
      building: { price: '30억', rentalYield: '5.0%', capRate: '4.7%' },
      land: { price: '평당 2,400만', developmentPotential: '상' },
      villa: { price: '2.7억', rentalYield: '5.4%', moaTown: '해당없음' }
    },
    scores: { transport: 88, school: 94, commerce: 89, development: 93, liquidity: 87 }
  },
  {
    id: 'sejong',
    name: '세종특별자치시',
    province: '세종특별자치시',
    category: '비규제지역',
    avgPricePerPyeong: 2200,
    avgApartmentPrice: 7.1,
    jeonseRatio: 52.1,
    sentimentIndex: 85.4,
    priceChange1Yr: -0.8,
    tradeVolumeChange: -2.4,
    landRating: 'B+',
    buildingRating: 'B',
    topIssues: ['국회의사당 세종의사당 건립', '대통령 제2집무실', '충청권 광역철도(CTX)'],
    propertyTypes: {
      apartment: { price: '7.1억', rentalYield: '3.2%', landRatio: '중' },
      building: { price: '28억', rentalYield: '4.5%', capRate: '4.1%' },
      land: { price: '평당 2,100만', developmentPotential: '상' },
      villa: { price: '2.2억', rentalYield: '5.0%', moaTown: '해당없음' }
    },
    scores: { transport: 80, school: 87, commerce: 78, development: 93, liquidity: 79 }
  },
  {
    id: 'gwangju-bongseon',
    name: '광주 남구 봉선동',
    province: '광주광역시',
    category: '비규제지역',
    avgPricePerPyeong: 2300,
    avgApartmentPrice: 7.5,
    jeonseRatio: 64.5,
    sentimentIndex: 91.8,
    priceChange1Yr: 2.3,
    tradeVolumeChange: 4.2,
    landRating: 'B+',
    buildingRating: 'B+',
    topIssues: ['광주의 강남 대표 명문 학군지', '도시철도 2호선 개통 수혜', '남구 봉선 재개발'],
    propertyTypes: {
      apartment: { price: '7.5억', rentalYield: '3.5%', landRatio: '중상' },
      building: { price: '27억', rentalYield: '4.8%', capRate: '4.5%' },
      land: { price: '평당 2,200만', developmentPotential: '중' },
      villa: { price: '2.4억', rentalYield: '5.3%', moaTown: '해당없음' }
    },
    scores: { transport: 84, school: 97, commerce: 87, development: 82, liquidity: 83 }
  },
  {
    id: 'busan-haeundae',
    name: '부산 해운대구 (우동·중동)',
    province: '부산광역시',
    category: '비규제지역',
    avgPricePerPyeong: 3400,
    avgApartmentPrice: 10.4,
    jeonseRatio: 55.8,
    sentimentIndex: 94.2,
    priceChange1Yr: 3.2,
    tradeVolumeChange: 7.1,
    landRating: 'A',
    buildingRating: 'A',
    topIssues: ['센텀2지구 도시첨단산업단지', '해운대 재건축 정비사업', '오시리아 관광단지'],
    propertyTypes: {
      apartment: { price: '10.4억', rentalYield: '3.1%', landRatio: '상' },
      building: { price: '48억', rentalYield: '4.6%', capRate: '4.3%' },
      land: { price: '평당 4,500만', developmentPotential: '상' },
      villa: { price: '3.8억', rentalYield: '4.9%', moaTown: '진행중' }
    },
    scores: { transport: 88, school: 92, commerce: 95, development: 89, liquidity: 88 }
  },
  {
    id: 'daegu-suseong',
    name: '대구 수성구 (범어·만촌)',
    province: '대구광역시',
    category: '비규제지역',
    avgPricePerPyeong: 2900,
    avgApartmentPrice: 8.9,
    jeonseRatio: 62.4,
    sentimentIndex: 81.3,
    priceChange1Yr: -1.2,
    tradeVolumeChange: -1.8,
    landRating: 'B+',
    buildingRating: 'B+',
    topIssues: ['범어동 명문 학권 탄탄한 실수요', '대구 수성알파시티 ABB 산업거점', '미분양 진정세'],
    propertyTypes: {
      apartment: { price: '8.9억', rentalYield: '3.4%', landRatio: '중상' },
      building: { price: '38억', rentalYield: '4.9%', capRate: '4.6%' },
      land: { price: '평당 3,500만', developmentPotential: '중' },
      villa: { price: '3.0억', rentalYield: '5.3%', moaTown: '검토' }
    },
    scores: { transport: 86, school: 98, commerce: 89, development: 82, liquidity: 82 }
  },
  {
    id: 'ulsan-namgu',
    name: '울산 남구 (옥동·신정)',
    province: '울산광역시',
    category: '비규제지역',
    avgPricePerPyeong: 2050,
    avgApartmentPrice: 6.5,
    jeonseRatio: 67.2,
    sentimentIndex: 90.1,
    priceChange1Yr: 1.8,
    tradeVolumeChange: 5.3,
    landRating: 'B+',
    buildingRating: 'B+',
    topIssues: ['현대자동차 전기차 신공장 투자', '울산 도시철도 트램 1호선', '석유화학 대형 투자'],
    propertyTypes: {
      apartment: { price: '6.5억', rentalYield: '3.9%', landRatio: '중' },
      building: { price: '25억', rentalYield: '5.2%', capRate: '4.9%' },
      land: { price: '평당 2,000만', developmentPotential: '중' },
      villa: { price: '2.3억', rentalYield: '5.6%', moaTown: '해당없음' }
    },
    scores: { transport: 83, school: 90, commerce: 86, development: 87, liquidity: 82 }
  },
  {
    id: 'gyeongnam-changwon',
    name: '경남 창원 성산구',
    province: '경상남도',
    category: '비규제지역',
    avgPricePerPyeong: 1600,
    avgApartmentPrice: 5.2,
    jeonseRatio: 73.1,
    sentimentIndex: 88.5,
    priceChange1Yr: 0.9,
    tradeVolumeChange: 3.4,
    landRating: 'B',
    buildingRating: 'B+',
    topIssues: ['창원 국가산업단지 방산·원전 특수', '성산구 가음동 재건축', 'SMR 방산 클러스터'],
    propertyTypes: {
      apartment: { price: '5.2억', rentalYield: '4.5%', landRatio: '중' },
      building: { price: '20억', rentalYield: '5.7%', capRate: '5.4%' },
      land: { price: '평당 1,600만', developmentPotential: '중' },
      villa: { price: '1.9억', rentalYield: '6.2%', moaTown: '해당없음' }
    },
    scores: { transport: 82, school: 86, commerce: 85, development: 84, liquidity: 80 }
  },
  {
    id: 'jeonbuk-jeonju',
    name: '전북 전주 완산구 (효자·혁신)',
    province: '전라북도',
    category: '비규제지역',
    avgPricePerPyeong: 1450,
    avgApartmentPrice: 4.8,
    jeonseRatio: 74.8,
    sentimentIndex: 89.2,
    priceChange1Yr: 1.1,
    tradeVolumeChange: 4.0,
    landRating: 'B',
    buildingRating: 'B',
    topIssues: ['국민연금공단 기금운용본부 금융도시', '전북혁신도시 배후수요', '효자동 재개발'],
    propertyTypes: {
      apartment: { price: '4.8억', rentalYield: '4.6%', landRatio: '중' },
      building: { price: '18억', rentalYield: '5.8%', capRate: '5.5%' },
      land: { price: '평당 1,400만', developmentPotential: '중' },
      villa: { price: '1.7억', rentalYield: '6.4%', moaTown: '해당없음' }
    },
    scores: { transport: 80, school: 85, commerce: 83, development: 82, liquidity: 78 }
  },
  {
    id: 'gangwon-wonju',
    name: '강원 원주 무실·혁신도시',
    province: '강원특별자치도',
    category: '비규제지역',
    avgPricePerPyeong: 1300,
    avgApartmentPrice: 4.1,
    jeonseRatio: 76.2,
    sentimentIndex: 91.0,
    priceChange1Yr: 2.1,
    tradeVolumeChange: 5.9,
    landRating: 'B',
    buildingRating: 'B',
    topIssues: ['KTX 원주역 및 여주-원주 복선전철', '국민건강보험공단 혁신도시', '반도체 테스트베드'],
    propertyTypes: {
      apartment: { price: '4.1억', rentalYield: '4.8%', landRatio: '중' },
      building: { price: '16억', rentalYield: '6.0%', capRate: '5.7%' },
      land: { price: '평당 1,200만', developmentPotential: '중상' },
      villa: { price: '1.5억', rentalYield: '6.6%', moaTown: '해당없음' }
    },
    scores: { transport: 85, school: 83, commerce: 82, development: 86, liquidity: 80 }
  }
];

// 실시간 부동산 뉴스
const realTimeNews = [
  {
    id: 1,
    title: "경기 파주 운정신도시 GTX-A 역세권 아파트 실거래가 신고가 갱신… 수도권 북부 핵심 부상",
    time: "2026-07-24 21:50",
    tag: "GTX/교통",
    summary: "운정역 역세권 아파트 매수세가 확산되며 평당가 2,200만 원 선을 돌파했습니다."
  },
  {
    id: 2,
    title: "한국은행 기준금리 2.75% 동결… 부동산 시장 지역별 차별화 심화",
    time: "2026-07-24 18:30",
    tag: "금융/금리",
    summary: "금리 인하 기조 속에 수도권 주요 상급지와 지방 간의 매매가 양극화 현상이 지속되고 있습니다."
  },
  {
    id: 3,
    title: "1기 신도시 선도지구 재건축 용적률 최대 500% 부여… 분당·일산 기대감",
    time: "2026-07-24 16:45",
    tag: "재건축/정비",
    summary: "정부가 노후계획도시 정비사업 추진을 가속화함에 따라 선도지구 대지지분 가치가 신장됩니다."
  },
  {
    id: 4,
    title: "스트레스 DSR 3단계 적용… 차주별 대출 한도 5~10% 추가 감축",
    time: "2026-07-24 14:10",
    tag: "대출규제",
    summary: "금융위원회가 DSR 40% 산정 시 미래 금리 변동 가산금리를 반영하여 대출 한도를 관리합니다."
  }
];

// Global Streaming State Variables
const ESTATE_REFRESH_MS = 60 * 60 * 1000; // 1시간 갱신
let barChart = null;
let radarChart = null;
let autoLiveInterval = null;
let isStreamingActive = true;
let estateLiveBooted = false;
let inputFormattersBound = false;
let tickerNewsIdx = 0;
const liveHeadlines = [];

function destroyEstateCharts() {
  if (barChart) {
    barChart.destroy();
    barChart = null;
  }
  if (radarChart) {
    radarChart.destroy();
    radarChart = null;
  }
}

function bootEstateLive(force) {
  if (!document.getElementById('estate-live-app')) return;
  if (estateLiveBooted && !force) return;

  if (force) {
    destroyEstateCharts();
    if (autoLiveInterval) {
      clearInterval(autoLiveInterval);
      autoLiveInterval = null;
    }
    estateLiveBooted = false;
    liveHeadlines.length = 0;
    tickerNewsIdx = 0;
  }

  estateLiveBooted = true;

  renderRegionGrid(regionalData);
  renderAlignedTable(regionalData);
  populateRegionDropdowns(regionalData);
  renderNewsTickerShell();
  renderNewsFeedShell();
  initLiveDisplay();
  setupInputFormatters();
  renderInvestmentAnalysis();
  calculateROI();
  calculateLoanLimit();
  startAutoStreaming();

  if (typeof Chart !== 'undefined') {
    renderRegionalChart(regionalData);
  } else {
    const waitChart = () => {
      if (typeof Chart === 'undefined') {
        setTimeout(waitChart, 50);
        return;
      }
      renderRegionalChart(getCurrentlyFilteredData());
    };
    waitChart();
  }
}

window.bootEstateLive = bootEstateLive;

function scheduleEstateLiveBoot(force) {
  const run = () => bootEstateLive(!!force);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}

scheduleEstateLiveBoot(false);
window.addEventListener('pageshow', () => scheduleEstateLiveBoot(true));
window.addEventListener('load', () => {
  if (!estateLiveBooted) scheduleEstateLiveBoot(false);
});

document.addEventListener('ft:langchange', () => {
  if (!document.getElementById('estate-live-app')) return;
  bootEstateLive(true);
});

// Global handlers for inline onclick in real-estate.html
window.scrollToSection = scrollToSection;
window.filterRegions = filterRegions;
window.renderInvestmentAnalysis = renderInvestmentAnalysis;
window.calculateROI = calculateROI;
window.calculateLoanLimit = calculateLoanLimit;
window.toggleAutoStreaming = toggleAutoStreaming;
window.selectRegionForAnalysis = selectRegionForAnalysis;

// Real-Time Streaming Engine Logic
function startAutoStreaming() {
  if (autoLiveInterval) clearInterval(autoLiveInterval);
  autoLiveInterval = setInterval(() => {
    if (isStreamingActive) {
      triggerLiveTick();
    }
  }, ESTATE_REFRESH_MS);
}

function toggleAutoStreaming() {
  isStreamingActive = !isStreamingActive;
  const badge = document.getElementById('liveStatusBadge');
  const btn = document.getElementById('toggleLiveStreamBtn');

  if (isStreamingActive) {
    if (badge) {
      badge.innerHTML = `
        <span class="pulse-dot"></span>
        <span class="badge-text-live">DEMO</span>
        <span class="badge-divider">|</span>
        <span class="badge-text-timer"><i class="fa-solid fa-arrows-rotate fa-spin-slow"></i> ${eTr('refresh1h')}</span>
      `;
    }
    if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  } else {
    if (badge) {
      badge.innerHTML = `
        <span class="pulse-dot" style="background:#ef4444;box-shadow:none;"></span>
        <span class="badge-text-live" style="color:#f87171;">PAUSED</span>
        <span class="badge-divider">|</span>
        <span class="badge-text-timer" style="color:#94a3b8;">${eTr('paused')}</span>
      `;
    }
    if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
}

// Perform Live Market Transaction Tick
function triggerLiveTick() {
  const randIndex = Math.floor(Math.random() * regionalData.length);
  const region = regionalData[randIndex];

  const deltaPrice = (Math.random() > 0.4 ? 1 : -1) * Math.floor(Math.random() * 3 + 1) * 10;
  region.avgPricePerPyeong = Math.max(1000, region.avgPricePerPyeong + deltaPrice);

  const deltaJeonse = (Math.random() > 0.5 ? 0.1 : -0.1);
  region.jeonseRatio = parseFloat(Math.min(85, Math.max(40, region.jeonseRatio + deltaJeonse)).toFixed(1));

  const propertyTypes = ['아파트 84㎡', '상가/꼬마빌딩', '토지 대지지분', '다가구 주택'];
  const pType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
  const isGain = deltaPrice >= 0;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  const dateStr = formatNewsDate();

  const toastText = `[예시] ${region.name} ${pType} 평당가 시뮬레이션 변동 (${region.avgPricePerPyeong.toLocaleString()}만, ${isGain ? '+' : ''}${deltaPrice}만)`;

  const toastEl = document.getElementById('liveToastText');
  const timeEl = document.getElementById('liveToastTime');
  if (toastEl) toastEl.textContent = toastText;
  if (timeEl) timeEl.textContent = eTr('justNow');

  const headline = `[시뮬레이션] ${region.name} ${pType} 평당 ${region.avgPricePerPyeong.toLocaleString()}만 (${isGain ? '+' : ''}${deltaPrice}만)`;
  liveHeadlines.unshift(headline);
  if (liveHeadlines.length > 6) liveHeadlines.pop();
  tickerNewsIdx = (tickerNewsIdx + 1) % realTimeNews.length;
  updateNewsTickerLine(headline);
  updateNewsFeedLine(headline, `${dateStr} ${timeStr}`, eTr('liveDeal'));
  patchRegionInDom(region);
}

function formatNewsDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function patchRegionInDom(region) {
  const card = document.querySelector(`.region-card[data-region-id="${region.id}"]`);
  if (card) {
    const rows = card.querySelectorAll('.region-stats-row');
    if (rows[0]) {
      const strong = rows[0].querySelector('strong');
      if (strong) strong.textContent = `${region.avgPricePerPyeong.toLocaleString()} 만원`;
    }
    if (rows[1]) {
      const isUp = region.priceChange1Yr >= 0;
      const strong = rows[1].querySelector('strong');
      if (strong) {
        strong.className = isUp ? 'text-green' : 'text-red';
        strong.textContent = `${region.jeonseRatio}% (${isUp ? '+' : ''}${region.priceChange1Yr}%)`;
      }
    }
  }

  const row = document.querySelector(`.sg-row[data-region-id="${region.id}"]`);
  if (row) {
    const cells = row.querySelectorAll('.sg-cell');
    if (cells[1]) cells[1].textContent = `${region.avgPricePerPyeong.toLocaleString()}만`;
    if (cells[3]) cells[3].textContent = `${region.jeonseRatio}%`;
  }

  if (barChart) {
    renderRegionalChart(getCurrentlyFilteredData());
  }
}

function loadAllData() {
  triggerLiveTick();
}

// Smooth Anchor Scroll Navigation for Continuous Vertical Stream
function scrollToSection(secId) {
  const el = document.getElementById(secId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });

    document.querySelectorAll('.anchor-btn').forEach(btn => btn.classList.remove('active'));
    const clickedBtn = Array.from(document.querySelectorAll('.anchor-btn')).find(b => b.getAttribute('onclick').includes(secId));
    if (clickedBtn) clickedBtn.classList.add('active');
  }
}

// Get Filtered Regional Data
function getCurrentlyFilteredData() {
  const prov = document.getElementById('provinceFilter')?.value || 'all';
  const cat = document.getElementById('categoryFilter')?.value || 'all';

  return regionalData.filter(r => {
    let matchProv = (prov === 'all');
    if (!matchProv) {
      if (prov === '충청권') matchProv = ['세종특별자치시', '충청남도', '충청북도', '대전광역시'].includes(r.province);
      else if (prov === '경상권') matchProv = ['부산광역시', '대구광역시', '울산광역시', '경상남도', '경상북도'].includes(r.province);
      else if (prov === '전라권') matchProv = ['광주광역시', '전라북도', '전라남도'].includes(r.province);
      else if (prov === '강원권') matchProv = ['강원특별자치도'].includes(r.province);
      else matchProv = (r.province === prov);
    }
    const matchCat = (cat === 'all') || (r.category.includes(cat));
    return matchProv && matchCat;
  });
}

function filterRegions() {
  const filtered = getCurrentlyFilteredData();
  renderRegionGrid(filtered);
  renderAlignedTable(filtered);
  renderRegionalChart(filtered);
}

// 1. Regional Grid
function renderRegionGrid(regions) {
  const container = document.getElementById('regionGrid');
  if (!container) return;
  container.innerHTML = '';

  regions.forEach(r => {
    const isUp = r.priceChange1Yr >= 0;
    const badgeClass = r.category.includes('투기') ? 'regulated' : (r.category.includes('조정') ? 'adjustment' : 'normal');

    const cardHtml = `
      <div class="region-card" data-region-id="${r.id}" onclick="selectRegionForAnalysis('${r.id}')">
        <div class="region-card-header">
          <div class="region-name">${eRegion(r.name)}</div>
          <span class="tag-badge ${badgeClass}">${eCat(r.category)}</span>
        </div>
        <div class="region-stats-row">
          <span>${eTr('pricePerPyeong')}</span>
          <strong>${r.avgPricePerPyeong.toLocaleString()} ${eTr('manwon')}</strong>
        </div>
        <div class="region-stats-row">
          <span>${eTr('jeonseChange')}</span>
          <strong class="${isUp ? 'text-green' : 'text-red'}">${r.jeonseRatio}% (${isUp ? '+' : ''}${r.priceChange1Yr}%)</strong>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', cardHtml);
  });
}

// 2. STRICT PURE CSS GRID MATRIX TABLE (100% PERFECT COLUMN ALIGNMENT)
function renderAlignedTable(regions) {
  const container = document.getElementById('alignedGridTableBody');
  if (!container) return;
  container.innerHTML = '';

  regions.forEach(r => {
    const isUp = r.priceChange1Yr >= 0;
    const badgeClass = r.category.includes('투기') ? 'regulated' : (r.category.includes('조정') ? 'adjustment' : 'normal');

    const rowDiv = document.createElement('div');
    rowDiv.className = 'sg-row';
    rowDiv.dataset.regionId = r.id;
    rowDiv.onclick = () => selectRegionForAnalysis(r.id);
    rowDiv.style.cursor = 'pointer';

    rowDiv.innerHTML = `
      <div class="sg-cell col-region">${eRegion(r.name)}</div>
      <div class="sg-cell col-pyeong">${r.avgPricePerPyeong.toLocaleString()}${eIsEn() ? 'k' : '만'}</div>
      <div class="sg-cell col-avg">${r.avgApartmentPrice}${eIsEn() ? '00M' : '억'}</div>
      <div class="sg-cell col-jeonse">${r.jeonseRatio}%</div>
      <div class="sg-cell col-change ${isUp ? 'text-green' : 'text-red'}">${isUp ? '+' : ''}${r.priceChange1Yr}%</div>
      <div class="sg-cell col-rating"><span class="tag-badge ${badgeClass}">${r.landRating}</span></div>
    `;
    container.appendChild(rowDiv);
  });
}

function renderRegionalChart(regions) {
  const canvas = document.getElementById('regionalChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const displayRegions = regions.slice(0, 10); // Top 10 for clean chart space
  const labels = displayRegions.map(r => r.name.replace('서울 ', '').replace('경기 ', '').replace('충남 ', '').replace('대전 ', ''));
  const priceData = displayRegions.map(r => r.avgPricePerPyeong);
  const jeonseData = displayRegions.map(r => r.jeonseRatio);

  if (barChart) {
    barChart.data.labels = labels;
    barChart.data.datasets[0].data = priceData;
    barChart.data.datasets[1].data = jeonseData;
    barChart.update('none');
    return;
  }

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: eTr('chartPrice'),
          data: priceData,
          backgroundColor: 'rgba(59, 130, 246, 0.75)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: eTr('chartJeonse'),
          data: jeonseData,
          type: 'line',
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 2,
          pointRadius: 3,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { size: 10 } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: { color: '#94a3b8', font: { size: 10 } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          ticks: { color: '#10b981', font: { size: 10 } },
          grid: { drawOnChartArea: false }
        }
      },
      plugins: {
        legend: { labels: { color: '#f1f5f9', font: { size: 10 } } }
      }
    }
  });
}

// 3. Investment Radar
function populateRegionDropdowns(regions) {
  const select = document.getElementById('investRegionSelect');
  if (!select) return;
  select.innerHTML = '';
  regions.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${eRegion(r.name)} (${eCat(r.category)})`;
    select.appendChild(opt);
  });
  renderInvestmentAnalysis();
}

function selectRegionForAnalysis(regionId) {
  const select = document.getElementById('investRegionSelect');
  if (select) select.value = regionId;
  scrollToSection('sec-investment');
  renderInvestmentAnalysis();
}

function renderInvestmentAnalysis() {
  const select = document.getElementById('investRegionSelect');
  if (!select) return;
  const regionId = select.value;
  const region = regionalData.find(r => r.id === regionId);
  if (!region) return;

  document.getElementById('overallRatingGrade').textContent = region.landRating;
  document.getElementById('landGrade').textContent = region.landRating;
  document.getElementById('buildingGrade').textContent = region.buildingRating;
  document.getElementById('expectedPriceAppreciation').textContent = `${region.priceChange1Yr >= 0 ? '+' : ''}${region.priceChange1Yr}%`;

  const issuesUl = document.getElementById('investmentIssuesList');
  if (issuesUl) {
    issuesUl.innerHTML = '';
    region.topIssues.forEach(issue => {
      const li = document.createElement('li');
      li.textContent = eText(issue);
      issuesUl.appendChild(li);
    });
  }

  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const scores = region.scores;
  if (radarChart) {
    radarChart.data.datasets[0].label = `${region.name} 평가`;
    radarChart.data.datasets[0].data = [scores.transport, scores.school, scores.commerce, scores.development, scores.liquidity];
    radarChart.update('none');
    return;
  }

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['교통', '학권', '상권', '개발', '환금성'],
      datasets: [{
        label: `${region.name} 평가`,
        data: [scores.transport, scores.school, scores.commerce, scores.development, scores.liquidity],
        backgroundColor: 'rgba(139, 92, 246, 0.25)',
        borderColor: '#8b5cf6',
        pointBackgroundColor: '#8b5cf6'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: { color: '#f1f5f9', font: { size: 10 } },
          ticks: { backdropColor: 'transparent', color: '#94a3b8', suggestMin: 60, suggestMax: 100 }
        }
      },
      plugins: {
        legend: { labels: { color: '#f1f5f9', font: { size: 10 } } }
      }
    }
  });
}

// 4. Rental ROI Calculator Engine
function calculateROI() {
  const propertyType = document.getElementById('roiPropType')?.value || 'apartment';
  const houseCount = Number(document.getElementById('roiHouseCount')?.value || 1);
  const price = Number(document.getElementById('roiPrice')?.value || 1000000000);
  const dep = Number(document.getElementById('roiDeposit')?.value || 200000000);
  const rent = Number(document.getElementById('roiMonthlyRent')?.value || 3000000);
  const loan = Number(document.getElementById('roiLoan')?.value || 400000000);
  const rate = Number(document.getElementById('roiInterestRate')?.value || 4.2);
  const maint = Number(document.getElementById('roiMaintenance')?.value || 200000);

  let acqTaxRate = 0.046;
  if (propertyType === 'apartment' || propertyType === 'villa') {
    if (houseCount === 1) {
      if (price <= 600000000) acqTaxRate = 0.011;
      else if (price <= 900000000) acqTaxRate = (price * 2 / 300000000 - 3) / 100 * 1.1;
      else acqTaxRate = 0.035;
    } else if (houseCount === 2) {
      acqTaxRate = 0.011;
    } else {
      acqTaxRate = 0.090;
    }
  }

  const acquisitionTax = Math.round(price * acqTaxRate);
  let brokerFeeRate = 0.005;
  if (price >= 1500000000) brokerFeeRate = 0.007;
  else if (price >= 900000000) brokerFeeRate = 0.005;
  else if (price >= 600000000) brokerFeeRate = 0.004;

  const brokerageFee = Math.round(price * brokerFeeRate);
  const registrationFee = Math.round(price * 0.002);
  const totalIncidentalCosts = acquisitionTax + brokerageFee + registrationFee;
  const totalRequiredInvestmentPrice = price + totalIncidentalCosts;
  const netEquity = Math.max(0, totalRequiredInvestmentPrice - dep - loan);

  const annualRentIncome = rent * 12;
  const annualInterestExpense = Math.round(loan * (rate / 100));
  const annualMaintenanceCost = maint * 12;

  const grossYield = price > 0 ? (annualRentIncome / price) * 100 : 0;
  const capRate = totalRequiredInvestmentPrice > 0 ? ((annualRentIncome - annualMaintenanceCost) / totalRequiredInvestmentPrice) * 100 : 0;
  const annualNetCashFlow = annualRentIncome - annualMaintenanceCost - annualInterestExpense;
  const monthlyNetCashFlow = Math.round(annualNetCashFlow / 12);
  const cashOnCashROI = netEquity > 0 ? (annualNetCashFlow / netEquity) * 100 : 0;

  const grossEl = document.getElementById('resGrossYield');
  if (grossEl) grossEl.textContent = `${grossYield.toFixed(2)}%`;
  const capEl = document.getElementById('resCapRate');
  if (capEl) capEl.textContent = `${capRate.toFixed(2)}%`;
  const cocEl = document.getElementById('resCashOnCash');
  if (cocEl) cocEl.textContent = `${cashOnCashROI.toFixed(2)}%`;

  const priceEl = document.getElementById('resPrice');
  if (priceEl) priceEl.textContent = formatKoreanMoney(price);
  const taxEl = document.getElementById('resAcqTax');
  if (taxEl) taxEl.textContent = formatKoreanMoney(acquisitionTax);
  const brokerEl = document.getElementById('resBrokerage');
  if (brokerEl) brokerEl.textContent = formatKoreanMoney(brokerageFee + registrationFee);
  const eqEl = document.getElementById('resNetEquity');
  if (eqEl) eqEl.textContent = formatKoreanMoney(netEquity);

  const mRentEl = document.getElementById('resMonthlyRentIncome');
  if (mRentEl) mRentEl.textContent = `+ ${formatKoreanMoney(rent)}`;
  const mIntEl = document.getElementById('resMonthlyInterest');
  if (mIntEl) mIntEl.textContent = `- ${formatKoreanMoney(Math.round(annualInterestExpense / 12))}`;
  const mNetEl = document.getElementById('resMonthlyNetCash');
  if (mNetEl) mNetEl.textContent = `${monthlyNetCashFlow >= 0 ? '+' : ''} ${formatKoreanMoney(monthlyNetCashFlow)}`;
}

// 5. Loan Limit & DSR Simulator Engine
function calculateLoanLimit() {
  const val = Number(document.getElementById('loanPropValue')?.value || 1000000000);
  const income = Number(document.getElementById('loanAnnualIncome')?.value || 80000000);
  const existingDebt = Number(document.getElementById('loanExistingDebt')?.value || 0);
  const regionCategory = document.getElementById('loanRegionCategory')?.value || 'non_regulated';
  const repaymentMethod = document.getElementById('loanRepaymentMethod')?.value || 'equal_principal_interest';
  const rate = Number(document.getElementById('loanRate')?.value || 4.2) / 100;
  const years = Number(document.getElementById('loanPeriod')?.value || 30);
  const months = years * 12;

  let maxLtvRatio = 0.70;
  if (regionCategory === 'regulated') maxLtvRatio = 0.50;
  else if (regionCategory === 'adjustment') maxLtvRatio = 0.60;
  else if (regionCategory === 'first_buyer') maxLtvRatio = 0.80;

  let maxLoanByLtv = Math.round(val * maxLtvRatio);
  if (regionCategory === 'first_buyer' && maxLoanByLtv > 600000000) {
    maxLoanByLtv = 600000000;
  }

  const maxAllowableAnnualRepaymentDsr = Math.max(0, (income * 0.40) - existingDebt);
  const monthlyRate = rate / 12;
  let maxLoanByDsr = 0;
  if (monthlyRate > 0 && maxAllowableAnnualRepaymentDsr > 0) {
    const maxMonthlyPayment = maxAllowableAnnualRepaymentDsr / 12;
    maxLoanByDsr = Math.round(maxMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate));
  }

  const finalMaxLoanLimit = Math.min(maxLoanByLtv, maxLoanByDsr);

  let monthlyRepaymentFirstMonth = 0;
  let totalInterestOverTerm = 0;

  if (repaymentMethod === 'equal_principal_interest') {
    const pmt = finalMaxLoanLimit * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    monthlyRepaymentFirstMonth = Math.round(pmt || 0);
    totalInterestOverTerm = Math.round((pmt * months) - finalMaxLoanLimit);
  } else if (repaymentMethod === 'equal_principal') {
    const monthlyPrincipal = finalMaxLoanLimit / months;
    const firstMonthInterest = finalMaxLoanLimit * monthlyRate;
    monthlyRepaymentFirstMonth = Math.round(monthlyPrincipal + firstMonthInterest);
    totalInterestOverTerm = Math.round(((finalMaxLoanLimit * rate * (months + 1)) / 24));
  } else {
    monthlyRepaymentFirstMonth = Math.round(finalMaxLoanLimit * monthlyRate);
    totalInterestOverTerm = Math.round(finalMaxLoanLimit * rate * years);
  }

  const calculatedAnnualRepayment = (monthlyRepaymentFirstMonth * 12);
  const actualDsrPercent = income > 0 ? (((calculatedAnnualRepayment + existingDebt) / income) * 100) : 0;

  const finalEl = document.getElementById('resFinalLoanLimit');
  if (finalEl) finalEl.textContent = formatKoreanMoney(finalMaxLoanLimit);
  const ltvEl = document.getElementById('resLtvLimit');
  if (ltvEl) ltvEl.textContent = formatKoreanMoney(maxLoanByLtv);
  const dsrEl = document.getElementById('resDsrLimit');
  if (dsrEl) dsrEl.textContent = formatKoreanMoney(maxLoanByDsr);

  const warningBanner = document.getElementById('dsrWarningBanner');
  if (warningBanner) {
    if (actualDsrPercent > 40.0) warningBanner.classList.remove('hidden');
    else warningBanner.classList.add('hidden');
  }

  const pmtEl = document.getElementById('resFirstMonthPayment');
  if (pmtEl) pmtEl.textContent = `${formatKoreanMoney(monthlyRepaymentFirstMonth)} /월`;
  const totIntEl = document.getElementById('resTotalInterest');
  if (totIntEl) totIntEl.textContent = formatKoreanMoney(totalInterestOverTerm);
  const dsrPctEl = document.getElementById('resActualDsrPercent');
  if (dsrPctEl) dsrPctEl.textContent = `${actualDsrPercent.toFixed(2)} %`;
}

// News Ticker & Feed — 한 줄 표시, DOM 재생성 없이 텍스트만 갱신
function getCurrentNewsLine() {
  if (liveHeadlines.length) return liveHeadlines[0];
  const n = realTimeNews[tickerNewsIdx] || realTimeNews[0];
  return n ? `[${n.tag}] ${n.title}` : '부동산 시장 속보를 불러오는 중...';
}

function initLiveDisplay() {
  const n = realTimeNews[0];
  if (n) {
    updateNewsTickerLine(`[${n.tag}] ${n.title}`);
    updateNewsFeedLine(n.title, n.time, n.tag);
  } else {
    updateNewsTickerLine('부동산 이슈 요약 불러오는 중...');
  }
}

function renderNewsTickerShell() {
  const ticker = document.getElementById('newsTicker');
  if (!ticker || ticker.querySelector('#newsTickerText')) return;
  ticker.innerHTML = `<p class="ticker-single-line" id="newsTickerText">${eTr('loadingData')}</p>`;
}

function updateNewsTickerLine(text) {
  renderNewsTickerShell();
  const el = document.getElementById('newsTickerText');
  if (el) el.textContent = text;
}

function renderNewsFeedShell() {
  const container = document.getElementById('newsFeedList');
  if (!container || container.querySelector('#newsFeedText')) return;
  container.className = 'news-feed-single';
  container.innerHTML = `
    <span class="news-feed-tag" id="newsFeedTag">이슈</span>
    <p class="news-feed-line" id="newsFeedText">이슈 요약 불러오는 중...</p>
    <time class="news-feed-time" id="newsFeedTime"></time>`;
}

function updateNewsFeedLine(text, timeLabel, tag) {
  renderNewsFeedShell();
  const textEl = document.getElementById('newsFeedText');
  const timeEl = document.getElementById('newsFeedTime');
  const tagEl = document.getElementById('newsFeedTag');
  if (textEl) textEl.textContent = text;
  if (timeEl) timeEl.textContent = timeLabel || '';
  if (tagEl && tag) tagEl.textContent = tag;
}

function renderNewsFeed(news) {
  renderNewsFeedShell();
  const item = news[0];
  if (item) updateNewsFeedLine(item.title, item.time, item.tag);
}

// Input Helpers
function setupInputFormatters() {
  if (inputFormattersBound) return;
  inputFormattersBound = true;
  const inputs = [
    { id: 'roiPrice', hintId: 'roiPriceHint' },
    { id: 'roiDeposit', hintId: 'roiDepositHint' },
    { id: 'roiMonthlyRent', hintId: 'roiRentHint' },
    { id: 'roiLoan', hintId: 'roiLoanHint' },
    { id: 'loanPropValue', hintId: 'loanPropValueHint' },
    { id: 'loanAnnualIncome', hintId: 'loanIncomeHint' },
    { id: 'loanExistingDebt', hintId: 'loanDebtHint' }
  ];

  inputs.forEach(item => {
    const el = document.getElementById(item.id);
    const hint = document.getElementById(item.hintId);
    if (el && hint) {
      const updateHint = () => { hint.textContent = formatKoreanMoney(Number(el.value)); };
      el.addEventListener('input', updateHint);
      updateHint();
    }
  });
}

function formatKoreanMoney(num) {
  if (isNaN(num) || num === 0) return eIsEn() ? '₩0' : '0 원';
  if (eIsEn()) {
    if (num >= 100000000) return `₩${(num / 100000000).toFixed(1)}B`;
    if (num >= 10000) return `₩${Math.round(num / 10000).toLocaleString()}M`;
    return `₩${num.toLocaleString()}`;
  }
  const eok = Math.floor(num / 100000000);
  const man = Math.floor((num % 100000000) / 10000);

  let result = '';
  if (eok > 0) result += `${eok}억 `;
  if (man > 0) result += `${man.toLocaleString()}만 `;
  if (result === '') result = `${num.toLocaleString()} `;
  result += '원';
  return result;
}
