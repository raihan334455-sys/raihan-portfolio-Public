const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safe = u => { u = String(u || "").trim(); if (/^(https?:|mailto:|tel:)/i.test(u)) return u; if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return "#"; return "https://" + u; };
const lines = s => String(s || "").split("\n").map(l => l.split("|").map(x => x.trim())).filter(l => l[0]);
const ICONS = [[/instagram/, "instagram"], [/facebook|fb\.com/, "facebook-f"], [/youtu/, "youtube"], [/behance/, "behance"], [/dribbble/, "dribbble"], [/linkedin/, "linkedin-in"], [/twitter|\/\/(www\.)?x\.com/, "x-twitter"], [/tiktok/, "tiktok"], [/wa\.me|whatsapp/, "whatsapp"], [/t\.me|telegram/, "telegram"], [/github/, "github"], [/pinterest/, "pinterest"], [/discord/, "discord"], [/vimeo/, "vimeo-v"], [/fiverr/, "fiverr"], [/upwork/, "upwork"], [/figma/, "figma"], [/artstation/, "artstation"], [/snapchat/, "snapchat"], [/medium\.com/, "medium"], [/spotify/, "spotify"], [/soundcloud/, "soundcloud"]];
const icon = (l, u) => { const t = (l + " " + u).toLowerCase(); if (/^mailto:/.test(u)) return "fa-solid fa-envelope"; if (/^tel:/.test(u)) return "fa-solid fa-phone"; for (const [r, c] of ICONS) if (r.test(t)) return "fa-brands fa-" + c; return "fa-solid fa-globe"; };
const DEF = {
  role: "Creative Designer", tagline: "I design visuals that make an impact.",
  intro: "I design posters, videos and brand visuals that make your work stand out.",
  bio: "I am Raihan, a creative designer. I work with design, video and visual storytelling to create work that people remember.",
  avail: "Open to new projects",
  services: "Brand Identity|Logos, colors and brand guidelines.\nSocial Media Design|Posts, covers and campaign designs.\nPoster & Print|Posters, flyers and print-ready designs.\nVideo Editing|Reels, promos and YouTube video editing.\nMotion Graphics|Animated titles and visual effects.\nUI/UX Design|Screen designs for websites and apps.",
  skills: "Photoshop\nIllustrator\nPremiere Pro\nAfter Effects\nFigma"
};
const SVC_ICONS = ["fa-pen-nib", "fa-hashtag", "fa-print", "fa-film", "fa-wand-magic-sparkles", "fa-object-group"];
let items = [], active = "All", EMAIL = "", NAME = "RAIHAN RQR";
 
function applySettings(set) {
  const g = k => set[k] || DEF[k] || "";
  NAME = g("name") || NAME;
  document.title = NAME + " — " + g("role");
  document.querySelectorAll("#brandName,#iName,.fname").forEach(e => e.textContent = NAME);
  $("#role").textContent = g("role");
  const w = g("tagline").split(" "), n = Math.min(2, w.length - 1);
  $("#tagline").innerHTML = n > 0 ? esc(w.slice(0, -n).join(" ")) + " <em>" + esc(w.slice(-n).join(" ")) + "</em>" : esc(w.join(" "));
  $("#intro").textContent = g("intro"); $("#bio").textContent = g("bio");
  $("#availChip").textContent = g("avail"); $("#iAvail").textContent = g("avail");
  EMAIL = set.email || "";
  $("#iEmailRow").hidden = !EMAIL; $("#iEmail").textContent = EMAIL;
  $("#iLocRow").hidden = !set.location; $("#iLoc").textContent = set.location || "";
 
  const st = lines(set.stats), sIc = ["fa-calendar-check", "fa-code-branch", "fa-users", "fa-layer-group"];
  $("#statsWrap").hidden = !st.length;
  $("#stats").innerHTML = st.slice(0, 6).map((s, i) => `<div class="cd stat rv" style="--d:${i * .08}s"><i class="fa-solid ${sIc[i % 4]}"></i><div><strong data-to="${esc(s[0])}">${esc(s[0])}</strong><span>${esc(s[1] || "")}</span></div></div>`).join("");
 
  $("#svc").innerHTML = lines(g("services")).map((s, i) => `<div class="cd svc rv" style="--d:${(i % 6) * .08}s"><i class="fa-solid ${SVC_ICONS[i % 6]}"></i><h4>${esc(s[0])}</h4><p>${esc(s[1] || "")}</p></div>`).join("");
  $("#skl").innerHTML = lines(g("skills")).map((s, i) => { const p = parseInt(s[1]); return `<div class="cd skill rv" style="--d:${(i % 6) * .06}s"><div>${esc(s[0])}${p ? `<span>${p}%</span>` : ""}</div>${p ? `<div class="bar"><i data-w="${Math.min(p, 100)}"></i></div>` : ""}</div>`; }).join("");
 
  let extra = [];
  if (set.links !== undefined) { try { extra = JSON.parse(set.links).map(x => [x.label, x.url]); } catch (e) {} }
  else extra = [["Instagram", set.instagram], ["Behance", set.behance]];
  const links = [["Email", EMAIL && "mailto:" + EMAIL], ...extra].filter(l => l[1]);
  const ic = links.map(([n, u]) => { const h = safe(u); return `<a href="${esc(h)}" title="${esc(n)}" aria-label="${esc(n)}" target="_blank" rel="noopener"><i class="${icon(n, h)}"></i></a>`; }).join("");
  ["#heroLinks", "#contactLinks", "#footLinks"].forEach(s => $(s).innerHTML = ic);
  $("#cInfo").innerHTML = [[EMAIL, "fa-regular fa-envelope", "Email"], [set.location, "fa-solid fa-location-dot", "Location"], [g("avail"), "fa-regular fa-clock", "Status"]].filter(x => x[0]).map(x => `<div class="ci"><i class="${x[1]}"></i><div><small>${x[2]}</small>${esc(x[0])}</div></div>`).join("");
  observe();
}
 
function render() {
  const cats = ["All", ...new Set(items.map(p => p.category))];
  $("#filters").innerHTML = cats.map(c => `<button class="filter ${c === active ? "active" : ""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  const list = items.filter(p => active === "All" || p.category === active);
  $("#projects").innerHTML = list.map((p, i) => `<article class="cd project rv" style="--d:${(i % 3) * .1}s"><div class="thumb">${
    p.media_type === "video" ? `<video src="${esc(p.media_url)}" muted autoplay loop playsinline></video>`
    : p.media_url ? `<img src="${esc(p.media_url)}" alt="${esc(p.title)}" loading="lazy">` : esc(p.category)
  }</div><div class="pinfo"><small>${esc(p.category)}${p.client ? " · " + esc(p.client) : ""}</small><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${
    p.url ? `<a href="${esc(safe(p.url))}" target="_blank" rel="noopener">View project <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ""}</div></article>`).join("")
    || `<div class="empty">New work is coming soon.</div>`;
  observe();
}
 
function countUp(el) {
  const m = el.dataset.to.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/); if (!m) return;
  const to = parseFloat(m[2]), t0 = performance.now();
  (function f(t) { const k = Math.min((t - t0) / 1500, 1), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = m[1] + (to % 1 ? v.toFixed(1) : Math.round(v)) + m[3]; if (k < 1) requestAnimationFrame(f); })(t0);
}
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; const el = e.target; el.classList.add("in"); io.unobserve(el);
  el.querySelectorAll("[data-w]").forEach(b => b.style.width = b.dataset.w + "%");
  el.querySelectorAll("[data-to]").forEach(countUp);
}), { threshold: .15 });
function observe() { document.querySelectorAll(".rv:not(.in)").forEach(e => io.observe(e)); }
 
const sections = [...document.querySelectorAll(".links a")];
addEventListener("scroll", () => {
  let cur = "#home";
  sections.forEach(a => { const s = document.querySelector(a.getAttribute("href")); if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = a.getAttribute("href"); });
  sections.forEach(a => a.classList.toggle("on", a.getAttribute("href") === cur));
}, { passive: true });
$("#filters").addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (b) { active = b.dataset.c; render(); } });
$("#cform").addEventListener("submit", e => {
  e.preventDefault();
  if (!EMAIL) return alert("Please set the email in the admin panel first.");
  const body = $("#fm").value + "\n\n— " + $("#fn").value + " (" + $("#fe").value + ")";
  location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Message from " + $("#fn").value) + "&body=" + encodeURIComponent(body);
});
$("#yr").textContent = new Date().getFullYear();
 
async function boot() {
  applySettings({}); render();
  if (!CFG.ok) { $("#projects").innerHTML = `<div class="notice">Add your Supabase URL and key in js/config.js to show projects here.</div>`; return; }
  const sb = supabase.createClient(CFG.url, CFG.key);
  const [s, p] = await Promise.all([sb.from("settings").select("*"), sb.from("projects").select("*").order("created_at", { ascending: false })]);
  try { applySettings(Object.fromEntries((s.data || []).map(r => [r.key, r.value]))); } catch (e) { console.error("Settings error:", e); }
  if (p.error) { $("#projects").innerHTML = `<div class="notice">Could not load projects: ${esc(p.error.message)}</div>`; return; }
  items = p.data || []; render();
}
boot();
