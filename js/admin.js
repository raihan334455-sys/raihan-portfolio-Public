const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const msg = (s, t) => { const el = $(s); if (el) el.textContent = t || ""; };
const BUCKET = "media";
const KEYS = ["name", "tagline", "intro", "bio", "email", "role", "location", "avail", "stats", "services", "skills"];
let sb, items = [], editId = null;

function showLoggedOut(message = "") {
  $("#login").hidden = false;
  $("#panel").hidden = true;
  $("#logout").hidden = true;
  msg("#loginMsg", message);
}

function showAdmin() {
  $("#login").hidden = true;
  $("#panel").hidden = false;
  $("#logout").hidden = false;
  loadSettings();
  loadProjects();
}

// This is only a UI check. Supabase RLS remains the real security boundary.
async function isAdmin(user) {
  if (!user) return false;
  const { data, error } = await sb
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Admin verification failed:", error);
    throw error;
  }
  return !!data;
}

async function applySession(session) {
  if (!session) {
    showLoggedOut();
    return;
  }

  try {
    if (await isAdmin(session.user)) {
      showAdmin();
    } else {
      await sb.auth.signOut();
      showLoggedOut("This account is not an authorized admin.");
    }
  } catch (error) {
    showLoggedOut("Could not verify admin access: " + error.message);
  }
}

async function init() {
  if (!CFG.ok) {
    msg("#loginMsg", "Add your Supabase URL and publishable key in js/config.js first.");
    return;
  }
  if (!window.supabase?.createClient) {
    msg("#loginMsg", "Supabase library did not load. Check your internet connection.");
    return;
  }

  sb = window.supabase.createClient(CFG.url, CFG.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const { data: { session }, error } = await sb.auth.getSession();
  if (error) {
    showLoggedOut(error.message);
    return;
  }
  await applySession(session);

  sb.auth.onAuthStateChange((_event, nextSession) => {
    // Defer database work out of the auth callback.
    setTimeout(() => applySession(nextSession), 0);
  });
}

$("#loginForm").onsubmit = async e => {
  e.preventDefault();
  if (!sb) return;

  const button = $("#loginForm button[type='submit'], #loginForm button:not([type])");
  if (button) button.disabled = true;
  msg("#loginMsg", "Signing in…");

  const { data, error } = await sb.auth.signInWithPassword({
    email: $("#em").value.trim(),
    password: $("#pw").value
  });

  if (error) {
    msg("#loginMsg", error.message);
  } else {
    await applySession(data.session);
  }
  if (button) button.disabled = false;
};

$("#logout").onclick = async () => {
  if (!sb) return;
  const { error } = await sb.auth.signOut();
  showLoggedOut(error ? error.message : "Logged out.");
};

function addRow(label = "", url = "") {
  const d = document.createElement("div");
  d.className = "row lrow";
  d.innerHTML = `<input class="ll" style="flex:1" placeholder="Label (Facebook)" value="${esc(label)}"><input class="lu" style="flex:2" placeholder="https://..." value="${esc(url)}"><button type="button" class="del">✕</button>`;
  $("#linkList").append(d);
}
$("#addLink").onclick = () => addRow();
$("#linkList").onclick = e => {
  if (e.target.classList.contains("del")) e.target.closest(".lrow").remove();
};

async function loadSettings() {
  const { data, error } = await sb.from("settings").select("*");
  if (error) {
    msg("#sMsg", error.message);
    return;
  }
  const set = Object.fromEntries((data || []).map(r => [r.key, r.value]));
  KEYS.forEach(k => {
    const el = $("#s_" + k);
    if (el) el.value = set[k] || "";
  });

  let links = [];
  try { links = JSON.parse(set.links || "[]"); } catch (_) {}
  if (!links.length && set.links === undefined) {
    [["Instagram", set.instagram], ["Behance", set.behance]]
      .forEach(([label, url]) => url && links.push({ label, url }));
  }
  $("#linkList").innerHTML = "";
  links.forEach(x => addRow(x.label, x.url));
}

$("#saveS").onclick = async () => {
  const rows = KEYS.map(k => ({ key: k, value: $("#s_" + k).value.trim() }));
  const links = [...document.querySelectorAll(".lrow")]
    .map(r => ({
      label: r.querySelector(".ll").value.trim(),
      url: r.querySelector(".lu").value.trim()
    }))
    .filter(x => x.label && x.url);

  rows.push({ key: "links", value: JSON.stringify(links) });
  const { error } = await sb.from("settings").upsert(rows);
  msg("#sMsg", error ? error.message : "Saved ✓");
};

async function loadProjects() {
  const { data, error } = await sb
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    msg("#pMsg", error.message);
    return;
  }

  items = data || [];
  $("#list").innerHTML = items.map(p => `<div class="row"><div class="l">${ 
    p.media_type === "video"
      ? `<video src="${esc(p.media_url)}" muted></video>`
      : p.media_url ? `<img src="${esc(p.media_url)}" alt="">` : ""
  }<span><b>${esc(p.title)}</b><br><small>${esc(p.category)}</small></span></div><span><button data-e="${esc(p.id)}">Edit</button><button class="del" data-d="${esc(p.id)}">Delete</button></span></div>`).join("")
    || "<p>No projects yet.</p>";
}

async function rmFile(url) {
  const marker = "/" + BUCKET + "/";
  const path = url && url.includes(marker) ? url.split(marker)[1] : null;
  if (!path) return;
  const { error } = await sb.storage.from(BUCKET).remove([decodeURIComponent(path)]);
  if (error) console.warn("Could not remove old media file:", error.message);
}

function reset() {
  editId = null;
  $("#pForm").reset();
  $("#pTitle").textContent = "Add Project";
  $("#pReset").hidden = true;
}
$("#pReset").onclick = reset;

$("#pForm").onsubmit = async e => {
  e.preventDefault();
  $("#pSave").disabled = true;
  msg("#pMsg", "Saving…");

  try {
    const { data: { user }, error: userError } = await sb.auth.getUser();
    if (userError) throw userError;
    if (!user || !(await isAdmin(user))) {
      await sb.auth.signOut();
      throw new Error("Admin permission required. Please log in with the authorized admin account.");
    }

    const rec = {
      title: $("#title").value.trim(),
      category: $("#category").value.trim() || "General",
      client: $("#client").value.trim(),
      description: $("#desc").value.trim(),
      url: $("#purl").value.trim()
    };

    const f = $("#file").files[0];
    if (f) {
      const path = Date.now() + "-" + f.name.replace(/[^\w.-]/g, "_");
      const { error: uploadError } = await sb.storage
        .from(BUCKET)
        .upload(path, f, { cacheControl: "31536000", upsert: false });

      if (uploadError) throw uploadError;

      rec.media_url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      rec.media_type = f.type.startsWith("video") ? "video" : "image";
      if (editId) await rmFile(items.find(x => x.id === editId)?.media_url);
    }

    const result = editId
      ? await sb.from("projects").update(rec).eq("id", editId)
      : await sb.from("projects").insert(rec);

    if (result.error) throw result.error;

    reset();
    await loadProjects();
    msg("#pMsg", "Saved ✓");
  } catch (err) {
    console.error("Project save failed:", err);
    msg("#pMsg", err.message || "Could not save project.");
  } finally {
    $("#pSave").disabled = false;
  }
};

$("#list").onclick = async e => {
  const edit = e.target.dataset.e;
  const del = e.target.dataset.d;

  if (edit) {
    const p = items.find(x => String(x.id) === String(edit));
    if (!p) return;

    editId = p.id;
    $("#title").value = p.title || "";
    $("#category").value = p.category || "";
    $("#client").value = p.client || "";
    $("#desc").value = p.description || "";
    $("#purl").value = p.url || "";
    $("#pTitle").textContent = "Edit Project";
    $("#pReset").hidden = false;
    scrollTo({ top: 0, behavior: "smooth" });
  }

  if (del && confirm("Delete this project?")) {
    try {
      const p = items.find(x => String(x.id) === String(del));
      const { error } = await sb.from("projects").delete().eq("id", del);
      if (error) throw error;
      if (p?.media_url) await rmFile(p.media_url);
      await loadProjects();
      msg("#pMsg", "Project deleted ✓");
    } catch (err) {
      msg("#pMsg", err.message);
    }
  }
};

init();
