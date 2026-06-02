// ============================================================
// KONFIGURASI SUPABASE - TERMINAL BPSPP WILAYAH V
// ============================================================
const SUPABASE_URL = 'https://fawllrpjufyqqdkyxqdh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhd2xscnBqdWZ5cXFka3l4cWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDQzNzMsImV4cCI6MjA5NDkyMDM3M30.WEa9z8olxUb_1Tf9Fjdx_wni_klDR7NFLwLgTR34mf4';

// ============================================================
// HELPER - semua request ke Supabase lewat sini
// ============================================================
async function sbFetch(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || '',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  // DELETE & no-content response
  if (res.status === 204) return null;
  return res.json();
}

// ============================================================
// AUTH - Login & Session (pakai tabel users manual)
// ============================================================
const Auth = {
  // Login cek ke tabel users
  async login(username, password) {
    const data = await sbFetch(
      `users?username=eq.${encodeURIComponent(username)}&aktif=eq.true&select=*`,
      { method: 'GET' }
    );
    if (!data || data.length === 0) throw new Error('Username tidak ditemukan');
    const user = data[0];
    // Password masih plain text dulu (sama seperti Apps Script lama)
    // Nanti bisa upgrade ke bcrypt
    if (user.password !== password) throw new Error('Password salah');
    // Simpan session di localStorage
    const session = { id: user.id, username: user.username, nama: user.nama_lengkap, terminal: user.terminal, role: user.role };
    localStorage.setItem('sb_session', JSON.stringify(session));
    return session;
  },

  logout() {
    localStorage.removeItem('sb_session');
    window.location.href = 'login.html';
  },

  getSession() {
    try { return JSON.parse(localStorage.getItem('sb_session')); }
    catch { return null; }
  },

  requireLogin() {
    const s = this.getSession();
    if (!s) { window.location.href = 'login.html'; return null; }
    return s;
  }
};

// ============================================================
// MASTER PO
// ============================================================
const MasterPO = {
  async getByLayananTerminal(layanan, terminal) {
    let q = `master_po?aktif=eq.true&terminal=eq.${terminal}&order=nama_po.asc`;
    if (layanan !== 'Semua') q += `&layanan=eq.${encodeURIComponent(layanan)}`;
    return sbFetch(q);
  },

  async getAll() {
    return sbFetch('master_po?order=terminal.asc,layanan.asc,nama_po.asc');
  }
};

// ============================================================
// DATA HARIAN
// ============================================================
const DataHarian = {
  async simpan(formData, session) {
    // Hitung jml_po unik dulu
    const existing = await sbFetch(
      `data_harian?tanggal=eq.${formData.tanggal}&terminal=eq.${formData.terminal}&layanan=eq.${encodeURIComponent(formData.layanan)}&select=nama_po`
    );
    const poUnik = new Set((existing || []).map(r => r.nama_po));
    poUnik.add(formData.nama_po);
    const jml_po = poUnik.size;

    // Update jml_po di baris lama (batch)
    await sbFetch(
      `data_harian?tanggal=eq.${formData.tanggal}&terminal=eq.${formData.terminal}&layanan=eq.${encodeURIComponent(formData.layanan)}`,
      { method: 'PATCH', body: JSON.stringify({ jml_po }), prefer: 'return=minimal' }
    );

    // Insert baris baru
    const row = {
      tanggal: formData.tanggal,
      jam_datang: formData.jam_datang,
      jam_berangkat: formData.jam_berangkat,
      terminal: formData.terminal,
      layanan: formData.layanan,
      po_id: formData.po_id,
      nama_po: formData.nama_po,
      koperasi: formData.koperasi,
      trayek: formData.trayek,
      nomor_bus: formData.nomor_bus,
      jml_po,
      BK: Number(formData.BK) || 0,
      BS: Number(formData.BS) || 0,
      BB: Number(formData.BB) || 0,
      MPU: Number(formData.MPU) || 0,
      jml_seat: Number(formData.jml_seat) || 0,
      jml_pnp: Number(formData.jml_pnp) || 0,
      pnp_naik: Number(formData.pnp_naik) || 0,
      pnp_turun: Number(formData.pnp_turun) || 0,
      laik: Number(formData.laik) || 0,
      tidak_laik: Number(formData.tidak_laik) || 0,
      keterangan: formData.keterangan || '',
      created_by: session?.username || ''
    };
    await sbFetch('data_harian', {
      method: 'POST',
      body: JSON.stringify(row),
      prefer: 'return=minimal'
    });

    // Update rekap bulanan
    await RekapBulanan.update(formData.tanggal, formData.terminal, formData.layanan);
    return { success: true, message: 'Data berhasil disimpan!' };
  },

  async getByFilter(terminal, layanan, tglMulai, tglSelesai) {
    let q = `data_harian?order=tanggal.asc,jam_datang.asc`;
    if (terminal && terminal !== 'Semua') q += `&terminal=eq.${terminal}`;
    if (layanan && layanan !== 'Semua') q += `&layanan=eq.${encodeURIComponent(layanan)}`;
    if (tglMulai) q += `&tanggal=gte.${tglMulai}`;
    if (tglSelesai) q += `&tanggal=lte.${tglSelesai}`;
    return sbFetch(q);
  },

  async hapus(id) {
    return sbFetch(`data_harian?id=eq.${id}`, { method: 'DELETE' });
  }
};

// ============================================================
// DATA PENGUNJUNG
// ============================================================
const DataPengunjung = {
  async simpan(formData, session) {
    // Cek apakah sudah ada data hari itu
    const existing = await sbFetch(
      `data_pengunjung?tanggal=eq.${formData.tanggal}&terminal=eq.${formData.terminal}`
    );
    if (existing && existing.length > 0) {
      // Update
      await sbFetch(
        `data_pengunjung?tanggal=eq.${formData.tanggal}&terminal=eq.${formData.terminal}`,
        { method: 'PATCH', body: JSON.stringify({ jumlah_pengunjung: formData.jumlah_pengunjung, keterangan: formData.keterangan || '' }), prefer: 'return=minimal' }
      );
    } else {
      // Insert
      await sbFetch('data_pengunjung', {
        method: 'POST',
        body: JSON.stringify({
          tanggal: formData.tanggal,
          terminal: formData.terminal,
          jumlah_pengunjung: Number(formData.jumlah_pengunjung) || 0,
          keterangan: formData.keterangan || '',
          created_by: session?.username || ''
        }),
        prefer: 'return=minimal'
      });
    }
    return { success: true, message: 'Data pengunjung tersimpan!' };
  },

  async getByBulan(terminal, bulan, tahun) {
    const tglMulai = `${tahun}-${String(bulan).padStart(2,'0')}-01`;
    const tglSelesai = `${tahun}-${String(bulan).padStart(2,'0')}-31`;
    let q = `data_pengunjung?tanggal=gte.${tglMulai}&tanggal=lte.${tglSelesai}&order=tanggal.asc`;
    if (terminal && terminal !== 'Semua') q += `&terminal=eq.${terminal}`;
    return sbFetch(q);
  }
};

// ============================================================
// REKAP BULANAN
// ============================================================
const RekapBulanan = {
  // Dipanggil setiap kali ada data baru masuk
  async update(tanggal, terminal, layanan) {
    const bulan = parseInt(tanggal.split('-')[1]);
    const tahun = parseInt(tanggal.split('-')[0]);
    const tglMulai = `${tahun}-${String(bulan).padStart(2,'0')}-01`;
    const tglSelesai = `${tahun}-${String(bulan).padStart(2,'0')}-31`;

    // Ambil semua data harian bulan itu per tanggal
    const rows = await sbFetch(
      `data_harian?tanggal=gte.${tglMulai}&tanggal=lte.${tglSelesai}&terminal=eq.${terminal}&layanan=eq.${encodeURIComponent(layanan)}&order=tanggal.asc`
    );

    // Kelompokkan per tanggal
    const perTgl = {};
    (rows || []).forEach(r => {
      if (!perTgl[r.tanggal]) perTgl[r.tanggal] = [];
      perTgl[r.tanggal].push(r);
    });

    for (const tgl of Object.keys(perTgl)) {
      const data = perTgl[tgl];
      const poUnik = new Set(data.map(r => r.nama_po));
      const rekap = {
        bulan, tahun, tanggal: tgl, terminal, layanan,
        jml_po: poUnik.size,
        bus_msk: data.length,
        bus_klr: data.length,
        BK: data.reduce((s,r) => s + (Number(r.BK)||0), 0),
        BS: data.reduce((s,r) => s + (Number(r.BS)||0), 0),
        BB: data.reduce((s,r) => s + (Number(r.BB)||0), 0),
        MPU: data.reduce((s,r) => s + (Number(r.MPU)||0), 0),
        seat: data.reduce((s,r) => s + (Number(r.jml_seat)||0), 0),
        penumpang: data.reduce((s,r) => s + (Number(r.jml_pnp)||0), 0),
        pnp_naik: data.reduce((s,r) => s + (Number(r.pnp_naik)||0), 0),
        pnp_turun: data.reduce((s,r) => s + (Number(r.pnp_turun)||0), 0),
        laik_jalan: data.reduce((s,r) => s + (Number(r.laik)||0), 0),
        tidak_laik: data.reduce((s,r) => s + (Number(r.tidak_laik)||0), 0),
        updated_at: new Date().toISOString()
      };

      // Upsert (insert or update)
      const existing = await sbFetch(
        `rekap_bulanan?tanggal=eq.${tgl}&terminal=eq.${terminal}&layanan=eq.${encodeURIComponent(layanan)}`
      );
      if (existing && existing.length > 0) {
        await sbFetch(
          `rekap_bulanan?tanggal=eq.${tgl}&terminal=eq.${terminal}&layanan=eq.${encodeURIComponent(layanan)}`,
          { method: 'PATCH', body: JSON.stringify(rekap), prefer: 'return=minimal' }
        );
      } else {
        await sbFetch('rekap_bulanan', { method: 'POST', body: JSON.stringify(rekap), prefer: 'return=minimal' });
      }
    }
  },

  async getByBulan(terminal, layanan, bulan, tahun) {
    const tglMulai = `${tahun}-${String(bulan).padStart(2,'0')}-01`;
    const tglSelesai = `${tahun}-${String(bulan).padStart(2,'0')}-31`;
    let q = `rekap_bulanan?tanggal=gte.${tglMulai}&tanggal=lte.${tglSelesai}&order=tanggal.asc,layanan.asc`;
    if (terminal && terminal !== 'Semua') q += `&terminal=eq.${terminal}`;
    if (layanan && layanan !== 'Semua') q += `&layanan=eq.${encodeURIComponent(layanan)}`;
    return sbFetch(q);
  }
};

// ============================================================
// TOAST NOTIFIKASI (shared semua halaman)
// ============================================================
function showToast(type, msg) {
  const existing = document.getElementById('_toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = '_toast';
  const bg = type === 'error' ? '#c62828' : type === 'success' ? '#2e7d32' : '#1a237e';
  toast.style.cssText = [
    'position:fixed','bottom:28px','right:24px',
    'background:' + bg,'color:#fff',
    'padding:14px 22px','border-radius:10px',
    'font-size:14px','font-weight:600',
    'box-shadow:0 4px 18px rgba(0,0,0,0.22)',
    'z-index:9999','opacity:0',
    'transition:opacity 0.25s ease',
    'max-width:340px','line-height:1.5'
  ].join(';');
  toast.innerHTML = (type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : 'ℹ️ ') + msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.style.opacity = '1', 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.parentNode && toast.remove(), 300);
  }, type === 'error' ? 4500 : 3000);
}
