const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let items = [], active = "All";

function render() {
  const cats = ["All", ...new Set(items.map(p => p.category))];
  $("#filters").innerHTML = cats.map(c => `<button class="filter ${c === active ? "active" : ""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  const list = items.filter(p => active === "All" || p.category === active);
  $("#projects").innerHTML = list.map(p => `<article class="project"><div class="thumb">${
    p.media_type === "video" ? `<video src="${esc(p.media_url)}" muted autoplay loop playsinline></video>`
    : p.media_url ? `<img src="${esc(p.media_url)}" alt="${esc(p.title)}" loading="lazy">` : esc(p.category)
  }</div><div class="pinfo"><small>${esc(p.category)}${p.client ? " · " + esc(p.client) : ""}</small><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${
    p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">View project ↗</a>` : ""}</div></article>`).join("")
    || `<div class="empty">শীঘ্রই নতুন কাজ আসছে।</div>`;
}

async function boot() {
  if (!CFG.ok) { $("#projects").innerHTML = `<div class="notice">js/config.js-এ Supabase URL ও key বসালে প্রজেক্ট এখানে দেখা যাবে।</div>`; return; }
  const sb = supabase.createClient(CFG.url, CFG.key);
  const [s, p] = await Promise.all([
    sb.from("settings").select("*"),
    sb.from("projects").select("*").order("created_at", { ascending: false })
  ]);
  const set = Object.fromEntries((s.data || []).map(r => [r.key, r.value]));
  if (set.name) { $("#brandName").textContent = set.name; document.title = set.name + " — Digital Creator"; }
  if (set.tagline) $("#tagline").textContent = set.tagline;
  if (set.intro) $("#intro").textContent = set.intro;
  if (set.bio) $("#bio").textContent = set.bio;
  const links = [["Email", set.email && "mailto:" + set.email], ["Instagram", set.instagram], ["Behance", set.behance]].filter(l => l[1]);
  if (links.length) $("#contactLinks").innerHTML = links.map(([n, u]) => `<a class="pill ghost" href="${esc(u)}" target="_blank" rel="noopener">${n} ↗</a>`).join("");
  items = p.data || [];
  render();
}
$("#filters").addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (b) { active = b.dataset.c; render(); } });
boot();
