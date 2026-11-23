// Supabase Dashboard → Project Settings → Data API থেকে Project URL,
// এবং API Keys পেজ থেকে sb_publishable_... key বসান।
window.CFG = {
  url: "https://bfovllztgjrswikuacao.supabase.co",
  key: "sb_publishable_uZRtCE-nh1JgiTYqWJTS_g_WjRiipou"
};
CFG.ok = !/YOUR_/.test(CFG.url + CFG.key);
if (CFG.ok) {
  // url-এ /rest/v1, শেষের / বা ফাঁকা জায়গা থাকলেও শুধু মূল ঠিকানাটা রাখে
  try { CFG.url = new URL(CFG.url.trim()).origin; } catch (e) { CFG.ok = false; console.error("Invalid Supabase URL in js/config.js"); }
  CFG.key = CFG.key.trim();
}
