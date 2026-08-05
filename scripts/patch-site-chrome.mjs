import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const early = `  <link rel="stylesheet" href="/css/site-chrome.css?v=20260805">
  <script>
    try {
      var t = localStorage.getItem("ft_theme");
      document.documentElement.setAttribute("data-theme", t === "light" ? "light" : "dark");
      var l = localStorage.getItem("ft_lang");
      if (l === "en") document.documentElement.setAttribute("lang", "en");
    } catch (e) {}
  </script>
`;

const scriptTag = `  <script src="/js/site-chrome.js?v=20260805" defer></script>\n`;

let n = 0;
for (const file of walk(publicDir)) {
  let html = readFileSync(file, "utf8");
  if (html.includes("site-chrome.js")) continue;
  if (!html.includes("</head>") || !html.includes("</body>")) continue;
  if (!html.includes("site-chrome.css")) {
    html = html.replace("</head>", early + "</head>");
  }
  html = html.replace("</body>", scriptTag + "</body>");
  writeFileSync(file, html, "utf8");
  n += 1;
  console.log("patched", relative(process.cwd(), file));
}
console.log("done", n);
