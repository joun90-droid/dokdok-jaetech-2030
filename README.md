# 영재가 추천하는 — 청년 재테크

2030 청년을 위한 **예적금·ETF·부동산** 투자 정보 사이트입니다.  
검색 유입(SEO)을 고려해 정적 HTML로 구성했으며, Node.js 없이 바로 실행할 수 있습니다.

## 사이트 구조

```
재테크 투자정보/
├── index.html          # 메인 (청년 재테크 허브)
├── savings.html        # 예적금·청년도약계좌
├── etf.html            # ETF 투자
├── real-estate.html    # 부동산·청약
├── articles.html       # 가이드 글 목록
├── articles/           # SEO 롱테일 콘텐츠
├── css/style.css
├── js/main.js
├── sitemap.xml
└── robots.txt
```

## 실행 방법

1. `index.html`을 더블클릭하거나 브라우저로 열기
2. 또는 로컬 서버 실행 (권장):

```powershell
# Python이 설치된 경우
cd "C:\Users\User\Desktop\재테크 투자정보"
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속

## SEO 설정 (배포 전 필수)

모든 HTML·`sitemap.xml`·`robots.txt`에 **`https://your-domain.com`** 이 placeholder로 들어 있습니다.

실제 도메인으로 일괄 변경하세요. 예:

- `your-domain.com` → `youth-invest.co.kr` (본인 도메인)

### 검색 등록

1. [Google Search Console](https://search.google.com/search-console) — 사이트 등록, sitemap 제출
2. [네이버 서치어드바이저](https://searchadvisor.naver.com/) — 사이트 등록, sitemap 제출
3. [Bing Webmaster Tools](https://www.bing.com/webmasters)

### SEO 적용 항목

- 페이지별 `title`, `description`, `keywords`
- Open Graph / canonical URL
- JSON-LD (WebSite, Article, FAQPage, BreadcrumbList)
- `sitemap.xml`, `robots.txt`
- 시맨틱 HTML, 내부 링크, FAQ 구조
- 모바일 반응형

## 무료 배포 (추천)

| 서비스 | 방법 |
|--------|------|
| **GitHub Pages** | 저장소 생성 → 파일 push → Settings → Pages |
| **Netlify** | 폴더 드래그 앤 드롭 배포 |
| **Cloudflare Pages** | Git 연동 또는 직접 업로드 |

## 콘텐츠 추가 팁

검색 유입을 늘리려면 `articles/` 폴더에 글을 추가하세요.

- 예: `청년 ISA 계좌`, `청년 전세대출`, `KODEX vs TIGER`
- 각 글마다 고유 `title`, `description`, canonical, Article JSON-LD 추가
- `sitemap.xml`에 URL 등록
- `articles.html`과 관련 페이지에서 내부 링크 연결

## 면책

본 사이트 정보는 참고용이며 투자·법률·세무 자문이 아닙니다.  
금융·부동산 상품 조건은 수시로 변경되므로 공식 기관에서 최신 정보를 확인하세요.
