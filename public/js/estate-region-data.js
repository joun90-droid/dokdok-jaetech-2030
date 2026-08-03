/**
 * 영재 재테크 2030 — 전국 행정구역 Mock 트리 (3단계 드릴다운)
 * window.ESTATE_REGION_DATA 로 estate-map.js 에 주입
 */
window.ESTATE_REGION_DATA = {
  updated: "2026-08-03",
  unit: "manwon/m2",
  cities: [
    {
      id: "seoul",
      name: "서울",
      lat: 37.5665,
      lng: 126.978,
      zoom: 11,
      districts: [
        {
          id: "gangnam",
          name: "강남구",
          lat: 37.5172,
          lng: 127.0473,
          zoom: 14,
          neighborhoods: [
            { id: "yeoksam", name: "역삼동", lat: 37.5004, lng: 127.0366, apt: 2920, land: 2100, forest: 95, building: 1180, changePct: 0.24, grade: "A+", score: 88 },
            { id: "samseong", name: "삼성동", lat: 37.5088, lng: 127.0632, apt: 3100, land: 2250, forest: 102, building: 1250, changePct: 0.18, grade: "A+", score: 90 },
            { id: "daechi", name: "대치동", lat: 37.4944, lng: 127.0626, apt: 2850, land: 1980, forest: 88, building: 1100, changePct: 0.21, grade: "A", score: 85 },
            { id: "nonhyeon", name: "논현동", lat: 37.5112, lng: 127.0284, apt: 2680, land: 1920, forest: 82, building: 1050, changePct: 0.16, grade: "A", score: 83 }
          ]
        },
        {
          id: "mapo",
          name: "마포구",
          lat: 37.5663,
          lng: 126.9019,
          zoom: 14,
          neighborhoods: [
            { id: "seogyo", name: "서교동", lat: 37.5547, lng: 126.9209, apt: 2180, land: 1650, forest: 72, building: 890, changePct: 0.15, grade: "A", score: 82 },
            { id: "hapjeong", name: "합정동", lat: 37.5495, lng: 126.9139, apt: 2050, land: 1580, forest: 68, building: 820, changePct: 0.12, grade: "B+", score: 78 },
            { id: "gongdeok", name: "공덕동", lat: 37.5445, lng: 126.9513, apt: 1980, land: 1520, forest: 65, building: 780, changePct: 0.09, grade: "B+", score: 76 }
          ]
        },
        {
          id: "songpa",
          name: "송파구",
          lat: 37.5145,
          lng: 127.1059,
          zoom: 14,
          neighborhoods: [
            { id: "jamsil", name: "잠실동", lat: 37.5133, lng: 127.1002, apt: 2450, land: 1720, forest: 78, building: 950, changePct: 0.17, grade: "A", score: 84 },
            { id: "bangi", name: "방이동", lat: 37.5117, lng: 127.1264, apt: 2280, land: 1680, forest: 74, building: 910, changePct: 0.14, grade: "A", score: 81 }
          ]
        },
        {
          id: "yongsan",
          name: "용산구",
          lat: 37.5326,
          lng: 126.9905,
          zoom: 14,
          neighborhoods: [
            { id: "hangang", name: "한남동", lat: 37.5344, lng: 127.0065, apt: 2750, land: 1980, forest: 85, building: 1120, changePct: 0.19, grade: "A+", score: 87 },
            { id: "ichon", name: "이촌동", lat: 37.5221, lng: 126.9742, apt: 2520, land: 1820, forest: 79, building: 980, changePct: 0.14, grade: "A", score: 84 }
          ]
        }
      ]
    },
    {
      id: "gyeonggi",
      name: "경기",
      lat: 37.4138,
      lng: 127.5183,
      zoom: 10,
      districts: [
        {
          id: "suwon",
          name: "수원시",
          lat: 37.2636,
          lng: 127.0286,
          zoom: 13,
          neighborhoods: [
            { id: "yeongtong", name: "영통동", lat: 37.252, lng: 127.0764, apt: 1420, land: 980, forest: 52, building: 620, changePct: 0.22, grade: "B+", score: 74 },
            { id: "ingye", name: "인계동", lat: 37.2669, lng: 127.0324, apt: 1380, land: 920, forest: 48, building: 590, changePct: 0.19, grade: "B+", score: 72 },
            { id: "hwaseo", name: "화서동", lat: 37.2838, lng: 127.0105, apt: 1180, land: 810, forest: 42, building: 510, changePct: 0.16, grade: "B", score: 68 }
          ]
        },
        {
          id: "seongnam",
          name: "성남시",
          lat: 37.4449,
          lng: 127.1388,
          zoom: 13,
          neighborhoods: [
            { id: "pangyo", name: "판교동", lat: 37.3947, lng: 127.1112, apt: 1850, land: 1320, forest: 58, building: 740, changePct: 0.20, grade: "A", score: 80 },
            { id: "bundang", name: "분당동", lat: 37.3827, lng: 127.1189, apt: 1720, land: 1250, forest: 55, building: 690, changePct: 0.18, grade: "A", score: 79 }
          ]
        },
        {
          id: "goyang",
          name: "고양시",
          lat: 37.6584,
          lng: 126.832,
          zoom: 13,
          neighborhoods: [
            { id: "ilsan", name: "일산동", lat: 37.6762, lng: 126.7763, apt: 1280, land: 890, forest: 46, building: 560, changePct: 0.15, grade: "B+", score: 71 },
            { id: "deogyang", name: "덕양동", lat: 37.6342, lng: 126.8951, apt: 1120, land: 780, forest: 40, building: 490, changePct: 0.12, grade: "B", score: 67 }
          ]
        }
      ]
    },
    {
      id: "busan",
      name: "부산",
      lat: 35.1796,
      lng: 129.0756,
      zoom: 11,
      districts: [
        {
          id: "haeundae",
          name: "해운대구",
          lat: 35.1631,
          lng: 129.1635,
          zoom: 14,
          neighborhoods: [
            { id: "udong", name: "우동", lat: 35.1634, lng: 129.1604, apt: 1680, land: 1120, forest: 48, building: 580, changePct: 0.13, grade: "B+", score: 75 },
            { id: "jungdong", name: "중동", lat: 35.1682, lng: 129.1731, apt: 1750, land: 1180, forest: 50, building: 610, changePct: 0.11, grade: "B+", score: 76 }
          ]
        },
        {
          id: "suyeong",
          name: "수영구",
          lat: 35.1456,
          lng: 129.1133,
          zoom: 14,
          neighborhoods: [
            { id: "gwangan", name: "광안동", lat: 35.1532, lng: 129.1187, apt: 1520, land: 1050, forest: 44, building: 540, changePct: 0.10, grade: "B", score: 71 },
            { id: "minrak", name: "민락동", lat: 35.1558, lng: 129.1275, apt: 1580, land: 1080, forest: 46, building: 560, changePct: 0.12, grade: "B+", score: 73 }
          ]
        }
      ]
    },
    {
      id: "daejeon",
      name: "대전",
      lat: 36.3504,
      lng: 127.3845,
      zoom: 11,
      districts: [
        {
          id: "yuseong",
          name: "유성구",
          lat: 36.362,
          lng: 127.356,
          zoom: 14,
          neighborhoods: [
            { id: "dunsan", name: "둔산동", lat: 36.3526, lng: 127.3889, apt: 1350, land: 920, forest: 44, building: 580, changePct: 0.14, grade: "B+", score: 72 },
            { id: "gujeuk", name: "구즉동", lat: 36.3751, lng: 127.3182, apt: 1180, land: 810, forest: 38, building: 490, changePct: 0.11, grade: "B", score: 68 }
          ]
        },
        {
          id: "seo",
          name: "서구",
          lat: 36.3556,
          lng: 127.3838,
          zoom: 14,
          neighborhoods: [
            { id: "tanbang", name: "탄방동", lat: 36.3442, lng: 127.3812, apt: 1280, land: 880, forest: 42, building: 540, changePct: 0.13, grade: "B+", score: 70 },
            { id: "gungdong", name: "궁동", lat: 36.3389, lng: 127.3945, apt: 1150, land: 790, forest: 36, building: 470, changePct: 0.09, grade: "B", score: 66 }
          ]
        }
      ]
    },
    {
      id: "incheon",
      name: "인천",
      lat: 37.4563,
      lng: 126.7052,
      zoom: 11,
      districts: [
        {
          id: "namdong",
          name: "남동구",
          lat: 37.4486,
          lng: 126.731,
          zoom: 14,
          neighborhoods: [
            { id: "guban", name: "구월동", lat: 37.4552, lng: 126.7318, apt: 1120, land: 780, forest: 38, building: 480, changePct: 0.10, grade: "B", score: 67 },
            { id: "nonhyeon_ic", name: "논현동", lat: 37.4421, lng: 126.7189, apt: 1080, land: 750, forest: 36, building: 460, changePct: 0.08, grade: "B", score: 65 }
          ]
        },
        {
          id: "yeonsu",
          name: "연수구",
          lat: 37.4101,
          lng: 126.6788,
          zoom: 14,
          neighborhoods: [
            { id: "songdo", name: "송도동", lat: 37.3828, lng: 126.662, apt: 1480, land: 1020, forest: 48, building: 620, changePct: 0.16, grade: "B+", score: 74 },
            { id: "cheongna", name: "청라동", lat: 37.5342, lng: 126.6421, apt: 1320, land: 910, forest: 42, building: 550, changePct: 0.12, grade: "B+", score: 71 }
          ]
        }
      ]
    },
    {
      id: "daegu",
      name: "대구",
      lat: 35.8714,
      lng: 128.6014,
      zoom: 11,
      districts: [
        {
          id: "suseong",
          name: "수성구",
          lat: 35.8581,
          lng: 128.6311,
          zoom: 14,
          neighborhoods: [
            { id: "beomeo", name: "범어동", lat: 35.8589, lng: 128.6254, apt: 1420, land: 980, forest: 44, building: 590, changePct: 0.11, grade: "B+", score: 72 },
            { id: "manchon", name: "만촌동", lat: 35.8692, lng: 128.6389, apt: 1350, land: 920, forest: 42, building: 560, changePct: 0.09, grade: "B+", score: 70 }
          ]
        }
      ]
    }
  ]
};
