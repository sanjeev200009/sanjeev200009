// Builds the animated "Meridian" panels for the profile README.
// Usage: node scripts/build.mjs   (writes assets/*.svg)
// GitHub strips CSS/JS from READMEs, so all motion lives inside these SVGs.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const OUT = join(HERE, "..", "assets");
mkdirSync(OUT, { recursive: true });
const FONTS = JSON.parse(readFileSync(join(HERE, "fonts.json"), "utf8"));
const img = (name) => `data:image/jpeg;base64,${readFileSync(join(HERE, "img", name + ".jpg")).toString("base64")}`;

// ── Tokens ─────────────────────────────────────────────
const PAPER = "#ebeee7", PAPER_2 = "#e2e6dd", INK = "#2b3a30", INK_SOFT = "#3d4a41", MUTED = "#6b746c", EDGE = "#cfd5ca", ACCENT = "#4f6b55";
const SERIF = "fraunces600", SANS = "inter400", SANS_M = "inter500", SANS_B = "inter600", MONO = "mono400", MONO_M = "mono500";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const measure = (font, size, s, ls = 0) =>
  [...s].reduce((w, ch) => w + (FONTS[font].widths[ch] ?? 0.55), 0) * size + ls * Math.max(0, s.length - 1);
function wrap(s, font, size, maxW) {
  const lines = [];
  let line = "";
  for (const word of s.split(" ")) {
    const next = line ? line + " " + word : word;
    if (line && measure(font, size, next) > maxW) { lines.push(line); line = word; } else line = next;
  }
  return line ? [...lines, line] : lines;
}

const BASE_CSS = `
  .in{animation:in 1s cubic-bezier(.22,1,.36,1) both}
  @keyframes in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .rv{animation:rv 14s cubic-bezier(.22,1,.36,1) infinite both}
  @keyframes rv{0%{opacity:0;transform:translateY(12px)}6%,90%{opacity:1;transform:none}96%,100%{opacity:0;transform:none}}
  .hv{opacity:0;animation:hv 14s ease infinite both}
  @keyframes hv{0%,1%{opacity:0}3%,9%{opacity:1}12%,100%{opacity:0}}
  .pulse{transform-box:fill-box;transform-origin:center;animation:pulse 1.8s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:.25;transform:scale(2.2)}}
  .ul{transform-box:fill-box;transform-origin:left center;animation:ul 7s cubic-bezier(.22,1,.36,1) infinite both}
  @keyframes ul{0%{transform:scaleX(0)}12%,72%{transform:scaleX(1)}84%,100%{transform:scaleX(0)}}
  .kb{transform-box:fill-box;transform-origin:center;animation:kb 18s ease-in-out infinite alternate}
  @keyframes kb{from{transform:scale(1)}to{transform:scale(1.06)}}
  .spin{transform-box:fill-box;transform-origin:center;animation:spin 90s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .sway{transform-box:fill-box;transform-origin:center;animation:sway 6s ease-in-out infinite alternate}
  @keyframes sway{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
  @media (prefers-reduced-motion:reduce){.in,.rv,.pulse,.ul,.kb,.spin,.sway{animation:none!important}.hv,.tw{animation:none!important;opacity:0}}`;

// ── Document builder ───────────────────────────────────
function doc(w, h, label) {
  const fonts = new Set();
  const parts = [], defs = [];
  let css = "", uid = 0;
  const d = {
    w, h,
    id: (p) => `${p}${++uid}`,
    add: (s) => parts.push(s),
    def: (s) => defs.push(s),
    css: (s) => (css += s),
    font: (f) => fonts.add(f),
    // text: o = {f, size, fill, anchor, ls, cls, delay, weight}
    t(x, y, s, o = {}) {
      const f = o.f || SANS; fonts.add(f);
      const attrs = [
        `x="${x}"`, `y="${y}"`, `font-family="${f}"`, `font-size="${o.size || 16}"`, `fill="${o.fill || INK}"`,
        o.anchor && `text-anchor="${o.anchor}"`, o.ls && `letter-spacing="${o.ls}"`,
        o.cls && `class="${o.cls}"`, o.delay != null && `style="animation-delay:${o.delay}s"`,
      ].filter(Boolean).join(" ");
      parts.push(`<text ${attrs} xml:space="preserve">${o.raw ? s : esc(s)}</text>`);
    },
    render() {
      const faces = [...fonts].map((f) => `@font-face{font-family:"${f}";src:url(data:font/woff2;base64,${FONTS[f].woff2}) format("woff2")}`).join("");
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<style>${faces}text{font-kerning:normal}${BASE_CSS}${css}</style>
<defs>${defs.join("")}</defs>
${parts.join("\n")}
</svg>\n`;
    },
  };
  return d;
}
const save = (name, d) => writeFileSync(join(OUT, name + ".svg"), d.render());

// ── Shared pieces ──────────────────────────────────────
const COMPASS = `
  <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" stroke-width="2.2"/>
  <circle cx="32" cy="32" r="25.5" fill="none" stroke="currentColor" stroke-width=".8" opacity=".5"/>
  <g fill="currentColor" opacity=".85"><path d="M32 32 L46 18 L35.2 34.4 Z"/><path d="M32 32 L46 46 L29.6 35.2 Z"/><path d="M32 32 L18 46 L28.8 29.6 Z"/><path d="M32 32 L18 18 L34.4 28.8 Z"/></g>
  <g stroke="currentColor" stroke-width="1" stroke-linejoin="round">
    <path d="M32 8 L35.5 28.5 L32 32 Z" fill="currentColor"/><path d="M32 8 L28.5 28.5 L32 32 Z" fill="none"/>
    <path d="M56 32 L35.5 35.5 L32 32 Z" fill="currentColor"/><path d="M56 32 L35.5 28.5 L32 32 Z" fill="none"/>
    <path d="M32 56 L28.5 35.5 L32 32 Z" fill="currentColor"/><path d="M32 56 L35.5 35.5 L32 32 Z" fill="none"/>
    <path d="M8 32 L28.5 28.5 L32 32 Z" fill="currentColor"/><path d="M8 32 L28.5 35.5 L32 32 Z" fill="none"/>
  </g>
  <circle cx="32" cy="32" r="1.8" fill="${PAPER}" stroke="currentColor" stroke-width="1"/>`;
const compass = (x, y, size, cls = "") =>
  `<g transform="translate(${x} ${y}) scale(${size / 64})" color="${INK}"><g class="${cls}">${COMPASS}</g></g>`;

function corners(x, y, w, h, len = 14, op = 0.55) {
  const p = (x0, y0, dx, dy) => `M${x0 + dx * len} ${y0}H${x0}V${y0 + dy * len}`;
  return `<path d="${p(x, y, 1, 1)} ${p(x + w, y, -1, 1)} ${p(x, y + h, 1, -1)} ${p(x + w, y + h, -1, -1)}" fill="none" stroke="${INK}" stroke-opacity="${op}" stroke-width="1.2"/>`;
}
function card(d, { inset = 12 } = {}) {
  d.add(`<rect x=".5" y=".5" width="${d.w - 1}" height="${d.h - 1}" rx="18" fill="${PAPER}" stroke="${EDGE}"/>`);
  d.add(`<rect x="${inset}" y="${inset}" width="${d.w - inset * 2}" height="${d.h - inset * 2}" rx="10" fill="none" stroke="${INK}" stroke-opacity=".12"/>`);
  d.add(corners(inset, inset, d.w - inset * 2, d.h - inset * 2));
}
function eyebrow(d, x, y, num, label, o = {}) {
  const s = `${num} / ${label.toUpperCase()}`;
  const w = measure(MONO_M, 12.5, s, 1.6);
  const anchor = o.anchor || "start";
  const x0 = anchor === "middle" ? x - w / 2 : x;
  d.add(`<g class="in" style="animation-delay:${o.delay ?? 0}s">`);
  d.add(`<path d="M${x0 - 34} ${y - 4.5}h22" stroke="${INK}" stroke-opacity=".5"/>`);
  d.t(x, y, s, { f: MONO_M, size: 12.5, fill: MUTED, ls: 1.6, anchor });
  if (anchor === "middle") d.add(`<path d="M${x0 + w + 12} ${y - 4.5}h22" stroke="${INK}" stroke-opacity=".5"/>`);
  d.add(`</g>`);
}
// Tool chips: staggered reveal, then a simulated hover sweep (ink fill) runs across them
function chips(d, x, y, labels, { maxW, size = 14, start = 0.5, sweep = 3 } = {}) {
  const h = size * 2.3, padX = size * 1.05, gap = 8;
  let cx = x, cy = y;
  labels.forEach((label, i) => {
    const w = measure(SANS_M, size, label) + padX * 2;
    if (cx > x && cx + w > x + maxW) { cx = x; cy += h + gap; }
    d.font(SANS_M);
    d.add(`<g class="rv" style="animation-delay:${(start + i * 0.12).toFixed(2)}s">
      <rect x="${cx}" y="${cy}" width="${w.toFixed(1)}" height="${h}" rx="${h / 2}" fill="${PAPER}" stroke="${INK}" stroke-opacity=".45"/>
      <text x="${(cx + w / 2).toFixed(1)}" y="${cy + h / 2 + size * 0.36}" text-anchor="middle" font-family="${SANS_M}" font-size="${size}" fill="${INK}">${esc(label)}</text>
      <g class="hv" style="animation-delay:${(sweep + i * 0.85).toFixed(2)}s">
        <rect x="${cx}" y="${cy}" width="${w.toFixed(1)}" height="${h}" rx="${h / 2}" fill="${INK}"/>
        <text x="${(cx + w / 2).toFixed(1)}" y="${cy + h / 2 + size * 0.36}" text-anchor="middle" font-family="${SANS_M}" font-size="${size}" fill="${PAPER}">${esc(label)}</text>
      </g></g>`);
    cx += w + gap;
  });
  return cy + h;
}
// Duotone "printed plate" with a slow drift, framed with corner ticks
function plate(d, x, y, w, h, src, { pos = "xMidYMid" } = {}) {
  const id = d.id("clip");
  d.def(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/></clipPath>`);
  d.add(`<g clip-path="url(#${id})"><image class="kb" href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${pos} slice"/></g>`);
  d.add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${INK}" stroke-opacity=".35"/>`);
  d.add(corners(x - 6, y - 6, w + 12, h + 12, 12, 0.6));
}
function para(d, x, y, s, { f = SANS, size = 16, fill = INK_SOFT, maxW, lh = 1.6, delay = 0.2, anchor } = {}) {
  const lines = wrap(s, f, size, maxW);
  d.add(`<g class="in" style="animation-delay:${delay}s">`);
  lines.forEach((l, i) => d.t(x, y + i * size * lh, l, { f, size, fill, anchor }));
  d.add(`</g>`);
  return y + (lines.length - 1) * size * lh;
}
function title(d, x, y, s, { size = 44, maxW = 1000, delay = 0.1, anchor, lh = 1.08 } = {}) {
  const lines = wrap(s, SERIF, size, maxW);
  d.add(`<g class="in" style="animation-delay:${delay}s">`);
  lines.forEach((l, i) => d.t(x, y + i * size * lh, l, { f: SERIF, size, fill: INK, ls: -size * 0.015, anchor }));
  d.add(`</g>`);
  return y + (lines.length - 1) * size * lh;
}
function liveDot(d, x, y, label = "LIVE") {
  d.add(`<circle class="pulse" cx="${x}" cy="${y}" r="4" fill="${ACCENT}"/><circle cx="${x}" cy="${y}" r="4" fill="${ACCENT}"/>`);
  d.t(x + 12, y + 4.3, label, { f: MONO_M, size: 12, fill: ACCENT, ls: 1.4 });
}
function linkCta(d, x, y, label, delay = 0) {
  const w = measure(SANS_M, 15, label);
  d.t(x, y, label, { f: SANS_M, size: 15, fill: INK });
  d.add(`<rect class="ul" style="animation-delay:${delay}s" x="${x}" y="${y + 6}" width="${w.toFixed(1)}" height="1.3" fill="${INK}"/>`);
}

// ── 1. Nav items (each a separate clickable image) ─────
const NAV = [["Profile", "profile"], ["Award", "award"], ["Work", "work"], ["Capabilities", "capabilities"], ["Journey", "journey"], ["Contact", "contact"]];
// Items sit flush side by side; together their paper backgrounds form one rounded bar.
NAV.forEach(([label], i) => {
  const size = 16, first = i === 0, last = i === NAV.length - 1;
  const padL = first ? 30 : 0, dot = first ? 0 : 34, padR = last ? 30 : 0, tw = measure(SANS_M, size, label);
  const w = Math.ceil(padL + dot + tw + padR), h = 48;
  const d = doc(w, h, label);
  // oversized rect: only the outer ends of the bar show rounded corners
  d.add(`<rect x="${first ? 0.5 : -40}" y=".5" width="${w + (first ? 0 : 40) + (last ? -1 : 40)}" height="${h - 1}" rx="24" fill="${PAPER}" stroke="${EDGE}"/>`);
  if (dot) d.add(`<circle cx="${dot / 2}" cy="24" r="2.4" fill="${INK}" opacity=".7"/>`);
  const x = padL + dot;
  d.t(x, 29.5, label, { f: SANS_M, size, fill: INK });
  d.add(`<rect class="ul" style="animation-delay:${(i * 1.1).toFixed(1)}s" x="${x}" y="35" width="${tw.toFixed(1)}" height="1.4" fill="${INK}"/>`);
  save(`nav-${NAV[i][1]}`, d);
});

// ── 2. Section heads ───────────────────────────────────
function sectionHead(name, num, label, heading, sub) {
  const d = doc(1200, sub ? 236 : 190, heading);
  card(d);
  d.add(`<g class="in">${compass(582, 34, 36, "sway")}</g>`);
  eyebrow(d, 600, 104, num, label, { anchor: "middle", delay: 0.05 });
  title(d, 600, 158, heading, { size: 46, anchor: "middle", delay: 0.12 });
  if (sub) para(d, 600, 200, sub, { size: 17, maxW: 900, anchor: "middle", delay: 0.22 });
  save(name, d);
}
sectionHead("head-work", "03", "Selected professional work", "Featured Projects", "Production AI, product architecture, and cloud systems built for real-world use.");
sectionHead("head-capabilities", "04", "Engineering stack // production", "Engineering Capabilities", "Four core disciplines: full-stack systems, multi-agent AI pipelines, resilient cloud architecture, and high-throughput data layers.");
sectionHead("head-github", "06", "Open source // activity", "On GitHub");

// ── 3. Profile ─────────────────────────────────────────
{
  const d = doc(1200, 600, "Studio profile — I turn complex systems into products people can use.");
  card(d);
  plate(d, 48, 48, 400, 504, img("portrait"), { pos: "xMidYMin" });
  d.add(`<g class="in" style="animation-delay:.4s"><rect x="72" y="500" width="236" height="32" rx="16" fill="${PAPER}" stroke="${INK}" stroke-opacity=".4"/></g>`);
  d.add(`<g class="in" style="animation-delay:.4s">`); liveDot(d, 90, 516, "COLOMBO, SRI LANKA"); d.add(`</g>`);
  const X = 500, W = 640;
  eyebrow(d, X + 34, 96, "01", "Studio profile", { delay: 0.05 });
  let y = title(d, X, 158, "I turn complex systems into products people can use.", { size: 46, maxW: W, delay: 0.12 });
  y = para(d, X, y + 50, "Associate Product & AI Engineer at Career141. I design and ship production AI pipelines, cloud infrastructure and full-stack products — from a multi-agent recruitment platform to high-throughput email infrastructure.", { size: 17, maxW: W, delay: 0.22 });
  const MY = y + 62;
  d.add(`<path d="M${X} ${MY - 34}H${X + W}" stroke="${INK}" stroke-opacity=".18"/>`);
  [["AI pipelines", "115K", "Profiles processed"], ["Infrastructure", "78%", "Cost reduction"], ["Recognition", "Silver", "National AI Awards 2026"]].forEach(([k, v, s], i) => {
    const cx = X + i * (W / 3);
    if (i) d.add(`<path d="M${cx - 18} ${MY - 14}V${MY + 96}" stroke="${INK}" stroke-opacity=".18"/>`);
    d.add(`<g class="rv" style="animation-delay:${0.5 + i * 0.18}s">`);
    d.t(cx, MY, k.toUpperCase(), { f: MONO_M, size: 11.5, fill: MUTED, ls: 1.4 });
    d.t(cx, MY + 58, v, { f: SERIF, size: 54, fill: INK, ls: -1 });
    d.t(cx, MY + 88, s, { f: SANS, size: 14.5, fill: INK_SOFT });
    d.add(`</g>`);
  });
  save("profile", d);
}

// ── 4. Award ───────────────────────────────────────────
{
  const d = doc(1200, 440, "Silver — Best Agentic AI Solution, National AI Awards 2026, for AURA");
  card(d);
  d.def(`<linearGradient id="silver" gradientUnits="userSpaceOnUse" x1="300" y1="0" x2="900" y2="0">
    <stop offset="0" stop-color="${INK}"/><stop offset=".42" stop-color="${INK}"/><stop offset=".5" stop-color="#a7afa4"/><stop offset=".58" stop-color="${INK}"/><stop offset="1" stop-color="${INK}"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="-700 0;700 0;700 0" keyTimes="0;.55;1" dur="5s" repeatCount="indefinite"/></linearGradient>`);
  // engraved sunburst + medal
  const rays = Array.from({ length: 72 }, (_, i) => {
    const a = (i * 5 * Math.PI) / 180, r0 = 70, r1 = i % 2 ? 150 : 175;
    return `M${(Math.cos(a) * r0).toFixed(1)} ${(Math.sin(a) * r0).toFixed(1)}L${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1).toFixed(1)}`;
  }).join("");
  d.add(`<g transform="translate(250 220)"><g class="spin"><path d="${rays}" stroke="${INK}" stroke-opacity=".16" stroke-width=".8"/></g>
    <path d="M-40 40 L-62 128 L-36 112 L-24 140 L-6 60 Z M40 40 L62 128 L36 112 L24 140 L6 60 Z" fill="${PAPER_2}" stroke="${INK}" stroke-width="1.4"/>
    <path d="M-46 76 L-56 118 M46 76 L56 118" stroke="${INK}" stroke-opacity=".35"/>
    <circle r="66" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/><circle r="58" fill="none" stroke="${INK}" stroke-width=".8" opacity=".5"/>
    ${Array.from({ length: 40 }, (_, i) => { const a = (i * 9 * Math.PI) / 180; return `<path d="M${(Math.cos(a) * 60).toFixed(1)} ${(Math.sin(a) * 60).toFixed(1)}L${(Math.cos(a) * 64).toFixed(1)} ${(Math.sin(a) * 64).toFixed(1)}" stroke="${INK}" stroke-width=".7"/>`; }).join("")}
    ${compass(-40, -40, 80, "sway")}
  </g>`);
  const X = 470;
  eyebrow(d, X + 34, 108, "02", "Recognition", { delay: 0.05 });
  d.add(`<g class="in" style="animation-delay:.15s"><text x="${X}" y="200" font-family="${SERIF}" font-size="96" letter-spacing="-2" fill="url(#silver)">Silver</text></g>`);
  d.t(X, 252, "Best Agentic AI Solution", { f: SERIF, size: 32, fill: INK, cls: "in", delay: 0.25 });
  d.t(X, 290, "National AI Awards 2026", { f: SANS_M, size: 18, fill: INK_SOFT, cls: "in", delay: 0.32 });
  para(d, X, 336, "Awarded for AURA — the AI Unified Recruitment Agent: an agentic platform for candidate screening, evaluation and interview workflows.", { size: 15.5, fill: MUTED, maxW: 650, delay: 0.4, lh: 1.55 });
  save("award", d);
}

// ── 5. Flagship project cards ──────────────────────────
function flagship(name, o) {
  const d = doc(1200, 600, `${o.title} — ${o.subtitle}`);
  card(d);
  const left = o.flip ? 620 : 48, right = o.flip ? 48 : 640, W = 520;
  plate(d, left, 60, 532, 300, img(o.image));
  // project number + eyebrow under the plate
  d.t(left, 438, o.num, { f: SERIF, size: 64, fill: INK, cls: "in", delay: 0.1 });
  d.add(`<path d="M${left + 92} 418H${left + 532}" stroke="${INK}" stroke-opacity=".2"/>`);
  d.t(left + 92, 440, o.eyebrow.toUpperCase(), { f: MONO_M, size: 12, fill: MUTED, ls: 1.5, cls: "in", delay: 0.18 });
  if (o.highlight) {
    d.add(`<g class="in" style="animation-delay:.3s"><rect x="${left}" y="474" width="532" height="58" rx="10" fill="${PAPER_2}" stroke="${INK}" stroke-opacity=".3"/>${compass(left + 16, 485, 36, "sway")}</g>`);
    d.t(left + 66, 499, o.highlight[0], { f: SANS_B, size: 15, fill: INK, cls: "in", delay: 0.3 });
    d.t(left + 66, 520, o.highlight[1], { f: SANS, size: 13.5, fill: INK_SOFT, cls: "in", delay: 0.3 });
  }
  let y = title(d, right, 110, o.title, { size: 56, maxW: W });
  d.t(right, y + 42, o.subtitle, { f: SANS_M, size: 19, fill: INK_SOFT, cls: "in", delay: 0.16 });
  y = para(d, right, y + 90, o.description, { size: 16.5, maxW: W, delay: 0.24 });
  if (o.metrics) {
    o.metrics.forEach(([v, k], i) => {
      const x = right + i * 250;
      d.add(`<g class="rv" style="animation-delay:${0.35 + i * 0.15}s">`);
      d.t(x, y + 76, v, { f: SERIF, size: 44, fill: INK, ls: -1 });
      d.t(x, y + 102, k, { f: SANS, size: 14, fill: MUTED });
      d.add(`</g>`);
    });
    y += 110;
  }
  d.t(right, y + 62, "BUILT WITH", { f: MONO_M, size: 11.5, fill: MUTED, ls: 1.5, cls: "in", delay: 0.3 });
  y = chips(d, right, y + 80, o.tools, { maxW: W, size: 14.5 });
  d.t(right, y + 44, o.note, { f: SANS, size: 13.5, fill: MUTED, cls: "in", delay: 0.4 });
  save(name, d);
}
flagship("project-aura", {
  num: "01", eyebrow: "Award-winning private product", image: "aura",
  title: "AURA", subtitle: "AI Unified Recruitment Agent",
  description: "An agentic recruitment platform built to support candidate screening, evaluation, and interview workflows in one unified system.",
  highlight: ["Silver — Best Agentic AI Solution", "National AI Awards 2026"],
  tools: ["OpenAI", "Node.js", "Convex", "AWS", "Redis / BullMQ"],
  note: "Private product · built at Career141",
});
flagship("project-mailgrid", {
  num: "02", eyebrow: "Private product", image: "mailgrid-light", flip: true,
  title: "MailGrid", subtitle: "Enterprise Email Infrastructure",
  description: "A high-throughput email delivery platform designed to reduce infrastructure cost while keeping large contact operations manageable.",
  metrics: [["78%", "Infrastructure cost reduction"], ["84,085", "Contacts managed"]],
  tools: ["AWS SES", "Amazon SNS", "Express.js", "Prisma ORM", "MariaDB"],
  note: "Private product · built at Career141",
});

// ── 6. Released live work (3 cards side by side, equal height) ─
{
  const head = doc(1200, 150, "Released live work");
  card(head);
  head.t(48, 70, "03—05", { f: MONO_M, size: 13, fill: MUTED, ls: 1.5, cls: "in" });
  head.t(48, 116, "Released live work", { f: SERIF, size: 40, fill: INK, ls: -0.6, cls: "in", delay: 0.1 });
  head.t(1152, 116, "Public products you can visit now.", { f: SANS, size: 17, fill: INK_SOFT, anchor: "end", cls: "in", delay: 0.2 });
  head.add(`<g class="in" style="animation-delay:.25s">`); liveDot(head, 1080, 66, "3 LIVE"); head.add(`</g>`);
  save("head-live", head);

  const LIVE = [
    { name: "career141", num: "03", title: "Career141.com", host: "career141.com", desc: "The live digital platform for Career141, presenting its global executive search, recruitment expertise, culture, resources, and opportunities.", tools: ["Next.js", "TypeScript", "Tailwind CSS", "Cloudflare", "Supabase"] },
    { name: "vota", num: "04", title: "VOTA", host: "vota.career141.com", desc: "A released Career141 product with a focused, production-ready experience.", tools: ["Node.js", "Express.js", "PostgreSQL", "Supabase", "Cloudflare"] },
    { name: "talent-unwrapped", num: "05", title: "Talent Unwrapped", host: "talentunwrapped.career141.com", desc: "A live Career141 experience that turns talent information into a polished, shareable digital story.", tools: ["Node.js", "Express.js", "PostgreSQL", "Supabase", "Cloudflare"] },
  ];
  // two passes: measure the tallest card, then draw all three at that height
  const liveCard = (p, i, H) => {
    const d = doc(400, H, `${p.title} — live at ${p.host}`);
    card(d);
    plate(d, 32, 32, 336, 200, img(p.name));
    liveDot(d, 40, 274);
    d.t(368, 278, p.num, { f: SERIF, size: 26, fill: INK, anchor: "end", cls: "in" });
    let y = title(d, 32, 332, p.title, { size: 34, maxW: 336 });
    d.t(32, y + 30, p.host, { f: MONO, size: 12.5, fill: MUTED, cls: "in", delay: 0.15 });
    y = para(d, 32, y + 68, p.desc, { size: 15, maxW: 336, lh: 1.55 });
    const bottom = chips(d, 32, y + 30, p.tools, { maxW: 336, size: 13, start: 0.5 + i * 0.3, sweep: 3 + i * 1.6 });
    d.add(`<path d="M32 ${H - 78}H368" stroke="${INK}" stroke-opacity=".18"/>`);
    linkCta(d, 32, H - 44, "Visit live site ↗", 1 + i * 1.2);
    return { d, bottom };
  };
  const H = Math.ceil(Math.max(...LIVE.map((p, i) => liveCard(p, i, 0).bottom)) + 120);
  LIVE.forEach((p, i) => save(`live-${p.name}`, liveCard(p, i, H).d));

  [{ name: "career141-v2", title: "Career141 v2" }, { name: "talent-suite", title: "Talent Suite 2026" }].forEach((p, i) => {
    const d = doc(600, 260, `${p.title} — unreleased preview`);
    card(d);
    plate(d, 32, 32, 300, 196, img(p.name));
    d.t(362, 76, "UNRELEASED PREVIEW", { f: MONO_M, size: 11.5, fill: MUTED, ls: 1.5, cls: "in" });
    title(d, 362, 124, p.title, { size: 30, maxW: 210 });
    d.add(`<g class="rv" style="animation-delay:${0.4 + i * 0.2}s"><rect x="362" y="176" width="150" height="32" rx="16" fill="none" stroke="${INK}" stroke-opacity=".4" stroke-dasharray="3 3"/></g>`);
    d.t(437, 197, "In development", { f: SANS_M, size: 13, fill: INK_SOFT, anchor: "middle", cls: "rv", delay: 0.4 + i * 0.2 });
    save(`preview-${p.name}`, d);
  });
}

// ── 7. Capabilities: live-typed JSON windows ───────────
const CAPS = [
  { file: "architecture.json", code: "01 // ARCHITECTURE", title: "Full-Stack Web & Mobile Architecture", status: "PRODUCTION ACTIVE",
    summary: "Accessible web apps and cross-platform mobile systems with *strict TypeScript*, Next.js server components, fluid motion and *production SEO*.",
    stack: ["Next.js 15", "React.js", "React Native", "TypeScript", "Tailwind CSS", "Framer Motion", "Vite"],
    extra: [["pagesRebuilt", 50], ["ttfb", "< 1s"], ["production", true]] },
  { file: "agentic-ai.json", code: "02 // AGENTIC AI", title: "Autonomous AI & LLM Pipelines", status: "AGENT RUNTIME",
    summary: "*Multi-agent workflows* for unstructured data extraction, semantic vector matching, *Whisper speech-to-text* and conversational AI for executive search.",
    stack: ["OpenAI GPT-4o", "Claude API", "Whisper STT", "Vector Search", "Autonomous Agents", "Prompt Tuning"],
    extra: [["agents", 8], ["profilesParsed", 115000], ["autonomous", true]] },
  { file: "cloud-edge.json", code: "03 // CLOUD & EDGE", title: "Cloud Infrastructure & Edge Systems", status: "CLOUD VERIFIED",
    summary: "*Cost-effective* AWS and Cloudflare services: serverless endpoints, high-volume email dispatch, cold archive migrations and *R2 media delivery*.",
    stack: ["AWS SES / SNS", "API Gateway", "Lambda", "Cloudflare Workers", "Cloudflare R2", "Tunnels", "Docker"],
    extra: [["costReductionPct", 78], ["contactsScaled", 84000], ["serverless", true]] },
  { file: "data-queues.json", code: "04 // DATA & QUEUES", title: "Databases, Realtime & Task Queues", status: "HIGH THROUGHPUT",
    summary: "Resilient data layers: *hot/cold storage tiering*, BullMQ background queues, reactive Convex sync and *ACID-compliant PostgreSQL* schemas.",
    stack: ["Convex DB", "PostgreSQL", "Supabase", "BullMQ", "Upstash Redis", "Prisma ORM", "MariaDB"],
    extra: [["storageTiers", 2], ["hotSyncDays", 30], ["acid", true]] },
];
const SEG = { p: [MONO, MUTED], k: [MONO_M, INK], s: [MONO, INK_SOFT], h: [MONO_M, INK], n: [MONO_M, ACCENT] };
function jsonLines(c, maxChars) {
  const L = [];
  L.push([["{", "p"]]);
  // summary string, wrapped; *phrase* → highlight
  // words with whether a space preceded them, so punctuation after a *phrase* stays attached
  const tokens = [];
  let spaced = false;
  for (const seg of c.summary.split(/(\*[^*]+\*)/).filter(Boolean)) {
    const hl = seg.startsWith("*"), body = hl ? seg.slice(1, -1) : seg;
    for (const m of body.match(/\s*\S+/g) || []) { tokens.push([m.trim(), hl ? "h" : "s", spaced || /^\s/.test(m)]); spaced = false; }
    spaced = /\s$/.test(body);
  }
  let line = [['  "summary"', "k"], [": ", "p"], ['"', "s"]], len = 14, fresh = true;
  tokens.forEach(([w, kind, sp], i) => {
    const piece = (fresh || !sp ? "" : " ") + w;
    if (len + piece.length > maxChars) { L.push(line); line = [["    ", "p"], [w, kind]]; len = 4 + w.length; }
    else { line.push([piece, kind]); len += piece.length; }
    fresh = false;
    if (i === tokens.length - 1) line.push(['",', "s"]);
  });
  L.push(line);
  // stack array, wrapped
  L.push([['  "stack"', "k"], [": [", "p"]]);
  line = [["    ", "p"]]; len = 4;
  c.stack.forEach((s, i) => {
    const piece = `"${s}"` + (i < c.stack.length - 1 ? ", " : "");
    if (len + piece.length > maxChars) { L.push(line); line = [["    ", "p"]]; len = 4; }
    line.push([`"${s}"`, "s"]); if (i < c.stack.length - 1) line.push([", ", "p"]); len += piece.length;
  });
  L.push(line);
  L.push([["  ],", "p"]]);
  c.extra.forEach(([k, v], i) => L.push([[`  "${k}"`, "k"], [": ", "p"], [typeof v === "string" ? `"${v}"` : String(v), typeof v === "string" ? "s" : "n"], [i < c.extra.length - 1 ? "," : "", "p"]]));
  L.push([["}", "p"]]);
  return L;
}
CAPS.forEach((c, ci) => {
  const W = 600, size = 13, lh = 22, codeX = 44, maxChars = Math.floor((W - codeX * 2) / (FONTS[MONO].widths["a"] * size));
  const lines = jsonLines(c, maxChars);
  const titleLines = wrap(c.title, SERIF, 30, W - 88);
  const codeTop = 196 + (titleLines.length - 1) * 33;
  const H = codeTop + lines.length * lh + 64;
  const d = doc(W, H, `${c.title} — ${c.stack.join(", ")}`);
  card(d);
  // window bar
  d.add(`<path d="M12 64H${W - 12}" stroke="${INK}" stroke-opacity=".12"/>`);
  [0, 1, 2].forEach((i) => d.add(`<circle cx="${36 + i * 16}" cy="38" r="4.5" fill="none" stroke="${INK}" stroke-opacity=".5"/>`));
  d.t(92, 42.5, c.file, { f: MONO_M, size: 12.5, fill: INK });
  d.t(W - 36, 42.5, c.code, { f: MONO_M, size: 11.5, fill: MUTED, ls: 1.2, anchor: "end" });
  // status + title
  const sw = measure(MONO_M, 11, c.status, 1.3) + 40;
  d.add(`<g class="in" style="animation-delay:.1s"><rect x="36" y="88" width="${sw.toFixed(0)}" height="26" rx="13" fill="${PAPER_2}" stroke="${INK}" stroke-opacity=".3"/></g>`);
  d.add(`<g class="in" style="animation-delay:.1s"><circle class="pulse" cx="52" cy="101" r="3.5" fill="${ACCENT}"/><circle cx="52" cy="101" r="3.5" fill="${ACCENT}"/></g>`);
  d.t(64, 105, c.status, { f: MONO_M, size: 11, fill: ACCENT, ls: 1.3, cls: "in", delay: 0.1 });
  title(d, 36, 156, c.title, { size: 30, maxW: W - 88, delay: 0.15 });
  // code block with typing reveal: a paper-coloured cover over each line retracts in steps
  d.add(`<rect x="24" y="${codeTop - 20}" width="${W - 48}" height="${lines.length * lh + 26}" rx="8" fill="${PAPER_2}"/>`);
  const CYCLE = 16, SPEED = 70; // chars per second
  let t = 0.6 + ci * 0.5;
  lines.forEach((segs, li) => {
    const y = codeTop + li * lh;
    const text = segs.map(([s]) => s).join("");
    d.add(`<text x="${codeX}" y="${y}" font-family="${MONO}" font-size="${size}" xml:space="preserve">${segs.map(([s, k]) => { d.font(SEG[k][0]); return `<tspan font-family="${SEG[k][0]}" fill="${SEG[k][1]}">${esc(s)}</tspan>`; }).join("")}</text>`);
    const w = measure(MONO, size, text) + 6, dur = Math.max(text.trim().length, 1) / SPEED;
    const a = ((t / CYCLE) * 100).toFixed(2), b = (((t + dur) / CYCLE) * 100).toFixed(2);
    const n = Math.max(text.length, 1);
    d.css(`.tw${ci}_${li}{transform-box:fill-box;transform-origin:right center;animation:tw${ci}_${li} ${CYCLE}s infinite both}
      @keyframes tw${ci}_${li}{0%,${a}%{transform:scaleX(1);animation-timing-function:steps(${n},end)}${b}%,93%{transform:scaleX(0)}97%,100%{transform:scaleX(1)}}`);
    d.add(`<rect class="tw tw${ci}_${li}" x="${codeX - 2}" y="${y - 15}" width="${w.toFixed(1)}" height="21" fill="${PAPER_2}"/>`);
    t += dur + 0.08;
  });
  // blinking caret after the closing brace
  const ce = ((t / CYCLE) * 100).toFixed(2);
  d.css(`.caret${ci}{animation:caret${ci} ${CYCLE}s infinite}@keyframes caret${ci}{0%,${ce}%{opacity:0}${ce}%,93%{opacity:1}94%,100%{opacity:0}}
    .blink{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`);
  d.add(`<g class="caret${ci}"><rect class="blink" x="${codeX + 12}" y="${codeTop + (lines.length - 1) * lh - 13}" width="8" height="16" fill="${INK}"/></g>`);
  save(`cap-${ci + 1}`, d);
});

// ── 8. Journey ─────────────────────────────────────────
{
  const d = doc(1200, 560, "Career flow — Coding foundation, Freelance developer, Web Developer Intern at Career141, Associate Product & AI Engineer at Career141");
  card(d);
  eyebrow(d, 82, 92, "05", "Career flow", { delay: 0.05 });
  d.t(48, 152, "Building forward", { f: SERIF, size: 46, fill: INK, ls: -0.7, cls: "in", delay: 0.1 });
  d.t(1152, 152, "From self-taught foundations to production AI.", { f: SANS, size: 17, fill: INK_SOFT, anchor: "end", cls: "in", delay: 0.2 });
  const STEPS = [["01", "Foundation", "Coding Foundation", "2021 · self-taught"], ["02", "Independent", "Freelance Developer", "5+ web & mobile builds"], ["03", "Career141", "Web Developer Intern", "Executive search platforms"], ["04", "Current", "Associate Product & AI Engineer", "AI · Product · Cloud"]];
  const X0 = 180, X1 = 1020, Y = 236, step = (X1 - X0) / 3;
  d.add(`<path d="M${X0} ${Y}H${X1}" stroke="${INK}" stroke-opacity=".18" stroke-width="2"/>`);
  d.css(`.draw{stroke-dasharray:${X1 - X0};animation:draw 12s cubic-bezier(.65,0,.35,1) infinite both}
    @keyframes draw{0%{stroke-dashoffset:${X1 - X0}}35%,88%{stroke-dashoffset:0}96%,100%{stroke-dashoffset:${X1 - X0}}}
    .trav{animation:trav 12s cubic-bezier(.65,0,.35,1) infinite both}
    @keyframes trav{0%{transform:translateX(0);opacity:1}35%,88%{transform:translateX(${X1 - X0}px);opacity:1}96%,100%{transform:translateX(${X1 - X0}px);opacity:0}}`);
  d.add(`<path class="draw" d="M${X0} ${Y}H${X1}" stroke="${INK}" stroke-width="2.4"/>`);
  STEPS.forEach(([n, ctx, ttl, sub], i) => {
    const x = X0 + i * step, cur = i === STEPS.length - 1;
    if (cur) d.add(`<circle class="pulse" cx="${x}" cy="${Y}" r="11" fill="${ACCENT}" opacity=".5"/>`);
    d.add(`<circle cx="${x}" cy="${Y}" r="${cur ? 11 : 8}" fill="${cur ? INK : PAPER}" stroke="${INK}" stroke-width="2"/>`);
    d.add(`<g class="rv" style="animation-delay:${0.4 + i * 1.3}s">`);
    d.t(x, Y + 50, `${n} / ${ctx.toUpperCase()}`, { f: MONO_M, size: 11.5, fill: MUTED, ls: 1.3, anchor: "middle" });
    wrap(ttl, SERIF, 22, 220).forEach((l, j) => d.t(x, Y + 84 + j * 26, l, { f: SERIF, size: 22, fill: INK, anchor: "middle" }));
    d.t(x, Y + (wrap(ttl, SERIF, 22, 220).length > 1 ? 140 : 114), sub, { f: SANS, size: 14, fill: INK_SOFT, anchor: "middle" });
    d.add(`</g>`);
  });
  d.add(`<g class="trav"><circle cx="${X0}" cy="${Y}" r="4" fill="${PAPER}" stroke="${INK}" stroke-width="2"/></g>`);
  // education strip
  d.add(`<path d="M48 418H1152" stroke="${INK}" stroke-opacity=".18"/>`);
  d.t(48, 448, "EDUCATION", { f: MONO_M, size: 11.5, fill: MUTED, ls: 1.5, cls: "in", delay: 0.3 });
  [["BIT (Hons) Network & Mobile Computing", "Horizon Campus"], ["Web Development Training", "University of Moratuwa · 2024"], ["A/L Engineering Technology", "Methodist Central College · 2020"]].forEach(([a, b], i) => {
    const x = 48 + i * 372;
    d.add(`<g class="rv" style="animation-delay:${0.6 + i * 0.2}s">`);
    d.t(x, 490, a, { f: SANS_M, size: 16, fill: INK });
    d.t(x, 514, b, { f: SANS, size: 14, fill: MUTED });
    d.add(`</g>`);
  });
  save("journey", d);
}

// ── 9. Rule (kept from the previous design) ────────────
{
  const d = doc(1200, 28, "");
  d.add(`<path d="M40 14H570M630 14H1160" stroke="${INK}" stroke-opacity=".35"/>${compass(588, 2, 24, "sway")}`);
  save("rule", d);
}
console.log("built panels into", OUT);
