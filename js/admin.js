const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const msg = (s, t) => $(s).textContent = t || "";
const BUCKET = "media", KEYS = ["name", "tagline", "intro", "bio", "email", "role", "location", "avail", "stats", "services", "skills"];
let sb, items = [], editId = null;

function show(on) {
  $("#login").hidden = on; $("#panel").hidden = !on; $("#logout").hidden = !on;
  if (on) { loadSettings(); loadProjects(); }
}
async function init() {
  if (!CFG.ok) { msg("#loginMsg", "Add your Supabase URL and key in js/config.js first."); return; }
  sb = supabase.createClient(CFG.url, CFG.key);
  const { data: { session } } = await sb.auth.getSession();
  show(!!session);
}
$("#loginForm").onsubmit = async e => {
  e.preventDefault(); if (!sb) return;
  const { error } = await sb.auth.signInWithPassword({ email: $("#em").value, password: $("#pw").value });
  error ? msg("#loginMsg", error.message) : show(true);
};
$("#logout").onclick = async () => { await sb.auth.signOut(); show(false); };

function addRow(label = "", url = "") {
  const d = document.createElement("div"); d.className = "row lrow";
  d.innerHTML = `<input class="ll" style="flex:1" placeholder="Label (Facebook)" value="${esc(label)}"><input class="lu" style="flex:2" placeholder="https://..." value="${esc(url)}"><button type="button" class="del">✕</button>`;
  $("#linkList").append(d);
}
$("#addLink").onclick = () => addRow();
$("#linkList").onclick = e => { if (e.target.classList.contains("del")) e.target.closest(".lrow").remove(); };
async function loadSettings() {
  const { data } = await sb.from("settings").select("*");
  const set = Object.fromEntries((data || []).map(r => [r.key, r.value]));
  KEYS.forEach(k => { const el = $("#s_" + k); if (el) el.value = set[k] || ""; });
  let L = []; try { L = JSON.parse(set.links || "[]"); } catch (e) {}
  if (!L.length && set.links === undefined) [["Instagram", set.instagram], ["Behance", set.behance]].forEach(([l, u]) => u && L.push({ label: l, url: u }));
  $("#linkList").innerHTML = ""; L.forEach(x => addRow(x.label, x.url));
}
$("#saveS").onclick = async () => {
  const rows = KEYS.map(k => ({ key: k, value: $("#s_" + k).value.trim() }));
  const links = [...document.querySelectorAll(".lrow")].map(r => ({ label: r.querySelector(".ll").value.trim(), url: r.querySelector(".lu").value.trim() })).filter(x => x.label && x.url);
  rows.push({ key: "links", value: JSON.stringify(links) });
  const { error } = await sb.from("settings").upsert(rows);
  msg("#sMsg", error ? error.message : "Saved ✓");
};

async function loadProjects() {
  const { data } = await sb.from("projects").select("*").order("created_at", { ascending: false });
  items = data || [];
  $("#list").innerHTML = items.map(p => `<div class="row"><div class="l">${
    p.media_type === "video" ? `<video src="${esc(p.media_url)}" muted></video>` : p.media_url ? `<img src="${esc(p.media_url)}" alt="">` : ""
  }<span><b>${esc(p.title)}</b><br><small>${esc(p.category)}</small></span></div><span><button data-e="${p.id}">Edit</button><button class="del" data-d="${p.id}">Delete</button></span></div>`).join("") || "<p>No projects yet.</p>";
}
async function rmFile(url) {
  const p = url && url.split("/" + BUCKET + "/")[1];
  if (p) await sb.storage.from(BUCKET).remove([decodeURIComponent(p)]);
}
function reset() {
  editId = null; $("#pForm").reset(); $("#pTitle").textContent = "Add Project"; $("#pReset").hidden = true;
}
$("#pReset").onclick = reset;
$("#pForm").onsubmit = async e => {
  e.preventDefault(); $("#pSave").disabled = true; msg("#pMsg", "Saving…");
  try {
    const rec = { title: $("#title").value.trim(), category: $("#category").value.trim() || "General", client: $("#client").value.trim(), description: $("#desc").value.trim(), url: $("#purl").value.trim() };
    const f = $("#file").files[0];
    if (f) {
      const path = Date.now() + "-" + f.name.replace(/[^\w.-]/g, "_");
      const up = await sb.storage.from(BUCKET).upload(path, f, { cacheControl: "31536000" });
      if (up.error) throw up.error;
      rec.media_url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      rec.media_type = f.type.startsWith("video") ? "video" : "image";
      if (editId) await rmFile(items.find(x => x.id === editId)?.media_url);
    }
    const { error } = editId ? await sb.from("projects").update(rec).eq("id", editId) : await sb.from("projects").insert(rec);
    if (error) throw error;
    reset(); await loadProjects(); msg("#pMsg", "Saved ✓");
  } catch (err) { msg("#pMsg", err.message); }
  $("#pSave").disabled = false;
};
$("#list").onclick = async e => {
  const ed = e.target.dataset.e, dl = e.target.dataset.d;
  if (ed) {
    const p = items.find(x => x.id === ed); editId = ed;
    $("#title").value = p.title; $("#category").value = p.category || ""; $("#client").value = p.client || "";
    $("#desc").value = p.description || ""; $("#purl").value = p.url || "";
    $("#pTitle").textContent = "Edit Project"; $("#pReset").hidden = false; scrollTo({ top: 0, behavior: "smooth" });
  }
  if (dl && confirm("Delete this project?")) {
    const p = items.find(x => x.id === dl); await rmFile(p?.media_url);
    await sb.from("projects").delete().eq("id", dl); loadProjects();
  }
};
init();
