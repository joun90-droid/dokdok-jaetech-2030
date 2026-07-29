/**
 * 한국 부동산 지도 — Leaflet + estate-regions.json
 */
(function () {
  const MAP_ID = "estate-map";
  const DATA_URL = "/data/estate-regions.json";
  const TYPE_LABELS = { apt: "아파트", land: "토지", forest: "임야", building: "건물" };
  const TYPE_COLORS = { apt: "#EA4335", land: "#FBBC04", forest: "#34A853", building: "#4285F4" };

  let map, layerGroup, regions = [];
  let activeType = "apt";

  function formatPrice(v) {
    return `${Number(v).toLocaleString("ko-KR")} 만원/㎡`;
  }

  function gradeCls(g) {
    return ({ "A+": "grade-ap", A: "grade-a", "B+": "grade-bp", B: "grade-b", C: "grade-c", D: "grade-d" })[g] || "grade-b";
  }

  function popupHtml(r, type) {
    const p = r.properties?.[type];
    if (!p) return `<strong>${r.name}</strong>`;
    const up = p.changePct >= 0;
    return `<div class="map-popup">
      <strong>${r.name} ${TYPE_LABELS[type]}</strong>
      <p class="map-popup-price">${formatPrice(p.price)}</p>
      <p class="map-popup-chg ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${p.changePct}%</p>
      <p>등급 <span class="grade-badge ${gradeCls(p.grade)}">${p.grade}</span> · ${p.score}점</p>
    </div>`;
  }

  function markerRadius(score) {
    return Math.max(8, Math.min(18, score / 6));
  }

  function renderMarkers() {
    if (!map || !layerGroup) return;
    layerGroup.clearLayers();
    regions.forEach((r) => {
      const p = r.properties?.[activeType];
      if (!p) return;
      const color = TYPE_COLORS[activeType];
      const circle = L.circleMarker([r.lat, r.lng], {
        radius: markerRadius(p.score),
        fillColor: color,
        color: "#fff",
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.75,
      });
      circle.bindPopup(popupHtml(r, activeType));
      circle.bindTooltip(`${r.name} ${formatPrice(p.price)}`, { direction: "top", offset: [0, -8] });
      layerGroup.addLayer(circle);
    });
  }

  function renderList() {
    const el = document.getElementById("estate-region-list");
    if (!el) return;
    const sorted = [...regions].sort((a, b) => (b.properties?.[activeType]?.score || 0) - (a.properties?.[activeType]?.score || 0));
    el.innerHTML = sorted.map((r) => {
      const p = r.properties?.[activeType];
      if (!p) return "";
      const up = p.changePct >= 0;
      return `<button type="button" class="estate-region-item" data-lat="${r.lat}" data-lng="${r.lng}">
        <span class="eri-name">${r.name}</span>
        <span class="eri-price">${formatPrice(p.price)}</span>
        <span class="eri-chg ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${p.changePct}%</span>
        <span class="grade-badge ${gradeCls(p.grade)}">${p.grade}</span>
      </button>`;
    }).join("");

    el.querySelectorAll(".estate-region-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        map.setView([parseFloat(btn.dataset.lat), parseFloat(btn.dataset.lng)], 9, { animate: true });
      });
    });
  }

  function initMap() {
    const container = document.getElementById(MAP_ID);
    if (!container || typeof L === "undefined") return;

    map = L.map(MAP_ID, { center: [36.2, 127.8], zoom: 7, zoomControl: true, attributionControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(map);

    layerGroup = L.layerGroup().addTo(map);
    renderMarkers();
    renderList();

    setTimeout(() => map.invalidateSize(), 200);
  }

  function initTabs() {
    document.querySelectorAll(".estate-type-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".estate-type-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        activeType = tab.dataset.estateType;
        renderMarkers();
        renderList();
      });
    });
  }

  async function load() {
    try {
      const res = await fetch(DATA_URL);
      const json = await res.json();
      regions = json.regions || [];
      initMap();
      initTabs();
    } catch {
      const el = document.getElementById(MAP_ID);
      if (el) el.innerHTML = '<p class="map-error">지도 데이터 로드 실패</p>';
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById(MAP_ID)) return;
    if (typeof L !== "undefined") load();
    else window.addEventListener("load", load);
  });
})();
