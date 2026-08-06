# -*- coding: utf-8 -*-
import os
from fpdf import FPDF
from pathlib import Path

DESKTOP = Path(os.environ["USERPROFILE"]) / "Desktop"
OUT = DESKTOP / "보완점-상세-실천-가이드.pdf"
FONT = Path(r"C:\Windows\Fonts\malgun.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\malgunbd.ttf")


class DetailPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font("KR", "", str(FONT))
        self.add_font("KR", "B", str(FONT_BOLD))
        self.add_font("KR", "I", str(FONT))

    def footer(self):
        self.set_y(-12)
        self.set_font("KR", "", 8)
        self.set_text_color(130, 130, 130)
        self.cell(0, 8, f"보완점 상세 실천 가이드  |  {self.page_no()}", align="C")

    def title_page(self):
        self.add_page()
        self.ln(25)
        self.set_font("KR", "B", 22)
        self.set_text_color(15, 23, 42)
        self.multi_cell(0, 12, "보완점 상세 실천 가이드", align="C")
        self.ln(3)
        self.set_font("KR", "", 12)
        self.set_text_color(100, 116, 139)
        self.multi_cell(0, 8, "6가지 성장 포인트 · 구체적 예시 · 복붙 템플릿 · 체크리스트", align="C")
        self.ln(8)
        self.set_font("KR", "", 10)
        self.set_text_color(161, 98, 7)
        self.multi_cell(0, 7, "Cursor AI 대화 분석 기반 · 2026년 8월", align="C")
        self.ln(10)
        self.box(
            "이 PDF는 '모호한 조언'을 '오늘 당장 쓸 수 있는 문장·표·루틴'으로 바꾼 것입니다.\n"
            "각 항목마다: 왜 문제인지 → 실제 대화 예시 → 나쁜/좋은 요청 → 실천법 → 체크리스트."
        )

    def box(self, text, fill=(248, 250, 252)):
        self.set_fill_color(*fill)
        self.set_draw_color(226, 232, 240)
        self.set_font("KR", "", 10)
        self.set_text_color(51, 65, 85)
        self.multi_cell(0, 7, text, border=1, fill=True)
        self.ln(3)

    def section(self, num, title, subtitle=""):
        if self.get_y() > 240:
            self.add_page()
        self.ln(4)
        self.set_font("KR", "B", 15)
        self.set_text_color(185, 28, 28)
        self.cell(0, 10, f"{num}. {title}", new_x="LMARGIN", new_y="NEXT")
        if subtitle:
            self.set_font("KR", "", 10)
            self.set_text_color(100, 116, 139)
            self.multi_cell(0, 6, subtitle)
        self.set_draw_color(202, 138, 4)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def sub(self, title):
        if self.get_y() > 265:
            self.add_page()
        self.ln(2)
        self.set_font("KR", "B", 11)
        self.set_text_color(30, 64, 175)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body(self, text):
        self.set_font("KR", "", 10)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 6.5, text)
        self.ln(1)

    def bullet(self, text):
        x = self.get_x()
        self.set_font("KR", "", 10)
        self.set_text_color(30, 41, 59)
        self.cell(5, 6.5, "-")
        self.multi_cell(0, 6.5, text)
        self.set_x(x)

    def bad(self, text):
        self.set_font("KR", "B", 9)
        self.set_text_color(185, 28, 28)
        self.cell(0, 6, "X 나쁜 예", new_x="LMARGIN", new_y="NEXT")
        self.set_font("KR", "", 9)
        self.set_text_color(127, 29, 29)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def good(self, text):
        self.set_font("KR", "B", 9)
        self.set_text_color(22, 101, 52)
        self.cell(0, 6, "O 좋은 예", new_x="LMARGIN", new_y="NEXT")
        self.set_font("KR", "", 9)
        self.set_text_color(20, 83, 45)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def template(self, text):
        self.set_fill_color(255, 251, 235)
        self.set_draw_color(251, 191, 36)
        self.set_font("KR", "B", 9)
        self.set_text_color(146, 64, 14)
        self.cell(0, 6, "[ 복붙 템플릿 ]", new_x="LMARGIN", new_y="NEXT")
        self.set_font("KR", "", 9)
        self.set_text_color(120, 53, 15)
        self.multi_cell(0, 6, text, border=1, fill=True)
        self.ln(2)

    def checklist(self, items):
        for item in items:
            if self.get_y() > 275:
                self.add_page()
            self.set_font("KR", "", 10)
            self.set_text_color(30, 41, 59)
            self.cell(8, 7, "[ ]")
            self.multi_cell(0, 7, item)
            self.ln(0.5)


def section1(pdf):
    pdf.section("1", "한 번에 범위가 너무 큼",
                "한 메시지에 기능·디자인·배포·수익화를 몰아넣으면 품질·속도·비용이 흔들립니다.")
    pdf.sub("왜 문제인가")
    pdf.body(
        "AI는 한 번에 많은 일을 '겉으로는' 다 해주지만, 깊이 검증·테스트·충돌 해결이 "
        "부족해집니다. 실제 대화에서 '10개 다 만들어', '기사 연동+차트+UI+AdSense'처럼 "
        "요청하면 중간에 '제대로 안 됐어', '다시 봐봐'가 반복되었습니다."
    )
    pdf.sub("실제 대화에서 나온 패턴")
    pdf.bullet("'1부터 10까지 다 만들고 반응앱 + 폴더 + 서버 + AdSense + 링크'")
    pdf.bullet("'더 다듬어 + 기사 연동 + 차트 + 다시 만들어'")
    pdf.bullet("'사이트들 이쁘게 + 클릭하면 다른 페이지 + 10개 다'")
    pdf.sub("범위를 자르는 3단계 법칙")
    pdf.body("① 이번 턴에 꼭 필요한 것 1~3개만 고른다.\n"
             "② 나머지는 '다음 턴' 또는 '보류함'에 넣는다.\n"
             "③ 완료 후 다음 범위를 새 메시지로 시작한다.")
    pdf.bad("'10개 사이트 UI 다듬고 기사 연동하고 차트 넣고 AdSense 맞춰줘'")
    pdf.good(
        "이번에는 FinTrack(index)만:\n"
        "1) 크롬 바 다크/라이트·KO/EN\n"
        "2) 라이트 모드 헤더 흰색\n"
        "3) 테스트 + GitHub + Firebase deploy\n"
        "→ 끝나면 stock-price.html 차트 연동은 다음에"
    )
    pdf.template(
        "[범위 제한 템플릿]\n"
        "이번 작업 범위: (페이지/기능 1~3개)\n"
        "이번에 하지 말 것: (나머지 목록)\n"
        "완료 조건: (테스트·배포·커밋)\n"
        "다음 턴 예정: (보류 항목)"
    )
    pdf.sub("프로젝트 규모별 권장 단위")
    pdf.bullet("UI 수정: 페이지 1~2개 또는 컴포넌트 1개 (크롬 바, 헤더 등)")
    pdf.bullet("기능 추가: 1기능 (예: 다국어, 차트 1종, API 1개)")
    pdf.bullet("신규 사이트: 1개씩 (HTML+CSS+배포+AdSense 기본 3종)")
    pdf.bullet("대규모: 최대 '2개 사이트' 또는 '1사이트 + 3페이지'")
    pdf.sub("오늘부터 실천")
    pdf.checklist([
        "새 요청 쓸 때 '이번에 하지 말 것' 줄 1개 추가",
        "3개 넘는 요구는 메모장에 쪼개서 순서 번호 매기기",
        "FinTrack = 대표작, 나머지 = 유지 모드로 분류",
        "한 세션(대화) 목표를 맨 위에 한 줄로 적기",
    ])


def section2(pdf):
    pdf.add_page()
    pdf.section("2", "'다시 해'가 때로 모호함",
                "'제대로 안 됐어'만으로는 원인·재현·기대값을 AI가 추측해야 합니다.")
    pdf.sub("왜 문제인가")
    pdf.body(
        "스크린샷은 잘 보내지만, '뭐가 틀렸는지' 한 줄이 없으면 AI가 "
        "CSS? JS? 배포? 캐시? 중 어디를 고칠지 넓게 뒤집습니다. "
        "그래서 수정 후 다른 곳이 깨지거나, 같은 문제가 반복됩니다."
    )
    pdf.sub("실제 대화에서 나온 패턴")
    pdf.bullet("'제대로 안 됬어 재검토해줘' (무엇이?)")
    pdf.bullet("'다시 만들어' (어느 페이지? 어떤 동작?)")
    pdf.bullet("'안 눌려' (어떤 버튼? PC/모바일?)")
    pdf.sub("4요소 재현 공식 (반드시 포함)")
    pdf.body(
        "① URL (예: fintrack2030-248bf.web.app/stock-education.html)\n"
        "② 기기 (PC / iPhone / Android)\n"
        "③ 기대: 클릭하면 ○○가 보여야 함\n"
        "④ 실제: 지금은 △△가 됨 (+ 스크린샷)"
    )
    pdf.bad("'유튜브 순위 다시 만들어. 재생 안 돼.'")
    pdf.good(
        "URL: jeonyoungjae-xxx.web.app\n"
        "기기: PC Chrome\n"
        "기대: 1위 썸네일 클릭 → YouTube 새 탭 재생\n"
        "실제: 클릭해도 반응 없음 (캡처 첨부)\n"
        "추측: iframe 또는 링크 target 문제?"
    )
    pdf.template(
        "[버그/재작업 템플릿]\n"
        "URL:\n"
        "페이지/버튼:\n"
        "기기·브라우저:\n"
        "기대 동작:\n"
        "실제 동작:\n"
        "언제부터: (방금 배포 후 / 예전부터)\n"
        "스크린샷: (첨부)"
    )
    pdf.sub("상황별 추가로 적으면 좋은 것")
    pdf.bullet("테마: 다크/라이트 중 어느 모드에서?")
    pdf.bullet("언어: 한국어/English 전환 후?")
    pdf.bullet("첫 방문 vs 새로고침 후?")
    pdf.bullet("다른 페이지는 정상인지?")
    pdf.sub("오늘부터 실천")
    pdf.checklist([
        "'다시 해' 대신 위 4요소 템플릿 복붙",
        "스크린샷에 빨간 동그라미(Windows: 그림판)로 문제 위치 표시",
        "정상인 화면 캡처 1장 + 문제 화면 1장 같이 보내기",
        "수정 후 '이 URL에서 이 버튼'만 다시 확인해 달라고 명시",
    ])


def section3(pdf):
    pdf.add_page()
    pdf.section("3", "인프라 개념 혼동",
                "Firebase Hosting / Cloud Run / AdSense / GitHub — 역할이 다릅니다.")
    pdf.sub("한 장으로 정리")
    pdf.box(
        "GitHub = 코드 저장소 (백업·이력). 돈 거의 안 듦.\n"
        "Firebase Hosting = HTML/CSS/JS 정적 파일을 인터넷에 올림. "
        "fintrack2030-248bf.web.app 같은 주소.\n"
        "Cloud Run = 서버 프로그램(Python 등) 24시간 실행. "
        "트래픽·CPU 쓰면 과금. 정적 사이트만이면 보통 불필요.\n"
        "AdSense = 구글 광고. '사이트 승인'과 '코드 삽입'은 별개. "
        "Hosting에 올린 URL을 AdSense에 등록.\n"
        "GitHub Actions Secret = 배포 자동화용 비밀키. "
        "FIREBASE_TOKEN 등. AdSense ID와 다름."
    )
    pdf.sub("실제 대화에서 헷갈렸던 것")
    pdf.bullet("'파이어베이스 안 올려도 돼?' → 올려야 URL로 접속 가능")
    pdf.bullet("'서버비 내야 되지?' → Hosting 무료 한도 내 vs Cloud Run 과금")
    pdf.bullet("'Cloud Run 4개 사이트' → 정적 사이트는 Hosting이 맞는 경우 많음")
    pdf.bullet("'프로젝트 2개 떠?' → Firebase 프로젝트 ≠ Hosting 사이트 수")
    pdf.bullet("'Secret에 뭐라고 써?' → FIREBASE_TOKEN (배포용)")
    pdf.sub("FinTrack 기준 실제 구조")
    pdf.bullet("코드: GitHub joun90-droid/fintrack2030")
    pdf.bullet("배포: firebase deploy --only hosting --project fintrack2030-248bf")
    pdf.bullet("라이브: https://fintrack2030-248bf.web.app/")
    pdf.bullet("파일 위치: public/ 폴더")
    pdf.bullet("허브: youngjae-hub (다른 Firebase 프로젝트)")
    pdf.sub("비용 감각 (2026 기준 대략)")
    pdf.bullet("Firebase Hosting: Spark 무료 — 트래픽·용량 한도 내 0원")
    pdf.bullet("Cloud Run: 요청·실행 시간 과금 — API·봇·번역 서버 등")
    pdf.bullet("AdSense: 호스팅 비용과 무관 — 승인 후 클릭 수익")
    pdf.bullet("도메인 커스텀: 선택, 월/년 비용 별도")
    pdf.template(
        "[내 사이트 인벤토리 — 직접 채우기]\n"
        "사이트명 | URL | Firebase 프로젝트 | Hosting/Run | AdSense | GitHub repo\n"
        "FinTrack | fintrack2030-248bf.web.app | fintrack2030-248bf | Hosting | (상태) | fintrack2030\n"
        "..."
    )
    pdf.sub("오늘부터 실천")
    pdf.checklist([
        "위 인벤토리 표 1장 작성 (Excel/메모)",
        "새 사이트 만들 때 'Hosting vs Run' 먼저 결정",
        "배포 명령어를 사이트마다 메모 (프로젝트 ID 포함)",
        "'서버'라고 할 때 Hosting인지 Run인지 한 단어로 구분",
    ])


def section4(pdf):
    pdf.add_page()
    pdf.section("4", "직접 확인 루틴 부족",
                "'된거야?'를 AI에게 묻기 전, 1분 셀프 체크로 답의 80%를 알 수 있습니다.")
    pdf.sub("왜 문제인가")
    pdf.body(
        "배포는 성공했는데 캐시·옛 파일·다른 URL을 보고 있을 수 있습니다. "
        "직접 확인하면 '아직 반영 안 됨' vs '진짜 버그'를 가릴 수 있고, "
        "AI 대화 횟수와 기다리는 시간이 줄어듭니다."
    )
    pdf.sub("배포 후 1분 체크 (FinTrack 예시)")
    pdf.bullet("1) URL 열기: https://fintrack2030-248bf.web.app/?v=날짜")
    pdf.bullet("2) Ctrl+Shift+R (강력 새로고침) 또는 시크릿 창")
    pdf.bullet("3) 크롬 바 보이는지, 다크/라이트 전환")
    pdf.bullet("4) KO/EN 전환 → 메뉴·히어로 글자 바뀌는지")
    pdf.bullet("5) 모바일: F12 → 기기 툴바 또는 실제 폰")
    pdf.bullet("6) 클릭 1개: 주식시세추천 → 페이지 이동")
    pdf.sub("상태별 다음 행동")
    pdf.box(
        "404 / 흰 화면 → 배포 실패 또는 경로 오류. AI에 URL+콘솔(F12) 캡처.\n"
        "옛 UI → 캐시. ?v=20260805 같은 버전 붙이거나 시크릿 창.\n"
        "일부만 깨짐 → 특정 페이지만. 그 URL만 4요소 템플릿.\n"
        "전부 정상 → '된거야?' 대신 '확인 완료, 다음은 ○○'."
    )
    pdf.sub("주간 10분 루틴 (대표 URL 3개)")
    pdf.bullet("FinTrack 홈 — 테마·언어·카드 클릭")
    pdf.bullet("stock-education — 첫 로딩 깜빡임 없는지")
    pdf.bullet("허브 또는 2번째 대표 사이트 1개")
    pdf.template(
        "[1분 체크 로그 — 날짜 적기]\n"
        "날짜:\n"
        "URL:\n"
        "PC OK / MOBILE OK / 이슈:\n"
        "이슈 있으면 → 4요소 템플릿으로 AI에 전달"
    )
    pdf.sub("오늘부터 실천")
    pdf.checklist([
        "배포 후 AI에게 묻기 전에 시크릿 창 1번 열기",
        "문제 있을 때만 스크린샷 + 4요소",
        "매주 월요일 대표 3 URL 점검",
        "캐시 의심 시 ?v=오늘날짜 붙여 테스트",
    ])


def section5(pdf):
    pdf.add_page()
    pdf.section("5", "깊이 vs 넓이",
                "사이트 13개+보다 '잘 되는 2개'가 AdSense·브랜드·유지에 유리합니다.")
    pdf.sub("왜 문제인가")
    pdf.body(
        "많이 만들수록: 배포·AdSense·버그·콘텐츠·SEO를 각각 관리해야 합니다. "
        "얕은 사이트 many개 < 깊은 사이트 2개가 검색·재방문·수익에 유리한 경우가 많습니다."
    )
    pdf.sub("현재 포트폴리오 구조 (대화 기준)")
    pdf.bullet("대표 후보: FinTrack(재테크 2030) — 기능·브랜드·최근 투자")
    pdf.bullet("허브: youngjae-hub — 13개 사이트 링크 모음")
    pdf.bullet("주제별: MBTI, Feynman, 유튜브순위, 연예뉴스, 부동산 등")
    pdf.sub("2티어 전략")
    pdf.box(
        "Tier A (집중): FinTrack + (1개 선택 — 트래픽/수익 가능성 높은 것)\n"
        "  → 주 1회 UI/기능/콘텐츠 개선, SEO, AdSense 최적화\n\n"
        "Tier B (유지): 허브 + 나머지\n"
        "  → 깨진 링크·404만 수리, 대규모 기능 추가 안 함\n\n"
        "Tier C (보류): 아이디어만, 미배포 또는 archived"
    )
    pdf.sub("FinTrack에 '깊이' 넣는 구체적 예")
    pdf.bullet("주식: 실시간 시세 API 안정화, 추천 로직 설명 페이지")
    pdf.bullet("다국어: 영어 페이지 콘텐츠 확장 (서브페이지 data-i18n)")
    pdf.bullet("SEO: 페이지별 title/description")
    pdf.bullet("성능: LCP, 이미지 lazy load")
    pdf.bullet("신뢰: 운영자 소개, 개인정보, 문의 실제 동작")
    pdf.bad("'새 사이트 10개 아이디어 더 만들어줘' (Tier A 방치)")
    pdf.good(
        "이번 달 FinTrack만:\n"
        "1) stock-price 차트/데이터 안정화\n"
        "2) 영어 stock-education 번역\n"
        "3) 모바일 메뉴 UX\n"
        "→ MBTI 등은 Tier B 유지만"
    )
    pdf.sub("오늘부터 실천")
    pdf.checklist([
        "Tier A 사이트 2개만 적고 나머지 B/C 분류",
        "새 아이디어는 '보류함' — Tier A 완료 전 시작 안 함",
        "월 1회: B티어 중 폐기/통합 1개 검토",
        "AdSense는 Tier A부터 승인·최적화",
    ])


def section6(pdf):
    pdf.add_page()
    pdf.section("6", "완료 기준을 미리 안 정함",
                "끝이 어디인지 정하면 '반쯤 된 것'과 '진짜 끝'이 구분됩니다.")
    pdf.sub("왜 문제인가")
    pdf.body(
        "'만들어줘'만 있으면 AI는 코드 작성까지만 하고 끝낼 수 있습니다. "
        "테스트·배포·GitHub·모바일 확인·200 OK는 별도 요청이 필요합니다. "
        "최근 '오류 없게 테스트 + GitHub + Firebase'처럼 말하면 결과가 훨씬 좋았습니다."
    )
    pdf.sub("완료 조건 레벨 (필요한 만큼만 고르기)")
    pdf.bullet("L1 코드: 파일 수정 완료")
    pdf.bullet("L2 로컬: 브라우저에서 파일 열어 확인")
    pdf.bullet("L3 배포: firebase deploy + URL 200 OK")
    pdf.bullet("L4 Git: commit + push origin main")
    pdf.bullet("L5 QA: PC+모바일, 다크/라이트, 클릭 3곳")
    pdf.bullet("L6 문서: 변경 요약 3줄 (선택)")
    pdf.sub("작업 유형별 권장 완료 조건")
    pdf.box(
        "UI만: L1 + L3 + L5 (다크/라이트)\n"
        "버그 수정: L3 + L5 + '이 URL 이 버튼' 재현 불가\n"
        "신규 페이지: L3 + L4 + L5 + 내비 링크 연결\n"
        "AdSense: L3 + ads.txt/meta + AdSense 콘솔 URL 등록 안내"
    )
    pdf.bad("'크롬 바 만들어줘' (끝이 어디?)")
    pdf.good(
        "크롬 바: 다크/라이트·KO/EN, localStorage 저장\n"
        "완료: L3+L4+L5 (홈·stock-education)\n"
        "배포: fintrack2030-248bf\n"
        "확인: 라이트 모드 헤더 흰색, EN 메뉴 aria-label"
    )
    pdf.template(
        "[완료 조건 템플릿 — 요청 맨 아래 붙이기]\n"
        "완료 조건:\n"
        "[ ] PC 확인  [ ] 모바일 확인\n"
        "[ ] firebase deploy (프로젝트: ___)\n"
        "[ ] git push\n"
        "[ ] URL 200 OK: ___\n"
        "[ ] (선택) 커밋 메시지: ___"
    )
    pdf.sub("오늘부터 실천")
    pdf.checklist([
        "모든 '만들어줘' 요청 끝에 완료 조건 1줄",
        "FinTrack은 기본 L3+L4+L5를 습관화",
        "AI 답변 받은 후 직접 L5만이라도 1분 체크",
        "'됐어?' 대신 체크리스트 항목별 O/X",
    ])


def summary_page(pdf):
    pdf.add_page()
    pdf.set_font("KR", "B", 16)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "한 페이지 요약 · 매 요청 전 30초 점검", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    pdf.box(
        "1. 범위: 이번 1~3개만. 나머지 '다음 턴'.\n"
        "2. 재작업: URL + 기기 + 기대 + 실제 + 캡처.\n"
        "3. 인프라: GitHub=코드, Hosting=웹주소, Run=서버, AdSense=광고.\n"
        "4. 확인: 배포 후 시크릿 창 1분 체크 후 AI에게.\n"
        "5. 깊이: Tier A 2개 집중, 나머지 유지.\n"
        "6. 완료: L3 deploy + L4 push + L5 모바일까지 명시."
    )
    pdf.ln(4)
    pdf.set_font("KR", "B", 12)
    pdf.set_text_color(161, 98, 7)
    pdf.cell(0, 8, "궁극 목표", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("KR", "", 11)
    pdf.set_text_color(30, 41, 59)
    pdf.multi_cell(0, 7,
        "많이 시키는 사람 → 정확히 시키고, 직접 확인하고, "
        "대표작을 깊게 가져가는 운영자."
    )
    pdf.ln(6)
    pdf.set_font("KR", "", 9)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 6, "관련 파일: 앱-만들기-용어-꿀팁.pdf · 나의-성장-가이드-Cursor-AI-대화-분석.pdf", align="C")


def build():
    pdf = DetailPDF()
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.title_page()
    section1(pdf)
    section2(pdf)
    section3(pdf)
    section4(pdf)
    section5(pdf)
    section6(pdf)
    summary_page(pdf)
    pdf.output(str(OUT))
    print(f"OK: {OUT}")
    print(f"SIZE: {OUT.stat().st_size}")


if __name__ == "__main__":
    build()
