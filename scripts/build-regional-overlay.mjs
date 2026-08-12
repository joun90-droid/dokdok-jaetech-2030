// estate-transactions-full.json(빌드 캐시, 전체 거래 원자료)에서 regionalData(estate-live.js)의
// 18개 대표 지역에 해당하는 실제 평균 평당가·전월 대비 증감을 계산해
// public/data/estate-overlay-live.json 으로 저장.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");
const CACHE_DIR = join(__dirname, ".cache");

const transactions = JSON.parse(readFileSync(join(CACHE_DIR, "estate-transactions-full.json"), "utf8"));
const regionsMeta = JSON.parse(readFileSync(join(DATA_DIR, "estate-regions-live.json"), "utf8"));
const [prevYmd, thisYmd] = regionsMeta.dealYmdRange;

// id -> { sido, sigungu(s), umdIncludes? }
// umdIncludes가 없으면 estate-regions-live.json의 시군구 집계값을 그대로 사용(표본이 더 큼).
const MAPPING = [
  { id: "gyeonggi-paju", sido: "경기", sigungu: ["파주시"], umdIncludes: "운정" },
  { id: "seoul-gangnam", sido: "서울", sigungu: ["강남구"] },
  { id: "seoul-yongsan", sido: "서울", sigungu: ["용산구"] },
  { id: "seoul-seongdong", sido: "서울", sigungu: ["성동구"] },
  { id: "gyeonggi-bundang", sido: "경기", sigungu: ["성남시분당구"] },
  { id: "gyeonggi-dongtan", sido: "경기", sigungu: ["화성시"], umdIncludes: "동탄" },
  { id: "gyeonggi-pyeongtaek", sido: "경기", sigungu: ["평택시"] },
  { id: "incheon-songdo", sido: "인천", sigungu: ["연수구"], umdIncludes: "송도" },
  { id: "chungnam-cheonan", sido: "충남", sigungu: ["천안시동남구", "천안시서북구"] },
  { id: "daejeon-yuseong", sido: "대전", sigungu: ["유성구"] },
  { id: "sejong", sido: "세종", sigungu: ["세종시"] },
  { id: "gwangju-bongseon", sido: "광주", sigungu: ["남구"], umdIncludes: "봉선" },
  { id: "busan-haeundae", sido: "부산", sigungu: ["해운대구"] },
  { id: "daegu-suseong", sido: "대구", sigungu: ["수성구"] },
  { id: "ulsan-namgu", sido: "울산", sigungu: ["남구"] },
  { id: "gyeongnam-changwon", sido: "경남", sigungu: ["창원시성산구"] },
  { id: "jeonbuk-jeonju", sido: "전북", sigungu: ["전주시완산구"] },
  { id: "gangwon-wonju", sido: "강원", sigungu: ["원주시"] },
];

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function fromRegionAggregate(m) {
  // sigungu가 여러 개면(천안 등) 두 구를 합쳐서 계산
  const matches = regionsMeta.regions.filter((r) => r.sido === m.sido && m.sigungu.includes(r.name));
  const withCount = matches.filter((r) => r.count > 0);
  if (withCount.length === 0) return { avgPricePerPyeong: null, count: 0, priceChangeMoM: null };
  const totalCount = withCount.reduce((a, r) => a + r.count, 0);
  const avg = Math.round(withCount.reduce((a, r) => a + r.avgPricePerPyeong * r.count, 0) / totalCount);
  const changes = withCount.filter((r) => r.changePct != null).map((r) => r.changePct);
  const changePct = changes.length ? Number(mean(changes).toFixed(2)) : null;
  return { avgPricePerPyeong: avg, count: totalCount, priceChangeMoM: changePct };
}

function fromTransactionFilter(m) {
  const rows = transactions.filter(
    (t) => t.sido === m.sido && m.sigungu.includes(t.sigungu) && t.umdNm.includes(m.umdIncludes)
  );
  const cur = rows.filter((t) => t.dealYmd === thisYmd).map((t) => t.pricePerPyeong);
  const prev = rows.filter((t) => t.dealYmd === prevYmd).map((t) => t.pricePerPyeong);
  const all = [...cur, ...prev];
  if (all.length === 0) return { avgPricePerPyeong: null, count: 0, priceChangeMoM: null };
  let priceChangeMoM = null;
  if (cur.length > 0 && prev.length > 0) {
    priceChangeMoM = Number((((mean(cur) - mean(prev)) / mean(prev)) * 100).toFixed(2));
  }
  return { avgPricePerPyeong: Math.round(mean(all)), count: all.length, priceChangeMoM };
}

const overlay = {};
for (const m of MAPPING) {
  overlay[m.id] = m.umdIncludes ? fromTransactionFilter(m) : fromRegionAggregate(m);
}

writeFileSync(
  join(DATA_DIR, "estate-overlay-live.json"),
  JSON.stringify(
    {
      updated: new Date().toISOString(),
      source: "국토교통부 아파트매매 실거래가 (data.go.kr)",
      dealYmdRange: regionsMeta.dealYmdRange,
      note: "avgPricePerPyeong·priceChangeMoM만 실거래 기준 실제값입니다. 그 외 regionalData 필드(임대수익률·투자등급·점수 등)는 참고용 추정치입니다.",
      overlay,
    },
    null,
    2
  )
);

console.log("overlay 생성 완료:", Object.keys(overlay).length, "개 지역");
for (const [id, v] of Object.entries(overlay)) {
  console.log(` - ${id}: ${v.avgPricePerPyeong ?? "N/A"}만원/평 (${v.count}건, ${v.priceChangeMoM ?? "N/A"}%)`);
}
