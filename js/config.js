// Supabase Dashboard → Project Settings → API থেকে এই দুটি মান বসান।
// anon key পাবলিক হলেও সমস্যা নেই; লেখার অধিকার Row Level Security দিয়ে শুধু অ্যাডমিনের।
window.CFG = {
  url: "https://bfovllztgjrswikuacao.supabase.co",
  key: "sb_publishable_uZRtCE-nh1JgiTYqWJTS_g_WjRiipou"
};
window.CFG.ok = !/YOUR_/.test(CFG.url + CFG.key);
