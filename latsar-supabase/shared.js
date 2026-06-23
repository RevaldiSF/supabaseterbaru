// ============================================================
//  SHARED UI — styles, sidebar, toast, helpers
// ============================================================

// Inject global CSS
(function injectStyles() {
  const css = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',sans-serif; background:#f0f2f5; color:#333; }
  .wrapper { display:flex; min-height:100vh; }

  /* SIDEBAR */
  .sidebar { width:220px; background:linear-gradient(180deg,#1a237e 0%,#283593 100%); color:white; display:flex; flex-direction:column; position:fixed; height:100vh; left:0; top:0; z-index:100; transition:transform .3s; }
  .sidebar-header { padding:18px 15px; border-bottom:1px solid rgba(255,255,255,.1); text-align:center; }
  .sidebar-header .logo { font-size:35px; margin-bottom:5px; }
  .sidebar-header h3 { font-size:12px; font-weight:700; line-height:1.4; }
  .sidebar-header p { font-size:11px; opacity:.7; margin-top:3px; }
  .sidebar-user { padding:10px 15px; background:rgba(255,255,255,.1); margin:8px 10px; border-radius:8px; font-size:12px; }
  .sidebar-user .user-name { font-weight:600; font-size:13px; }
  .sidebar-user .user-terminal { opacity:.8; margin-top:2px; }
  .sidebar-menu { flex:1; padding:8px 0; overflow-y:auto; }
  .menu-label { font-size:10px; text-transform:uppercase; letter-spacing:1px; opacity:.5; padding:8px 18px 4px; }
  .menu-item { display:flex; align-items:center; gap:10px; padding:12px 18px; cursor:pointer; transition:background .2s; font-size:13px; text-decoration:none; color:white; opacity:.85; }
  .menu-item:hover,.menu-item.active { background:rgba(255,255,255,.15); opacity:1; }
  .menu-item .icon { font-size:16px; width:20px; text-align:center; }
  .sidebar-footer { padding:12px; border-top:1px solid rgba(255,255,255,.1); }
  .btn-logout { width:100%; padding:9px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); color:white; border-radius:8px; cursor:pointer; font-size:13px; }
  .btn-logout:hover { background:rgba(255,0,0,.3); }

  /* MAIN */
  .main-content { margin-left:220px; flex:1; padding:22px; min-width:0; }
  .page-header { margin-bottom:20px; }
  .page-header h1 { font-size:20px; font-weight:700; color:#1a237e; }
  .page-header p { font-size:13px; color:#777; margin-top:3px; }

  /* MOBILE */
  .mobile-toggle { display:none; position:fixed; top:12px; left:12px; z-index:200; background:#1a237e; color:white; padding:8px 12px; border-radius:8px; cursor:pointer; font-size:18px; box-shadow:0 2px 8px rgba(0,0,0,.3); }

  /* STAT CARDS */
  .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px; margin-bottom:20px; }
  .stat-card { background:white; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,.06); border-left:4px solid #1a237e; transition:transform .2s; }
  .stat-card:hover { transform:translateY(-2px); }
  .stat-card.green { border-left-color:#2e7d32; } .stat-card.orange { border-left-color:#e65100; }
  .stat-card.red { border-left-color:#c62828; } .stat-card.purple { border-left-color:#6a1b9a; }
  .stat-card.teal { border-left-color:#00695c; }
  .stat-card .stat-icon { font-size:24px; margin-bottom:8px; }
  .stat-card .stat-value { font-size:24px; font-weight:700; color:#1a237e; }
  .stat-card.green .stat-value { color:#2e7d32; } .stat-card.orange .stat-value { color:#e65100; }
  .stat-card.red .stat-value { color:#c62828; } .stat-card.purple .stat-value { color:#6a1b9a; }
  .stat-card.teal .stat-value { color:#00695c; }
  .stat-card .stat-label { font-size:11px; color:#777; margin-top:3px; }

  /* CARD */
  .card { background:white; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,.06); margin-bottom:16px; }
  .card-title { font-size:14px; font-weight:600; color:#1a237e; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid #f0f2f5; }

  /* FORM */
  .form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:10px; }
  .form-group { display:flex; flex-direction:column; gap:4px; }
  .form-group label { font-size:12px; font-weight:600; color:#555; }
  .form-group input,.form-group select { padding:8px 10px; border:2px solid #e0e0e0; border-radius:8px; font-size:13px; outline:none; transition:border-color .2s; background:white; width:100%; }
  .form-group input:focus,.form-group select:focus { border-color:#1a237e; }
  .form-group input[readonly] { background:#f5f5f5; color:#777; }

  /* BUTTONS */
  .btn { padding:9px 16px; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; transition:opacity .2s; }
  .btn:hover { opacity:.85; } .btn:disabled { opacity:.5; cursor:not-allowed; }
  .btn-primary { background:#1a237e; color:white; } .btn-success { background:#2e7d32; color:white; }
  .btn-warning { background:#e65100; color:white; } .btn-danger { background:#c62828; color:white; }
  .btn-secondary { background:#757575; color:white; }

  /* TABLE */
  .table-wrapper { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:12px; min-width:600px; }
  table th { background:#1a237e; color:white; padding:9px 10px; text-align:left; font-weight:600; font-size:11px; white-space:nowrap; }
  table td { padding:8px 10px; border-bottom:1px solid #f0f2f5; white-space:nowrap; }
  table tr:hover td { background:#f8f9ff; }

  /* FILTER */
  .filter-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; margin-bottom:12px; }
  .filter-bar .form-group { min-width:120px; }

  /* BADGE */
  .badge { padding:3px 8px; border-radius:20px; font-size:11px; font-weight:600; }
  .badge-akap { background:#e3f2fd; color:#1565c0; }
  .badge-akdp { background:#e8f5e9; color:#2e7d32; }
  .badge-tj { background:#fff3e0; color:#e65100; }

  /* LOADING */
  .loading { text-align:center; padding:25px; color:#777; font-size:13px; }
  .spinner { display:inline-block; width:18px; height:18px; border:3px solid #e0e0e0; border-top-color:#1a237e; border-radius:50%; animation:spin .8s linear infinite; margin-right:8px; vertical-align:middle; }
  @keyframes popIn {
  from { transform:scale(0.85); opacity:0; }
  to   { transform:scale(1);    opacity:1; }
}

  /* RESPONSIVE */
  @media (min-width:769px) { .mobile-toggle { display:none !important; } .sidebar { transform:translateX(0) !important; } }
  @media (max-width:768px) {
    .mobile-toggle { display:block; }
    .sidebar { transform:translateX(-100%); width:240px; }
    .sidebar.active { transform:translateX(0); }
    .main-content { margin-left:0; padding:12px; padding-top:55px; }
    .stats-grid { grid-template-columns:repeat(2,1fr); }
    .form-grid { grid-template-columns:1fr 1fr; }
  }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

// Build sidebar HTML
function buildSidebar(activePage) {
  const user = Auth.get();
  if (!user) return;

  const isTamu = user.role === 'tamu';

  // Tamu hanya boleh akses dashboard
  if (isTamu && activePage !== 'dashboard') {
    window.location.href = 'dashboard.html';
    return;
  }

  const isPurbalingga = user.terminal === 'PURBALINGGA' || user.role === 'admin';
  const isBanjarnegara = user.terminal === 'BANJARNEGARA' || user.role === 'admin';

  let inputMenu = '';
  if (!isTamu) {
    if (isPurbalingga) inputMenu += `<a class="menu-item ${activePage==='input-purbalingga'?'active':''}" href="input_purbalingga.html"><span class="icon">✏️</span> Input Purbalingga</a>`;
    if (isBanjarnegara) inputMenu += `<a class="menu-item ${activePage==='input-banjarnegara'?'active':''}" href="input_banjarnegara.html"><span class="icon">✏️</span> Input Banjarnegara</a>`;
  }

  const laporanMenu = !isTamu ? `
    <div class="menu-label">Laporan</div>
    <a class="menu-item ${activePage==='laporan'?'active':''}" href="laporan.html"><span class="icon">📋</span> Cetak Laporan</a>` : '';

  const inputSection = !isTamu && inputMenu ? `
    <div class="menu-label">Input Data</div>
    ${inputMenu}` : '';

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="mobile-toggle" onclick="toggleSidebar()">☰</div>
    <div class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="logo">🚌</div>
        <h3>Sistem Pendataan Terminal</h3>
        <p>BPSPP Wilayah V</p>
      </div>
      <div class="sidebar-user">
        <div class="user-name">${isTamu?'👁️':'👤'} ${user.nama || user.username}</div>
        <div class="user-terminal">${isTamu?'Mode Tamu — Hanya Dashboard':user.terminal+' — '+user.role}</div>
      </div>
      <div class="sidebar-menu">
        <div class="menu-label">Menu</div>
        <a class="menu-item ${activePage==='dashboard'?'active':''}" href="dashboard.html"><span class="icon">📊</span> Dashboard</a>
        ${inputSection}
        ${laporanMenu}
      </div>
      <div class="sidebar-footer">
        <button class="btn-logout" onclick="doLogout()">🚪 Keluar</button>
      </div>
    </div>
  `);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

function doLogout() {
  Auth.clear();
  window.location.href = 'login.html';
}

// Toast notification
function showToast(type, msg) {
  const existing = document.getElementById('_toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = '_toast';
  const bg = type==='error' ? '#c62828' : type==='success' ? '#2e7d32' : '#1a237e';
  toast.style.cssText = `position:fixed;bottom:28px;right:24px;background:${bg};color:#fff;padding:14px 22px;border-radius:10px;font-size:14px;font-weight:600;box-shadow:0 4px 18px rgba(0,0,0,.22);z-index:9999;opacity:0;transition:opacity .25s ease;max-width:340px;line-height:1.5;`;
  toast.innerHTML = (type==='success'?'✅ ':type==='error'?'❌ ':'ℹ️ ') + msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.style.opacity = '1', 10);
  setTimeout(() => { toast.style.opacity='0'; setTimeout(()=>toast.remove(),300); }, type==='error'?4500:3000);
}

// Format tanggal untuk Supabase (YYYY-MM-DD)
function toSupabaseDate(str) {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parts = str.split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
  return str;
}

// Format tanggal untuk tampilan (DD/MM/YYYY)
function toDisplayDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.getDate().toString().padStart(2,'0') + '/' + (d.getMonth()+1).toString().padStart(2,'0') + '/' + d.getFullYear();
}

// Tanggal hari ini YYYY-MM-DD
function todayISO() {
  return new Date().toISOString().split('T')[0];
}
