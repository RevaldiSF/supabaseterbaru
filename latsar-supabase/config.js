// ============================================================
//  KONFIGURASI SUPABASE — ganti jika project berubah
// ============================================================
const SUPABASE_URL  = 'https://fawllrpjufyqqdkyxqdh.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhd2xscnBqdWZ5cXFka3l4cWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDQzNzMsImV4cCI6MjA5NDkyMDM3M30.WEa9z8olxUb_1Tf9Fjdx_wni_klDR7NFLwLgTR34mf4';

// Helper: fetch ke Supabase REST API
async function sbFetch(path, options = {}) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': 'Bearer ' + SUPABASE_ANON,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      // Minta semua data tanpa limit default 1000
      'Range-Unit': 'items',
      'Range': '0-99999',
      ...options.headers
    },
    method: options.method || 'GET',
    body: options.body || undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Supabase error ' + res.status);
  }
  if (options.method === 'DELETE') return true;
  if (options.method === 'PATCH' && options.prefer === 'return=minimal') return true;
  return res.json();
}

// Session sederhana pakai localStorage
const Auth = {
  save(user) { localStorage.setItem('sb_user', JSON.stringify(user)); },
  get()      { try { return JSON.parse(localStorage.getItem('sb_user')); } catch { return null; } },
  clear()    { localStorage.removeItem('sb_user'); },
  check()    {
    const u = this.get();
    if (!u) { window.location.href = 'login.html'; return null; }
    return u;
  }
};
