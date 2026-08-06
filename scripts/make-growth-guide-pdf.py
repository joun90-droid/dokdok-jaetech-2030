# -*- coding: utf-8 -*-
import os
from fpdf import FPDF
from pathlib import Path

DESKTOP = Path(os.environ["USERPROFILE"]) / "Desktop"
OUT = DESKTOP / "나의-성장-가이드-Cursor-AI-대화-분석.pdf"
FONT = Path(r"C:\Windows\Fonts\malgun.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\malgunbd.ttf")


class GuidePDF(FPDF):
    def header(self):
        self.set_font("KR", "B", 9)
        self.set_text_color(120, 120, 120)
        self.cell(0, 7, "Cursor AI 대화 기반 · 나의 성장 가이드", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def footer(self):
        self.set_y(-12)
        self.set_font("KR", "", 8)
        self.set_text_color(130, 130, 130)
        self.cell(0, 8, f"{self.page_no()} / {{nb}}", align="C")

    def cover_block(self):
        self.ln(20)
        self.set_font("KR", "B", 22)
        self.set_text_color(15, 23, 42)
        self.multi_cell(0, 12, "나의 성장 가이드", align="C")
        self.ln(2)
        self.set_font("KR", "", 12)
        self.set_text_color(100, 116, 139)
        self.multi_cell(0, 8, "Cursor AI와의 대화를 바탕으로 정리한\n장점 · 보완점 · 발전 로드맵", align="C")
        self.ln(8)
        self.set_font("KR", "", 10)
        self.set_text_color(161, 98, 7)
        self.cell(0, 8, "대상: 영재 (FinTrack · 멀티 웹앱 제작)", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(4)
        self.set_font("KR", "", 9)
        self.set_text_color(100, 116, 139)
        self.cell(0, 6, "작성 기준: 2026년 7~8월 대화 기록 (재테크 2030, AdSense, Firebase 등)", align="C")

    def section(self, num, title):
        self.ln(5)
        self.set_font("KR", "B", 14)
        self.set_text_color(15, 23, 42)
        self.cell(0, 10, f"{num}. {title}", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(202, 138, 4)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def sub(self, title):
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

    def bullet(self, text, color=(30, 41, 59)):
        self.set_font("KR", "", 10)
        self.set_text_color(*color)
        x = self.get_x()
        self.cell(5, 6.5, "-")
        self.multi_cell(0, 6.5, text)
        self.set_x(x)

    def quote_box(self, text):
        y0 = self.get_y()
        self.set_fill_color(248, 250, 252)
        self.set_draw_color(226, 232, 240)
        self.set_font("KR", "I", 10)
        self.set_text_color(71, 85, 105)
        self.multi_cell(0, 7, text, border=1, fill=True)
        self.ln(2)
        if self.get_y() - y0 < 14:
            self.ln(2)

    def strength_item(self, title, desc):
        self.set_font("KR", "B", 10)
        self.set_text_color(22, 101, 52)
        self.cell(0, 7, f"+ {title}", new_x="LMARGIN", new_y="NEXT")
        self.set_font("KR", "", 10)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 6.5, desc)
        self.ln(2)

    def weakness_item(self, title, desc):
        self.set_font("KR", "B", 10)
        self.set_text_color(185, 28, 28)
        self.cell(0, 7, f"- {title}", new_x="LMARGIN", new_y="NEXT")
        self.set_font("KR", "", 10)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 6.5, desc)
        self.ln(2)

    def action_item(self, step, title, desc):
        self.set_font("KR", "B", 10)
        self.set_text_color(161, 98, 7)
        self.cell(0, 7, f"Step {step}. {title}", new_x="LMARGIN", new_y="NEXT")
        self.set_font("KR", "", 10)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 6.5, desc)
        self.ln(2)


def build():
    pdf = GuidePDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_font("KR", "", str(FONT))
    pdf.add_font("KR", "B", str(FONT_BOLD))
    pdf.add_font("KR", "I", str(FONT))

    # 표지
    pdf.add_page()
    pdf.cover_block()

    # 1. 대화에서 보이는 나의 모습
    pdf.add_page()
    pdf.section("1", "대화에서 보이는 나의 모습")
    pdf.body(
        "지금까지의 대화를 보면, 당신은 '코드를 직접 짜는 개발자'보다 "
        "'아이디어를 빠르게 서비스로 만드는 기획·운영형 메이커'에 가깝습니다. "
        "FinTrack(재테크 2030), 유튜브 순위, 연예뉴스, MBTI, 파인만 강의 등 "
        "여러 주제의 웹앱을 만들고, Firebase에 올리고, AdSense 수익화까지 "
        "연결하려는 흐름이 뚜렷합니다."
    )
    pdf.sub("대화에서 자주 나온 패턴")
    pdf.bullet("목표가 분명함: '반응형 + 서버 배포 + AdSense + 링크'")
    pdf.bullet("스크린샷으로 문제를 보여줌: '이렇게 나와', '안 눌려'")
    pdf.bullet("끝까지 밀어붙임: '다시 만들어', '재검토해', '테스트까지'")
    pdf.bullet("디테일을 다듬는 감각: '너무 화려 → 적당히', '세련되게'")
    pdf.bullet("배우려는 태도: 용어 정리 PDF 요청, '3번 어떻게 해?'")
    pdf.quote_box(
        "핵심: 당신의 강점은 '만들게 시키는 힘'이고, "
        "다음 단계는 '무엇을 우선 만들지 고르는 힘'입니다."
    )

    # 2. 장점
    pdf.section("2", "나의 장점 (이미 잘하고 있는 것)")
    strengths = [
        ("실행력이 매우 강함",
         "아이디어를 '만들어줘'로 바로 옮깁니다. 주식 추천 앱, 10개 사이트, "
         "다크/라이트·한영 전환 등 큰 요청도 끝까지 따라갑니다. "
         "메이커에게 가장 중요한 '시작과 완료'를 잘 합니다."),
        ("시각적 피드백을 잘 활용함",
         "에러·화면 캡처를 보내 '된거야?', '이건 어떻게 해?'라고 묻습니다. "
         "AI와 협업할 때 가장 효과적인 방식 중 하나입니다."),
        ("수익·배포 관점이 분명함",
         "AdSense, Firebase Hosting, GitHub 백업, 라이브 URL까지 "
         "‘실제 서비스’ 관점으로 생각합니다. 취미 코딩이 아니라 사업·운영 마인드입니다."),
        ("반복 개선(Iterative) 감각",
         "'무지개로 → 너무 화려 → 적당히', '크롬 바 세련되게'처럼 "
         "1차 결과를 보고 취향을 조율합니다. 좋은 제품은 이렇게 다듬어집니다."),
        ("브랜드 의식",
         "'영재', '2030' 등 이름·톤을 사이트마다 통일하려 합니다. "
         "여러 앱을 허브(youngjae-hub)로 묶는 것도 포트폴리오형 사고입니다."),
        ("학습 의지",
         "용어 정리, GitHub Secret 설정, Firebase vs Cloud Run 차이 등 "
         "모르는 것을 숨기지 않고 물어봅니다. 이게 성장 속도를 결정합니다."),
    ]
    for title, desc in strengths:
        if pdf.get_y() > 250:
            pdf.add_page()
        pdf.strength_item(title, desc)

    # 3. 보완점
    pdf.add_page()
    pdf.section("3", "보완하면 좋은 점 (성장 포인트)")
    weaknesses = [
        ("한 번에 범위가 너무 큼",
         "'10개 다 만들어', '기사 연동 + 차트 + UI + AdSense'처럼 "
         "한 메시지에 요구가 많으면 품질·속도·비용이 흔들립니다. "
         "2~3개씩 끊는 연습이 필요합니다."),
        ("‘다시 해’가 때로 모호함",
         "'제대로 안 됐어', '다시 봐봐'만으로는 원인 특정이 어렵습니다. "
         "스크린샷은 잘 보내지만, '기대 vs 실제' 한 줄 추가면 더 빠릅니다."),
        ("인프라 개념 혼동",
         "Firebase Hosting / Cloud Run / 서버비 / AdSense 승인 상태 등 "
         "‘어디에 올라가 있고 무엇이 돈이 드는지’ 헷갈릴 때가 있습니다. "
         "한 번 정리해 두면 같은 질문이 줄어듭니다."),
        ("직접 확인 루틴 부족",
         "'된거야?', '아직 안 된거지?' — 배포 후 URL 직접 열어보는 "
         "1분 체크를 습관화하면 대화 횟수가 줄고 자신감이 올라갑니다."),
        ("깊이 vs 넓이",
         "사이트 수는 많아지지만, FinTrack처럼 '대표작 1~2개'를 "
         "깊게 가져가면 AdSense·트래픽·브랜드 모두 유리합니다."),
        ("완료 기준을 미리 안 정하는 경우",
         "'오류 없게 테스트 + GitHub + Firebase'처럼 "
         "완료 조건을 말하면 결과가 훨씬 깔끔합니다. (최근에는 잘 하고 계십니다)"),
    ]
    for title, desc in weaknesses:
        if pdf.get_y() > 245:
            pdf.add_page()
        pdf.weakness_item(title, desc)

    # 4. 발전 로드맵
    pdf.add_page()
    pdf.section("4", "앞으로 이렇게 하면 더 빨리 성장합니다")
    actions = [
        ("요청은 3줄 템플릿으로",
         "① 무엇을 (페이지/기능)  ② 어떻게 (세련되게/반응형/영어)  "
         "③ 완료 조건 (테스트·배포·커밋). 예: 'FinTrack 크롬 바 아이콘 세그먼트로, "
         "라이트 모드 헤더 흰색, 배포까지.'"),
        ("‘다시 해’ 대신 4요소",
         "URL + 스크린샷 + 기대 동작 + 실제 동작. "
         "예: '화이트 눌렀는데 헤더가 검정'."),
        ("사이트 목록 1장 관리",
         "이름 | URL | Firebase 프로젝트 | AdSense | 마지막 수정일. "
         "지금 13개+ 허브 사이트가 있으니 표 하나로 정리하면 혼란이 줄어듭니다."),
        ("주 1회 10분 점검",
         "대표 URL 3개만: 모바일/PC, 다크·라이트, 링크 클릭. "
         "직접 확인 → 문제만 AI에 보내기."),
        ("대표작 2개 집중",
         "FinTrack(재테크) + 허브 또는 1개 히트 주제. "
         "나머지는 '유지' 모드, 대표작만 '업그레이드' 모드."),
        ("용어 1주에 5개",
         "이미 만든 용어 PDF에서 크롬 바, 반응형, 배포, SPA, 캐시 버스팅부터. "
         "말이 익숙해지면 요청 정확도가 올라갑니다."),
        ("아이디어·구현 분리",
         "'10개 아이디어 줘' → 골라서 '이번 주는 2개만'. "
         "기획과 구현 세션을 나누면 번아웃이 줄어듭니다."),
        ("비용·인프라 치트시트",
         "Firebase Hosting 무료 한도, Cloud Run 과금, AdSense는 호스팅과 별개 — "
         "한 번 PDF/메모로 정리해 두고 반복 질문 제거."),
    ]
    for i, (title, desc) in enumerate(actions, 1):
        if pdf.get_y() > 240:
            pdf.add_page()
        pdf.action_item(i, title, desc)

    # 5. AI에게 이렇게 말하면 효율 2배
    pdf.add_page()
    pdf.section("5", "AI에게 이렇게 말하면 효율이 2배")
    pdf.sub("잘 맞았던 요청 (계속 하세요)")
    pdf.bullet("스크린샷 + '이 화면에서 ○○가 안 됨'")
    pdf.bullet("'테스트하고 GitHub·Firebase까지'")
    pdf.bullet("'세련되게' + 참고 ('iOS 세그먼트처럼')")
    pdf.bullet("'용어 정리 PDF 바탕화면' — 학습+실행 연결")
    pdf.ln(2)
    pdf.sub("더 좋아질 요청")
    pdf.bullet("'10개 다' → '우선 2개: FinTrack, ○○'")
    pdf.bullet("'다시 해' → '○○ 버튼 클릭 시 △△ 대신 □□ 나옴'")
    pdf.bullet("'서버에 올려' → 'Firebase Hosting fintrack2030-248bf에 deploy'")
    pdf.ln(2)
    pdf.quote_box(
        "당신은 '만드는 사람'입니다. 다음 레벨은 '고르는 사람' + '확인하는 사람'입니다."
    )

    # 6. 30일 실천 체크리스트
    pdf.section("6", "30일 실천 체크리스트")
    checklist = [
        "사이트 URL 목록 표 만들기 (Excel/Notion/메모)",
        "FinTrack 주 1회 직접 모바일 점검",
        "요청 전 3줄 템플릿 3번 연습",
        "용어 PDF에서 주 5개 암기",
        "AdSense/Firebase 설정 메모 1장",
        "신규 아이디어는 '보류함'에 넣고 주 2개만 구현",
        "배포 후 URL 200 OK 직접 확인",
        "대표작 1개 UI 개선 (크롬 바처럼 작은 것부터)",
    ]
    for item in checklist:
        pdf.set_font("KR", "", 10)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(8, 7, "[ ]")
        pdf.multi_cell(0, 7, item)
        pdf.ln(1)

    # 7. 한 줄 요약
    pdf.ln(4)
    pdf.section("7", "한 줄 요약")
    pdf.set_font("KR", "B", 12)
    pdf.set_text_color(15, 23, 42)
    pdf.multi_cell(
        0, 8,
        "장점: 아이디어 → 배포 → 수익까지 밀어붙이는 실행력과 "
        "스크린샷 기반 소통.\n\n"
        "다음: 범위 줄이기 · 직접 확인 · 대표작 집중 · 용어 익히기.\n\n"
        "목표: '많이 만든 사람' → '잘 돌아가는 서비스를 운영하는 사람'."
    )
    pdf.ln(6)
    pdf.set_font("KR", "", 9)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 6, "본 문서는 Cursor AI와의 실제 대화 패턴을 바탕으로 작성되었습니다.", align="C")
    pdf.ln(2)
    pdf.cell(0, 6, "2026년 8월 · 개인 성장용 (비공개)", align="C")

    pdf.output(str(OUT))
    print(f"OK: {OUT}")
    print(f"SIZE: {OUT.stat().st_size}")


if __name__ == "__main__":
    build()
