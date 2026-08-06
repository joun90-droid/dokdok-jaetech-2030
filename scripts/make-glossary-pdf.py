# -*- coding: utf-8 -*-
import os
from fpdf import FPDF
from pathlib import Path

DESKTOP = Path(os.environ["USERPROFILE"]) / "Desktop"
OUT = DESKTOP / "앱-만들기-용어-꿀팁.pdf"
FONT = Path(r"C:\Windows\Fonts\malgun.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\malgunbd.ttf")


class GlossaryPDF(FPDF):
    def header(self):
        self.set_font("KR", "B", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "앱 만들 때 Cursor AI와 대화하는 법 · 용어 정리", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def footer(self):
        self.set_y(-12)
        self.set_font("KR", "", 8)
        self.set_text_color(130, 130, 130)
        self.cell(0, 8, f"페이지 {self.page_no()}", align="C")

    def section_title(self, title):
        self.ln(4)
        self.set_font("KR", "B", 14)
        self.set_text_color(15, 23, 42)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(202, 138, 4)
        self.set_line_width(0.6)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def sub_title(self, title):
        self.ln(2)
        self.set_font("KR", "B", 11)
        self.set_text_color(30, 41, 59)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body(self, text):
        self.set_font("KR", "", 10)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def bullet(self, text):
        self.set_font("KR", "", 10)
        self.set_text_color(30, 41, 59)
        x = self.get_x()
        self.cell(6, 6, chr(8226))
        self.multi_cell(0, 6, text)
        self.set_x(x)

    def term_row(self, term, desc):
        self.set_font("KR", "B", 10)
        self.set_text_color(161, 98, 7)
        w_term = 42
        y0 = self.get_y()
        self.multi_cell(w_term, 6, term)
        y1 = self.get_y()
        self.set_xy(10 + w_term, y0)
        self.set_font("KR", "", 10)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 6, desc)
        if self.get_y() < y1:
            self.set_y(y1)
        self.ln(1)


def build():
    pdf = GlossaryPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_font("KR", "", str(FONT))
    pdf.add_font("KR", "B", str(FONT_BOLD))
    pdf.add_page()

    pdf.set_font("KR", "B", 20)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 12, "앱 만들 때 꿀팁 & 용어 정리", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("KR", "", 11)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 8, "Cursor AI와 대화할 때 쓰면 좋은 표현 · FinTrack 등 웹앱 제작용", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    pdf.section_title("1. 소소한 꿀팁")
    pdf.bullet("원하는 화면을 말로 + 캡처하면 가장 정확합니다. 예: '저 위쪽 바 더 세련되게'보다 '크롬 바(다크/라이트·KO/EN) 슬라이딩 필 스타일로'.")
    pdf.bullet("어디를 말할지: 페이지명(index, 주식시세) + 위치(상단/헤더/카드/푸터).")
    pdf.bullet("배포까지 원하면 '깃허브 푸시 + 파이어베이스 배포'라고 명시하세요.")
    pdf.bullet("범위를 한 줄로: '커밋만' / '배포만' / 'UI만' — 과하게 안 건드립니다.")
    pdf.bullet("'세련되게'는 주관적이므로 참고 느낌을 주면 좋습니다. 예: '아이콘만', '글자 줄여', 'iOS 세그먼트처럼'.")

    pdf.section_title("2. 자주 쓰는 용어")
    terms = [
        ("크롬 바 (chrome)", "본문 말고 브라우저·앱 UI 껍데기. 최상단 다크/라이트·언어 탭도 site chrome."),
        ("헤더 / 내비", "로고·메뉴 있는 위쪽 영역. 크롬 바 바로 아래."),
        ("히어로", "첫 화면 큰 타이틀·한 줄 설명 구역."),
        ("푸터", "맨 아래 링크·저작권 영역."),
        ("반응형 (responsive)", "폰/태블릿/PC 너비에 맞춰 레이아웃이 바뀌는 것."),
        ("모바일 퍼스트", "작은 화면 기준으로 먼저 잡고, 큰 화면은 확장."),
        ("브레이크포인트", "CSS에서 레이아웃이 바뀌는 너비 (예: 768px, 1024px)."),
        ("뷰포트", "지금 보이는 화면 영역. '첫 뷰포트' = 스크롤 없이 보이는 첫 화면."),
        ("고정(fixed) / 스티키", "스크롤해도 붙어 있음. 크롬 바는 fixed."),
        ("z-index", "겹칠 때 누가 위에 올지. 바가 메뉴에 가려지면 z-index 이슈."),
        ("캐시 버스팅 (?v=)", "CSS/JS 주소 뒤 버전 붙여 옛 파일 안 보이게 함."),
        ("로컬스토리지", "브라우저에 테마·언어 등 설정 저장. 새로고침해도 유지."),
        ("i18n / 다국어", "한국어·영어처럼 언어 전환."),
        ("테마 / 다크·라이트", "색 모드. data-theme='dark|light'."),
        ("세그먼트 컨트롤", "KO | EN 처럼 한 줄에 나눠 고르는 토글 UI."),
        ("슬라이딩 필 (thumb)", "선택 항목 뒤로 미끄러지는 하이라이트 배경."),
        ("aria-label", "화면엔 안 보여도 접근성·스크린리더용 이름."),
        ("SPA", "페이지 전체를 새로 안 고치고 일부만 바꿔 이동하는 방식."),
        ("호스팅 / 배포", "만든 파일을 인터넷에 올리는 것. Firebase Hosting."),
        ("Git / 커밋 / 푸시", "코드 이력 저장 → GitHub에 올리기."),
        ("PR", "변경을 메인에 합치기 전 검토용 Pull Request."),
        ("토스트 / 모달", "잠깐 뜨는 알림 / 가운데 뜨는 창."),
        ("카드", "테두리·배경 있는 덩어리 UI (메뉴 카드 등)."),
        ("그라데이션 / 글래스", "색 번짐 / 반투명+블러 유리 느낌."),
        ("FOUC", "스타일 늦게 와서 잠깐 깨져 보이는 현상."),
        ("LCP / 성능", "큰 이미지·로딩 체감 속도 지표."),
        ("엔드포인트 / API", "데이터 받아오는 서버 주소."),
        ("JSON", "데이터 파일 형식 (시세 등)."),
        ("partial / 컴포넌트", "헤더처럼 여러 페이지에 쓰는 조각."),
        ("핫픽스", "급한 작은 버그 수정."),
        ("리그레션", "고치다 다른 데가 깨지는 것."),
    ]
    for term, desc in terms:
        if pdf.get_y() > 260:
            pdf.add_page()
        pdf.term_row(term, desc)

    pdf.add_page()
    pdf.section_title("3. 이렇게 말하면 좋아요 (예시)")
    examples = [
        "크롬 바 세그먼트, 활성은 골드 필, 아이콘만",
        "주식시세 페이지 모바일 브레이크포인트에서 카드 간격 줄여",
        "UI만 고치고 커밋·푸시·파이어베이스 배포까지",
        "라이트 모드에서 헤더가 어두우면 !important 충돌 확인해",
        "영어 전환 시 메뉴 aria-label도 같이 바꿔",
        "첫 로딩 때 CSS 깜빡임(FOUC) 없게 head에서 테마 먼저 적용",
    ]
    for ex in examples:
        pdf.bullet(f'"{ex}"')

    pdf.section_title("4. FinTrack 프로젝트 전용")
    fintrack = [
        ("site-chrome", "최상단 다크/라이트·KO/EN 바 (site-chrome.css, site-chrome.js)"),
        ("spa-nav", "페이지 일부만 바꿔 이동하는 내비 (SPA)"),
        ("fintech-theme", "사이트 기본 다크 테마 CSS"),
        ("public/", "Firebase Hosting에 올라가는 실제 웹 파일 폴더"),
        ("firebase deploy", "fintrack2030-248bf 프로젝트 Hosting 배포"),
        ("data-i18n", "HTML에 붙여 다국어 텍스트 자동 치환"),
    ]
    for term, desc in fintrack:
        pdf.term_row(term, desc)

    pdf.ln(4)
    pdf.set_font("KR", "", 9)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 6, "작성: Cursor AI · 영재 재테크 2030 프로젝트 참고용", align="C")

    pdf.output(str(OUT))
    print(f"OK: {OUT}")


if __name__ == "__main__":
    build()
