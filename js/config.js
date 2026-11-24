// Paste the Project URL from Supabase Dashboard → Project Settings → Data API,
// and the sb_publishable_... key from the API Keys page.
window.CFG = {
  url: "https://pcifvdefipohgxmetlet.supabase.co",
  key: "sb_publishable_VLGHnSoRzz-ls48yIULQrA_zvSN9Eto"
};
CFG.ok = !/YOUR_/.test(CFG.url + CFG.key);
if (CFG.ok) {
  // Keeps only the base address even if the url has /rest/v1, a trailing / or spaces
  try { CFG.url = new URL(CFG.url.trim()).origin; } catch (e) { CFG.ok = false; console.error("Invalid Supabase URL in js/config.js"); }
  CFG.key = CFG.key.trim();
}
