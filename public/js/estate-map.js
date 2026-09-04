/**
 * 영재 재테크 2030 — 전국 행정구역(읍면동) 3단계 드릴다운 + Leaflet + Nominatim geocode
 */
(function () {
  const MAP_ID = "estate-map";
  const ADMIN_URL = "data/korea-3depth.json";
  const TYPE_LABELS = { apt: "아파트", land: "토지", forest: "임야", building: "건물" };
  const TYPE_COLORS = { apt: "#8AB4F8", land: "#FDD663", forest: "#81C995", building: "#669DF6" };
  const KOREA_VIEW = { lat: 36.2, lng: 127.8, zoom: 7 };
  const GEO_CACHE_KEY = "estate_geo_v1";

  const SIDO_COORDS = {
    "서울특별시": { lat: 37.5665, lng: 126.978, zoom: 11 },
    "부산광역시": { lat: 35.1796, lng: 129.0756, zoom: 11 },
    "대구광역시": { lat: 35.8714, lng: 128.6014, zoom: 11 },
    "인천광역시": { lat: 37.4563, lng: 126.7052, zoom: 11 },
    "광주광역시": { lat: 35.1595, lng: 126.8526, zoom: 11 },
    "대전광역시": { lat: 36.3504, lng: 127.3845, zoom: 11 },
    "울산광역시": { lat: 35.5384, lng: 129.3114, zoom: 11 },
    "세종특별자치시": { lat: 36.48, lng: 127.289, zoom: 12 },
    "경기도": { lat: 37.4138, lng: 127.5183, zoom: 10 },
    "강원특별자치도": { lat: 37.8228, lng: 128.1555, zoom: 9 },
    "강원도": { lat: 37.8228, lng: 128.1555, zoom: 9 },
    "충청북도": { lat: 36.8, lng: 127.7, zoom: 9 },
    "충청남도": { lat: 36.5184, lng: 126.8, zoom: 9 },
    "전북특별자치도": { lat: 35.7175, lng: 127.153, zoom: 9 },
    "전라북도": { lat: 35.7175, lng: 127.153, zoom: 9 },
    "전라남도": { lat: 34.8679, lng: 126.991, zoom: 9 },
    "경상북도": { lat: 36.4919, lng: 128.8889, zoom: 9 },
    "경상남도": { lat: 35.4606, lng: 128.2132, zoom: 9 },
    "제주특별자치도": { lat: 33.4996, lng: 126.5312, zoom: 10 },
  };

  let map, markerLayer;
  let data = null;
  let activeType = "apt";
  let selectedCity = "";
  let selectedDistrict = "";
  let selectedNeighborhood = "";
  let geoCache = {};
  let lastGeoAt = 0;
  let mapBooted = false;
  let mapListenersBound = false;

  const $ = (sel) => document.querySelector(sel);

  function slug(s) {
    return String(s).trim().replace(/\s+/g, "-").replace(/[^\w\uAC00-\uD7A3-]/g, "").slice(0, 40) || "x";
  }

  function shortSido(name) {
    return name.replace(/특별자치도|특별자치시|특별시|광역시|도$/g, "").trim() || name;
  }

  function mockProps(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    const base = 700 + (h % 2400);
    return {
      apt: base,
      land: Math.round(base * 0.68),
      forest: Math.round(30 + (h % 90)),
      building: Math.round(base * 0.42),
      changePct: ((h % 40) - 15) / 100,
      grade: base > 2000 ? "A+" : base > 1500 ? "A" : base > 1100 ? "B+" : "B",
      score: 55 + (h % 40),
    };
  }

  function transformAdmin(raw) {
    const cities = [];
    Object.entries(raw).forEach(([sidoName, districts]) => {
      const coord = SIDO_COORDS[sidoName] || KOREA_VIEW;
      const cityId = slug(sidoName);
      const districtList = [];

      Object.entries(districts || {}).forEach(([distKey, dongs]) => {
        const distName = String(distKey).trim();
        if (!distName || !Array.isArray(dongs) || !dongs.length) return;
        const nhList = dongs.map((dong) => {
          const props = mockProps(sidoName + distName + dong);
          return {
            id: slug(dong + distName),
            name: dong,
            lat: null,
            lng: null,
            ...props,
          };
        });
        districtList.push({
          id: slug(distName + cityId),
          name: distName,
          lat: coord.lat,
          lng: coord.lng,
          zoom: Math.min(coord.zoom + 2, 14),
          neighborhoods: nhList,
        });
      });

      if (districtList.length) {
        cities.push({
          id: cityId,
          name: shortSido(sidoName),
          fullName: sidoName,
          lat: coord.lat,
          lng: coord.lng,
          zoom: coord.zoom,
          districts: districtList.sort((a, b) => a.name.localeCompare(b.name, "ko")),
        });
      }
    });
    cities.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    return { cities, updated: new Date().toISOString().slice(0, 10) };
  }

  function loadGeoCache() {
    try {
      geoCache = JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || "{}");
    } catch {
      geoCache = {};
    }
  }

  function saveGeoCache() {
    try {
      localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geoCache));
    } catch { /* quota */ }
  }

  async function geocode(query) {
    if (geoCache[query]) return geoCache[query];
    const now = Date.now();
    if (now - lastGeoAt < 1100) await new Promise((r) => setTimeout(r, 1100 - (now - lastGeoAt)));
    lastGeoAt = Date.now();

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=kr`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "Accept-Language": "ko" },
    });
    if (!res.ok) throw new Error("geocode fail");
    const arr = await res.json();
    if (!arr?.[0]) return null;
    const pt = { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon), zoom: 16 };
    geoCache[query] = pt;
    saveGeoCache();
    return pt;
  }

  function formatPrice(v) {
    return `${Number(v).toLocaleString("ko-KR")} 만원/㎡`;
  }

  function gradeCls(g) {
    return ({ "A+": "grade-ap", A: "grade-a", "B+": "grade-bp", B: "grade-b", C: "grade-c", D: "grade-d" })[g] || "grade-b";
  }

  function getPrice(n) {
    return n?.[activeType] ?? 0;
  }

  function fillSelect(el, items, placeholder, valueKey) {
    if (!el) return;
    el.innerHTML = `<option value="">${placeholder}</option>` +
      items.map((item) => {
        const val = typeof item === "string" ? item : item[valueKey || "id"];
        const label = typeof item === "string" ? item : item.name;
        return `<option value="${val}">${label}</option>`;
      }).join("");
    el.disabled = items.length === 0;
  }

  function findCity(id) {
    return data?.cities?.find((c) => c.id === id);
  }

  function findDistrict(city, districtId) {
    return city?.districts?.find((d) => d.id === districtId);
  }

  function findNeighborhood(district, nhId) {
    return district?.neighborhoods?.find((n) => n.id === nhId);
  }

  function popupHtml(n, districtName, cityName) {
    const price = getPrice(n);
    const up = n.changePct >= 0;
    return `<div class="estate-popup-card">
      <p class="epc-loc">${cityName} ${districtName} <strong>${n.name}</strong></p>
      <p class="epc-type">${TYPE_LABELS[activeType]}</p>
      <p class="epc-price">평당 ${formatPrice(price)}</p>
      <p class="epc-chg ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${(n.changePct * 100).toFixed(1)}%</p>
      <p>등급 <span class="grade-badge ${gradeCls(n.grade)}">${n.grade}</span> · ${n.score}점</p>
    </div>`;
  }

  function updateDetailPanel(n, districtName, cityName, loading) {
    const el = $("#estate-detail-panel");
    if (!el) return;
    if (loading) {
      el.innerHTML = `<p class="edp-empty">📡 ${cityName} ${districtName} 좌표 조회 중...</p>`;
      return;
    }
    if (!n) {
      el.innerHTML = `<p class="edp-empty">시·도 → 시·군·구 → 읍·면·동 순으로 선택하세요. 동 선택 시 지도가 해당 위치로 줌인됩니다.</p>`;
      return;
    }
    const price = getPrice(n);
    const up = n.changePct >= 0;
    el.innerHTML = `
      <p class="edp-label">선택 지역</p>
      <h3 class="edp-title">${cityName} ${districtName} ${n.name}</h3>
      <p class="edp-type">${TYPE_LABELS[activeType]} · 참고 시세</p>
      <p class="edp-price">평당 ${formatPrice(price)}</p>
      <p class="edp-chg ${up ? "up" : "down"}">${up ? "▲" : "▼"} 전월 대비 ${(n.changePct * 100).toFixed(1)}%</p>
      <p class="edp-grade">투자등급 <span class="grade-badge ${gradeCls(n.grade)}">${n.grade}</span> <span class="edp-score">${n.score}점</span></p>
    `;
  }

  function clearLayers() {
    if (markerLayer) markerLayer.clearLayers();
  }

  function renderNeighborhoodMarkers(neighborhoods, districtName, cityName, focusId) {
    clearLayers();
    if (!neighborhoods.length) return;

    neighborhoods.forEach((n) => {
      if (n.lat == null || n.lng == null) return;
      const price = getPrice(n);
      const isFocus = focusId && n.id === focusId;
      const marker = L.circleMarker([n.lat, n.lng], {
        radius: isFocus ? 14 : 8,
        fillColor: TYPE_COLORS[activeType],
        color: isFocus ? "#8AB4F8" : "rgba(255,255,255,0.85)",
        weight: isFocus ? 3 : 1.5,
        opacity: 1,
        fillOpacity: isFocus ? 0.95 : 0.7,
      });
      marker.bindPopup(popupHtml(n, districtName, cityName));
      marker.bindTooltip(`${n.name} ${formatPrice(price)}`, { direction: "top", offset: [0, -8] });
      marker.on("click", () => {
        selectedNeighborhood = n.id;
        const nhSel = $("#estate-filter-neighborhood");
        if (nhSel) nhSel.value = n.id;
        updateDetailPanel(n, districtName, cityName);
        map.setView([n.lat, n.lng], 16, { animate: true });
        marker.openPopup();
      });
      markerLayer.addLayer(marker);
    });
  }

  function flyTo(target, zoom) {
    if (!map || !target?.lat) return;
    map.flyTo([target.lat, target.lng], zoom || target.zoom || 14, { duration: 0.8 });
    setTimeout(() => map.invalidateSize(), 300);
  }

  async function ensureCoords(city, district, n) {
    if (n.lat != null && n.lng != null) return n;
    const q = `${n.name}, ${district.name}, ${city.fullName || city.name}, South Korea`;
    updateDetailPanel(n, district.name, city.name, true);
    try {
      const pt = await geocode(q);
      if (pt) {
        n.lat = pt.lat;
        n.lng = pt.lng;
      }
    } catch { /* */ }
    return n;
  }

  function onCityChange() {
    const citySel = $("#estate-filter-city");
    selectedCity = citySel?.value || "";
    selectedDistrict = "";
    selectedNeighborhood = "";

    const city = findCity(selectedCity);
    fillSelect($("#estate-filter-district"), city?.districts || [], "시·군·구 선택", "id");
    fillSelect($("#estate-filter-neighborhood"), [], "읍·면·동 선택", "id");
    updateDetailPanel(null);

    if (city) {
      flyTo(city, city.zoom);
      clearLayers();
    } else {
      flyTo(KOREA_VIEW, KOREA_VIEW.zoom);
      clearLayers();
    }
  }

  function onDistrictChange() {
    const city = findCity(selectedCity);
    selectedDistrict = $("#estate-filter-district")?.value || "";
    selectedNeighborhood = "";

    const district = findDistrict(city, selectedDistrict);
    fillSelect($("#estate-filter-neighborhood"), district?.neighborhoods || [], "읍·면·동 선택", "id");
    updateDetailPanel(null);

    if (district && city) {
      flyTo(district, district.zoom);
      renderNeighborhoodMarkers(district.neighborhoods.filter((n) => n.lat), district.name, city.name, null);
    } else {
      clearLayers();
    }
  }

  async function onNeighborhoodChange() {
    const city = findCity(selectedCity);
    const district = findDistrict(city, selectedDistrict);
    selectedNeighborhood = $("#estate-filter-neighborhood")?.value || "";
    let n = findNeighborhood(district, selectedNeighborhood);

    if (n && district && city) {
      n = await ensureCoords(city, district, n);
      updateDetailPanel(n, district.name, city.name);
      if (n.lat != null) {
        flyTo(n, 16);
        renderNeighborhoodMarkers(district.neighborhoods, district.name, city.name, n.id);
        setTimeout(() => {
          markerLayer?.eachLayer((layer) => {
            const ll = layer.getLatLng();
            if (Math.abs(ll.lat - n.lat) < 0.0002 && Math.abs(ll.lng - n.lng) < 0.0002) layer.openPopup();
          });
        }, 900);
      }
    } else {
      updateDetailPanel(null);
      if (district && city) {
        renderNeighborhoodMarkers(district.neighborhoods.filter((x) => x.lat), district.name, city.name, null);
      }
    }
  }

  function populateFilters() {
    if (!data) return;
    fillSelect($("#estate-filter-city"), data.cities, "시·도 선택", "id");
    fillSelect($("#estate-filter-district"), [], "시·군·구 선택", "id");
    fillSelect($("#estate-filter-neighborhood"), [], "읍·면·동 선택", "id");
  }

  function bindMapListeners() {
    if (mapListenersBound) return;
    mapListenersBound = true;

    $("#estate-filter-city")?.addEventListener("change", onCityChange);
    $("#estate-filter-district")?.addEventListener("change", onDistrictChange);
    $("#estate-filter-neighborhood")?.addEventListener("change", () => onNeighborhoodChange());

    $("#estate-filter-reset")?.addEventListener("click", () => {
      selectedCity = selectedDistrict = selectedNeighborhood = "";
      const citySel = $("#estate-filter-city");
      if (citySel) citySel.value = "";
      onCityChange();
    });

    $("#estate-btn-live")?.addEventListener("click", () => {
      document.querySelectorAll(".estate-action-pill").forEach((b) => b.classList.remove("is-active"));
      document.getElementById("estate-live-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.querySelectorAll("[data-estate-panel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.estatePanel;
        document.querySelectorAll(".estate-action-pill").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        if (id === "map") {
          document.getElementById("estate-map-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(() => map?.invalidateSize(), 400);
        }
      });
    });

    document.querySelectorAll(".estate-type-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".estate-type-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        activeType = tab.dataset.estateType;
        const city = findCity(selectedCity);
        const district = findDistrict(city, selectedDistrict);
        if (district && city) {
          renderNeighborhoodMarkers(
            district.neighborhoods.filter((n) => n.lat),
            district.name,
            city.name,
            selectedNeighborhood || null
          );
          const n = findNeighborhood(district, selectedNeighborhood);
          if (n) updateDetailPanel(n, district.name, city.name);
        }
      });
    });
  }

  function initMap() {
    const container = document.getElementById(MAP_ID);
    if (!container || typeof L === "undefined") return;

    if (map) {
      map.remove();
      map = null;
      markerLayer = null;
    }
    container.innerHTML = "";

    map = L.map(MAP_ID, {
      center: [KOREA_VIEW.lat, KOREA_VIEW.lng],
      zoom: KOREA_VIEW.zoom,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(map);

    markerLayer = L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 200);
  }

  async function load() {
    const panel = $("#estate-detail-panel");
    if (panel) panel.innerHTML = `<p class="edp-empty">📡 전국 행정구역 데이터를 불러오는 중...</p>`;

    loadGeoCache();

    try {
      if (!data && window.KOREA_ADMIN_TREE) {
        data = window.KOREA_ADMIN_TREE;
      }
      if (!data) {
        const res = await fetch(ADMIN_URL);
        if (!res.ok) throw new Error("admin json");
        const raw = await res.json();
        data = transformAdmin(raw);
        window.KOREA_ADMIN_TREE = data;
      }

      initMap();
      populateFilters();
      bindMapListeners();
      if (panel) panel.innerHTML = `<p class="edp-empty">전국 ${data.cities.length}개 시·도 · 읍면동 데이터 로드 완료. 지역을 선택하세요.</p>`;
    } catch {
      const el = document.getElementById(MAP_ID);
      if (el) el.innerHTML = '<p class="map-error">행정구역 데이터 로드 실패</p>';
      if (panel) panel.innerHTML = `<p class="edp-empty">데이터 로드 실패. 새로고침 해주세요.</p>`;
    }
  }

  async function bootMap(force) {
    if (!document.getElementById(MAP_ID)) return;
    if (mapBooted && !force) return;

    if (typeof L === "undefined") {
      setTimeout(() => bootMap(force), 40);
      return;
    }

    if (force) {
      if (map) {
        map.remove();
        map = null;
        markerLayer = null;
      }
      mapBooted = false;
    }

    mapBooted = true;
    await load();
  }

  function scheduleMapBoot(force) {
    const run = () => bootMap(!!force);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }
  }

  scheduleMapBoot(false);
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) scheduleMapBoot(true);
  });
  window.addEventListener("load", () => {
    if (!mapBooted) scheduleMapBoot(false);
  });
})();
