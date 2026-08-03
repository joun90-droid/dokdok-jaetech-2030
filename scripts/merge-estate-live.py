from pathlib import Path

re_path = Path(__file__).resolve().parents[1] / "public" / "real-estate.html"
partial_path = Path(__file__).resolve().parents[1] / "public" / "partials" / "estate-live-dashboard.html"

html = re_path.read_text(encoding="utf-8")
partial = partial_path.read_text(encoding="utf-8")
if partial.startswith("<!--"):
    partial = partial.split("\n", 1)[1]

marker = "        <!-- @include partials/estate-live-dashboard.html -->"
old = (
    marker
    + "\n      <div class=\"container\">"
    + "\n        <div class=\"section-header\">"
    + "\n          <span class=\"section-label\">Live Map</span>"
)
new = (
    partial.rstrip()
    + "\n      </div>"
    + "\n    </section>"
    + "\n"
    + "\n    <section class=\"section estate-map-section\" id=\"estate-map-section\">"
    + "\n      <div class=\"container\">"
    + "\n        <div class=\"section-header\">"
    + "\n          <span class=\"section-label\">Live Map</span>"
)

if old not in html:
    raise SystemExit("merge anchor not found")

re_path.write_text(html.replace(old, new, 1), encoding="utf-8")
print("merged OK")
