// 국토교통부 아파트매매 실거래가 API → public/data/estate-regions-live.json, estate-transactions-live.json
// 실행: node scripts/fetch-realestate.mjs  (scripts/.env 에 MOLIT_API_KEY_DECODED 필요)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import REGIONS from "./lawd-codes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "data");
const CACHE_DIR = join(__dirname, ".cache");

// ── .env 파싱 (외부 패키지 없이 직접) ──
function loadEnv(path) {
  const out = {};
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) out[m[1]] = m[2];
    }
  } catch {
    // ignore
  }
  return out;
}
const env = loadEnv(join(__dirname, ".env"));
const API_KEY = env.MOLIT_API_KEY_DECODED;
if (!API_KEY) {
  console.error("scripts/.env 에 MOLIT_API_KEY_DECODED 가 없습니다.");
  process.exit(1);
}

const BASE_URL = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade";
const PYEONG = 3.3058; // 1평 = 3.3058 m²

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function xmlTag(xml, tag) {
  const re = new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function parseItems(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml))) {
    const block = m[1];
    const dealAmount = Number(xmlTag(block, "dealAmount").replace(/,/g, ""));
    const excluUseAr = Number(xmlTag(block, "excluUseAr"));
    if (!dealAmount || !excluUseAr) continue;
    items.push({
      aptNm: xmlTag(block, "aptNm"),
      umdNm: xmlTag(block, "umdNm"),
      dealAmount, // 만원
      excluUseAr, // m²
      floor: xmlTag(block, "floor"),
      buildYear: xmlTag(block, "buildYear"),
      dealYear: xmlTag(block, "dealYear"),
      dealMonth: xmlTag(block, "dealMonth"),
      dealDay: xmlTag(block, "dealDay"),
      pricePerPyeong: Math.round((dealAmount / excluUseAr) * PYEONG),
    });
  }
  return items;
}

async function fetchMonth(lawdCd, dealYmd) {
  const url = `${BASE_URL}?serviceKey=${encodeURIComponent(API_KEY)}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&numOfRows=500`;
  const res = await fetch(url);
  const text = await res.text();
  const resultCode = xmlTag(text, "resultCode");
  if (resultCode !== "000") {
    const msg = xmlTag(text, "resultMsg") || xmlTag(text, "returnAuthMsg") || xmlTag(text, "errMsg");
    return { ok: false, resultCode: resultCode || "N/A", resultMsg: msg, items: [] };
  }
  return { ok: true, items: parseItems(text) };
}

function recentYmdList(n) {
  const list = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    list.push(`${y}${m}`);
    d.setMonth(d.getMonth() - 1);
  }
  return list;
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

async function main() {
  const [thisYmd, prevYmd, prev2Ymd] = recentYmdList(3);
  const regionResults = [];
  const allTransactions = [];
  const failed = [];

  console.log(`대상 지역 ${REGIONS.length}곳, 조회 월: ${thisYmd}, ${prevYmd} (참고 ${prev2Ymd})`);

  for (let i = 0; i < REGIONS.length; i++) {
    const region = REGIONS[i];
    process.stdout.write(`[${i + 1}/${REGIONS.length}] ${region.sido} ${region.name} (${region.code}) ... `);

    try {
      const [curRes, prevRes] = await Promise.all([
        fetchMonth(region.code, thisYmd),
        fetchMonth(region.code, prevYmd),
      ]);

      if (!curRes.ok && !prevRes.ok) {
        failed.push({ ...region, reason: curRes.resultMsg || "unknown" });
        console.log(`FAIL (${curRes.resultCode} ${curRes.resultMsg})`);
        await sleep(120);
        continue;
      }

      const curItems = curRes.items || [];
      const prevItems = prevRes.items || [];

      curItems.forEach((it) => allTransactions.push({ ...it, sido: region.sido, sigungu: region.name, dealYmd: thisYmd }));
      prevItems.forEach((it) => allTransactions.push({ ...it, sido: region.sido, sigungu: region.name, dealYmd: prevYmd }));

      const curPrices = curItems.map((it) => it.pricePerPyeong);
      const prevPrices = prevItems.map((it) => it.pricePerPyeong);
      const combined = [...curPrices, ...prevPrices];

      if (combined.length === 0) {
        console.log("no transactions");
        regionResults.push({
          sido: region.sido,
          name: region.name,
          code: region.code,
          avgPricePerPyeong: null,
          count: 0,
          changePct: null,
        });
        await sleep(120);
        continue;
      }

      const avgAll = Math.round(mean(combined));
      let changePct = null;
      if (curPrices.length > 0 && prevPrices.length > 0) {
        const avgCur = mean(curPrices);
        const avgPrev = mean(prevPrices);
        changePct = Number((((avgCur - avgPrev) / avgPrev) * 100).toFixed(2));
      }

      regionResults.push({
        sido: region.sido,
        name: region.name,
        code: region.code,
        avgPricePerPyeong: avgAll,
        count: combined.length,
        changePct,
      });
      console.log(`OK (${combined.length}건, 평균 ${avgAll}만원/평)`);
    } catch (err) {
      failed.push({ ...region, reason: String(err) });
      console.log(`ERROR (${err})`);
    }

    await sleep(120);
  }

  allTransactions.sort((a, b) => {
    const ay = `${a.dealYmd}${a.dealDay.padStart(2, "0")}`;
    const by = `${b.dealYmd}${b.dealDay.padStart(2, "0")}`;
    return by.localeCompare(ay);
  });

  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(CACHE_DIR, { recursive: true });

  // 전체 거래 원자료(빌드 타임 전용, 배포 안 함) — build-regional-overlay.mjs 에서 사용
  writeFileSync(join(CACHE_DIR, "estate-transactions-full.json"), JSON.stringify(allTransactions));

  writeFileSync(
    join(OUT_DIR, "estate-regions-live.json"),
    JSON.stringify(
      {
        updated: new Date().toISOString(),
        source: "국토교통부 아파트매매 실거래가 (data.go.kr)",
        dealYmdRange: [prevYmd, thisYmd],
        unit: "manwon/pyeong",
        regions: regionResults,
        failedRegions: failed,
      },
      null,
      0
    )
  );

  writeFileSync(
    join(OUT_DIR, "estate-transactions-live.json"),
    JSON.stringify(
      {
        updated: new Date().toISOString(),
        source: "국토교통부 아파트매매 실거래가 (data.go.kr)",
        transactions: allTransactions.slice(0, 300),
      },
      null,
      0
    )
  );

  console.log(`\n완료: 지역 ${regionResults.length}곳 처리, 실패 ${failed.length}곳, 거래 ${allTransactions.length}건 수집`);
  if (failed.length > 0) {
    console.log("실패 지역:", failed.map((f) => `${f.name}(${f.code})`).join(", "));
  }
}

main();
