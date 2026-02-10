import { CONFIG } from '../../config.js';

class HomePresenter {
  constructor({ container }) {
    this.container = container;
    this.viewDate = new Date(); 
    this.allOperationalData = []; 
    this.allCommoditiesData = []; 
    this.summaryData = {};
  }

  async init() {
    try {
      const resInv = await fetch(`${CONFIG.BASE_URL}/commodities`);
      const resultInv = await resInv.json();

      const resOp = await fetch(`${CONFIG.BASE_URL}/api/laporan`);
      const resultOp = await resOp.json();

      if (resultInv.status !== 'success' || resultOp.status !== 'success') throw new Error('Respons server gagal');

      this.allCommoditiesData = resultInv.data;
      this.allOperationalData = resultOp.data;

      this._processInitialStats();
      this._renderFullDashboard();

    } catch (err) {
      console.error("Dashboard Error:", err);
      this._renderError();
    }
  }

  _processInitialStats() {
    let categoryStats = [];
    let salesStats = [];
    let allItems = [];

    this.allCommoditiesData.forEach(cat => {
      const serverData = cat.details || [];
      const totalStokKategori = serverData.reduce((acc, curr) => acc + (Number(curr.stok) || 0), 0);
      
      categoryStats.push({ 
        label: cat.nama, 
        stok: totalStokKategori,
        aktif: cat.aktif,
        products: serverData 
      });

      const totalPemasukan = serverData.reduce((acc, curr) => acc + (curr.terjual ? curr.terjual * curr.harga : 0), 0);
      salesStats.push({ label: cat.nama, nilai: totalPemasukan });

      allItems = [...allItems, ...serverData.map(item => ({ ...item, kategoriLabel: cat.nama }))];
    });

    const totalDanaMasukGlobal = salesStats.reduce((acc, curr) => acc + curr.nilai, 0);

    this.summaryData = {
      categoryStats,
      salesStats,
      totalStokGlobal: allItems.reduce((acc, curr) => acc + (Number(curr.stok) || 0), 0),
      totalDanaMasukGlobal,
      summaryItems: {
        totalJenis: allItems.length,
        totalKategori: this.allCommoditiesData.length,
        totalEstimasiNilai: allItems.reduce((acc, curr) => acc + (curr.harga * curr.stok), 0),
        danaMasuk: totalDanaMasukGlobal
      }
    };
  }

  _renderFullDashboard() {
    this._renderMainStructure();
    
    setTimeout(() => {
        this._renderOperationalTable(); 
        this._setupNavigationEvents();
        this._bindTableButtons();
        this._setupGlobalModalEvents();
    }, 0);
  }

  _renderMainStructure() {
    const { summaryItems, categoryStats, totalStokGlobal, salesStats, totalDanaMasukGlobal } = this.summaryData;
    const colors = ['#f39c12', '#41644A', '#3498db', '#9b59b6', '#e74c3c', '#1abc9c'];

    this.container.innerHTML = `
      <div class="dashboard-grid" style="display: flex; flex-direction: column; gap: 24px; padding: 0 20px;">
        
        <div class="summary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          ${this._createSummaryItem('Total Kategori', summaryItems.totalKategori, '#f39c12')}
          ${this._createSummaryItem('Total Produk', summaryItems.totalJenis, '#41644A')}
          ${this._createSummaryItem('Nilai Omzet Stok', `Rp ${summaryItems.totalEstimasiNilai.toLocaleString('id-ID')}`, '#3498db')}
          ${this._createSummaryItem('Omzet Terjual', `Rp ${summaryItems.danaMasuk.toLocaleString('id-ID')}`, '#9b59b6')}
        </div>

        <div class="dashboard-card" style="background: white; padding: 30px; border-radius: 24px; border: 1px solid #e0eadd; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-bottom: 25px;">
            <h4 style="margin: 0; font-weight: 1200; font-size: 1.1rem; text-transform: uppercase; color: #14280a; letter-spacing: 1px; text-align: center;">📊 KOMPOSISI STOK GLOBAL PER KATEGORI</h4>
          </div>
          <div style="display: flex; height: 35px; border-radius: 12px; overflow: hidden; background: #f0f0f0; margin-bottom: 25px;">
            ${categoryStats.map((s, i) => {
              const perc = totalStokGlobal > 0 ? (s.stok / totalStokGlobal * 100) : 0;
              return perc > 0 ? `<div style="width:${perc}%; background:${colors[i % colors.length]}; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.65rem; font-weight: 900;" title="${s.label}">${perc > 10 ? s.label : ''}</div>` : '';
            }).join('')}
          </div>
          <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 15px;">
            ${categoryStats.map((s, i) => `<div style="display: flex; align-items: center; gap: 8px;"><span style="width:12px; height:12px; border-radius:3px; background:${colors[i % colors.length]}"></span><span style="font-size:0.75rem; font-weight:800;">${s.label}: ${s.stok.toLocaleString('id-ID')}</span></div>`).join('')}
          </div>
        </div>

        <div class="dashboard-card" style="background: white; padding: 30px; border-radius: 24px; border: 1px solid #e0eadd; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-bottom: 30px;">
            <h4 style="margin: 0; font-weight: 1200; font-size: 1.1rem; text-transform: uppercase; color: #14280a; letter-spacing: 1px; text-align: center;">💰 ANALISIS PEMASUKAN PER KATEGORI</h4>
          </div>
          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${salesStats.map((s, i) => {
              const perc = totalDanaMasukGlobal > 0 ? ((s.nilai / totalDanaMasukGlobal) * 100).toFixed(1) : 0;
              return `
                <div style="display: flex; align-items: center; gap: 20px;">
                  <div style="width: 140px; font-size: 0.8rem; font-weight: 900; text-align: right; color: #4a5568;">${s.label}</div>
                  <div style="flex-grow: 1; background: #edf2f7; height: 24px; border-radius: 12px; overflow: hidden;">
                    <div style="width: ${perc}%; height: 100%; background: ${colors[i % colors.length]}; transition: width 1s ease-in-out;"></div>
                  </div>
                  <div style="width: 80px; font-size: 0.9rem; font-weight: 1200; color: #41644A; text-align: center;">${perc}%</div>
                </div>`;
            }).join('')}
          </div>
        </div>

        <div class="dashboard-card" style="background: white; border-radius: 24px; border: 1px solid #e0eadd; overflow: hidden; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-bottom: 25px;">
            <h4 style="margin: 0; font-weight: 1200; font-size: 1.1rem; text-transform: uppercase; color: #14280a; letter-spacing: 1px; text-align: center;">📋 MONITORING OPERASIONAL HARIAN</h4>
          </div>
          <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 25px; background: #f9fbf9; padding: 15px; border-radius: 16px; border: 1px solid #eef2ed;">
            <button type="button" id="prevDateHome" style="background: #6CA651; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 900; box-shadow: 0 4px 0 #4a7337;">&laquo; PREV</button>
            <div style="text-align: center; min-width: 220px;">
                <span id="currentDateDisplayHome" style="font-weight: 1200; color: #14280a; font-size: 1.1rem; display: block; letter-spacing: 1px;">-</span>
            </div>
            <button type="button" id="nextDateHome" style="background: #6CA651; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 900; box-shadow: 0 4px 0 #4a7337;">NEXT &raquo;</button>
          </div>
          <div style="overflow-x: auto; border-radius: 18px; border: 1px solid #eef2ed;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
              <thead style="background: #6CA651; color: white;">
                <tr>
                  <th style="padding: 18px; text-align: center;">WAKTU</th>
                  <th style="padding: 18px; text-align: center;">HEWAN</th>
                  <th style="padding: 18px; text-align: center;">DERET</th>
                  <th style="padding: 18px; text-align: center;">SESI</th>
                  <th style="padding: 18px; text-align: center;">KESEHATAN</th>
                  <th style="padding: 18px; text-align: center;">KELAYAKAN</th>
                  <th style="padding: 18px; text-align: center;">PETUGAS</th>
                  <th style="padding: 18px; text-align: center;">DAFTAR PEKERJAAN</th>
                </tr>
              </thead>
              <tbody id="opTableBodyHome"></tbody>
            </table>
          </div>
        </div>

        <div class="dashboard-card" style="background: white; border-radius: 24px; border: 1px solid #e0eadd; overflow: hidden; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-bottom: 25px;">
            <h4 style="margin: 0; font-weight: 1200; font-size: 1.1rem; text-transform: uppercase; color: #14280a; letter-spacing: 1px; text-align: center;">📦 DAFTAR KOMODITAS</h4>
          </div>
          <div style="overflow-x: auto; border-radius: 18px; border: 1px solid #eef2ed;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
              <thead style="background: #41644A; color: white;">
                <tr>
                  <th style="padding: 18px; text-align: center;">NO</th>
                  <th style="padding: 18px; text-align: center;">KATEGORI</th>
                  <th style="padding: 18px; text-align: center;">TOTAL STOK</th>
                  <th style="padding: 18px; text-align: center;">STATUS KATEGORI</th>
                  <th style="padding: 18px; text-align: center;">PRODUK</th>
                </tr>
              </thead>
              <tbody>
                ${categoryStats.map((cat, i) => `
                  <tr style="border-bottom: 1px solid #eee; text-align: center;">
                    <td style="padding: 15px; color: #999;">${i + 1}</td>
                    <td style="padding: 15px;"><span style="background:#eef2ed; padding:5px 12px; border-radius:15px; font-size:0.7rem; font-weight:900; color:#41644A; border:1px solid #cddbc9; text-transform:uppercase;">${cat.label}</span></td>
                    <td style="padding: 15px; font-weight: 1200; color: #14280a; font-size: 1rem;">${cat.stok.toLocaleString('id-ID')}</td>
                    <td style="padding: 15px;">
                        <span style="font-size: 0.75rem; font-weight: 1200; color: ${cat.aktif ? '#2ecc71' : '#e74c3c'}">
                            ${cat.aktif ? '● AKTIF' : '● OFF'}
                        </span>
                    </td>
                    <td style="padding: 15px;">
                      <button class="btn-pop-inv-category" data-catname="${cat.label}" data-products='${JSON.stringify(cat.products)}' 
                        style="border:none; background:#41644A; color:white; padding:8px 18px; border-radius:10px; font-weight:900; cursor:pointer; box-shadow: 0 4px 0 #2d4533;">
                        LIHAT PRODUK
                      </button>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  _renderOperationalTable() {
    const tableBody = document.getElementById('opTableBodyHome');
    const dateDisplay = document.getElementById('currentDateDisplayHome');
    if (!tableBody || !dateDisplay) return;

    const selectedDateStr = this.viewDate.toLocaleDateString('id-ID');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.innerText = this.viewDate.toLocaleDateString('id-ID', options).toUpperCase();

    const filteredData = this.allOperationalData.filter(item => new Date(item.tanggal_jam).toLocaleDateString('id-ID') === selectedDateStr);

    if (filteredData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="padding: 50px; color: #ccc; text-align: center; font-style: italic; font-weight: 700;">Tidak ada aktivitas operasional pada tanggal ini.</td></tr>`;
      return;
    }

    filteredData.sort((a, b) => new Date(b.tanggal_jam) - new Date(a.tanggal_jam));

    tableBody.innerHTML = filteredData.map(item => {
      const kesehatan = item.kesehatan_data || { status: 'SEHAT', detail: [] };
      const kelayakan = item.kelayakan_data || { status: 'LAYAK', problems: [] };
      const pekerjaan = item.pekerjaan_data || [];
      const time = new Date(item.tanggal_jam).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      const isAman = pekerjaan.length > 0 && pekerjaan.every(p => p.status === true);
      const hColor = kesehatan.status === 'SAKIT' ? {bg:'#fff5f5', txt:'#c53030'} : {bg:'#eef2ed', txt:'#2d4a36'};
      const lColor = kelayakan.status === 'TIDAK LAYAK' ? {bg:'#fff5f5', txt:'#c53030'} : {bg:'#eef2ed', txt:'#2d4a36'};

      return `
        <tr style="border-bottom: 1px solid #eee; text-align: center;">
          <td style="padding: 15px; font-weight: 700;">${time} WIB</td>
          <td style="padding: 15px; font-weight: 1200;">${item.hewan}</td>
          <td style="padding: 15px;">Deret ${item.deret_kandang}</td>
          <td style="padding: 15px;">${item.sesi}</td>
          <td style="padding: 15px;"><button class="btn-pop-health" data-status="${kesehatan.status}" data-detail='${JSON.stringify(kesehatan.detail)}' style="border:none; padding:6px 15px; border-radius:10px; font-weight:1200; cursor:pointer; background:${hColor.bg}; color:${hColor.txt};">${kesehatan.status}</button></td>
         <td style="padding: 15px;">
  <button class="btn-pop-layak"
    data-status="${kelayakan.status}"
    data-problems='${JSON.stringify(kelayakan.problems || [])}'
    style="border:none; padding:6px 15px; border-radius:10px;
           font-weight:1200; cursor:pointer;
           background:${lColor.bg}; color:${lColor.txt};">
    ${kelayakan.status}
  </button>
</td>

          <td style="padding: 15px; font-weight: 900;">${item.petugas}</td>
          <td style="padding: 15px;">
            <button class="btn-pop-task" data-tasks='${JSON.stringify(pekerjaan)}' 
                style="border:none; padding:8px 18px; border-radius:10px; font-weight:1200; color:white; background:${isAman ? '#41644A' : '#e74c3c'}; cursor:pointer;">
                ${isAman ? 'AMAN' : 'PERIKSA'}
            </button>
          </td>
        </tr>`;
    }).join('');
    this._bindTableButtons();
  }

  _setupNavigationEvents() {
    const prev = document.getElementById('prevDateHome');
    const next = document.getElementById('nextDateHome');
    if (prev) prev.onclick = () => { this.viewDate.setDate(this.viewDate.getDate() - 1); this._renderOperationalTable(); };
    if (next) next.onclick = () => { this.viewDate.setDate(this.viewDate.getDate() + 1); this._renderOperationalTable(); };
  }

  _bindTableButtons() {
    this.container.querySelectorAll('.btn-pop-health').forEach(btn => {
      btn.onclick = () => {
        const { status, detail } = btn.dataset;
        if (status === 'SEHAT') return alert("Hewan Sehat Semua! ✅");
        const details = JSON.parse(detail);
        document.getElementById('modalNote').innerHTML = `
          <h3 style="color:#c53030; text-align:center; font-weight:900; margin-bottom:15px;">DETAIL HEWAN SAKIT ⚠️</h3>
          <div style="overflow-x:auto; border-radius:12px; border:1px solid #feb2b2;">
            <table style="width:100%; border-collapse:collapse; background:white; font-size:0.8rem;">
              <thead style="background:#6CA651; color:white;">
                <tr>
                  <th style="padding:10px; border:1px solid #feb2b2;">NOMOR KANDANG</th>
                  <th style="padding:10px; border:1px solid #feb2b2;">AYAM</th>
                  <th style="padding:10px; border:1px solid #feb2b2;">GEJALA</th>
                  <th style="padding:10px; border:1px solid #feb2b2;">OBAT</th>
                  <th style="padding:10px; border:1px solid #feb2b2;">KARANTINA</th>
                </tr>
              </thead>
              <tbody style="text-align:center;">
                ${details.map(d => `
                  <tr>
                    <td style="padding:10px; border:1px solid #feb2b2; font-weight:900;">${d.kandang}</td>
                    <td style="padding:10px; border:1px solid #feb2b2;">${d.ayam}</td>
                    <td style="padding:10px; border:1px solid #feb2b2; text-align:left;">${d.penyakit}</td>
                    <td style="padding:10px; border:1px solid #feb2b2; text-align:left;">${d.pemulihan}</td>
                    <td style="padding:10px; border:1px solid #feb2b2; font-weight:bold; color:${d.karantina === 'YA' ? '#c53030' : '#2d4a36'}">${d.karantina}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`;
        document.getElementById('statusModal').style.display = 'flex';
      };
    });

    this.container.querySelectorAll('.btn-pop-layak').forEach(btn => {
  btn.onclick = () => {
    const status = btn.dataset.status;
    const problems = JSON.parse(btn.dataset.problems || '[]');

    if (status === 'LAYAK') {
      document.getElementById('modalNote').innerHTML = `
        <h3 style="color:#2d4a36; text-align:center;">✅ KANDANG AMAN</h3>
        <p style="text-align:center; margin-top:15px;">Tidak ditemukan masalah pada kandang.</p>
      `;
      document.getElementById('statusModal').style.display = 'flex';
      return;
    }

    // TIDAK LAYAK
    document.getElementById('modalNote').innerHTML = `
      <h3 style="color:#c53030; text-align:center; font-weight:1200;">⚠️ TIDAK LAYAK</h3>

      ${
        problems.length === 0
          ? `<p style="text-align:center; margin-top:15px; color:#c53030; font-weight:700;">
               Kandang dinyatakan TIDAK LAYAK, namun detail masalah belum dicatat.
             </p>`
          : problems.map(p => `
              <div style="
                margin-top:15px;
                padding:15px;
                border-radius:12px;
                border:1.5px solid #feb2b2;
                background:#fff5f5;
              ">
                <strong>KANDANG ${p.kandang}</strong>
                <p style="margin:8px 0;">${p.note || '-'}</p>
                ${
                  p.photo
                    ? `<img src="${p.photo}"
                        style="width:100%; max-height:250px; object-fit:cover;
                               border-radius:10px; margin-top:8px;">`
                    : ''
                }
              </div>
            `).join('')
      }
    `;

    document.getElementById('statusModal').style.display = 'flex';
  };
});

    // --- REVISI POPUP DETAIL PEKERJAAN (3 KOLOM: TUGAS, HASIL, STATUS) ---
    this.container.querySelectorAll('.btn-pop-task').forEach(btn => {
      btn.onclick = () => {
        const tasks = JSON.parse(btn.dataset.tasks);
        document.getElementById('taskListContent').innerHTML = `
          <div style="overflow-x:auto; border-radius:12px; border:1px solid #eef2ed; margin-top:10px; width: 100%;">
            <table style="width:100%; border-collapse:collapse; background:white; font-size:0.85rem;">
              <thead style="background:#6CA651; color:white;">
                <tr>
                  <th style="padding:12px; border:1px solid #eef2ed; text-align:center;">TUGAS</th>
                  <th style="padding:12px; border:1px solid #eef2ed; text-align:center;">HASIL</th>
                  <th style="padding:12px; border:1px solid #eef2ed; text-align:center;">STATUS</th>
                </tr>
              </thead>
              <tbody style="text-align:center;">
                ${tasks.map(t => `
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding:12px; border:1px solid #eef2ed; text-align:left; font-weight: 600;">${t.name}</td>
                    <td style="padding:12px; border:1px solid #eef2ed; font-weight:900; color:#41644A;">${t.val || '-'} ${t.unit || ''}</td>
                    <td style="padding:12px; border:1px solid #eef2ed;">
                        <span style="font-weight: 800; color:${t.status ? '#2ecc71' : '#e74c3c'}">
                            ${t.status ? '✅' : '❌'}
                        </span>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`;
        document.getElementById('taskModal').style.display = 'flex';
      };
    });

    this.container.querySelectorAll('.btn-pop-inv-category').forEach(btn => {
      btn.onclick = () => {
        const catName = btn.dataset.catname;
        const products = JSON.parse(btn.dataset.products);
        document.getElementById('modalNote').innerHTML = `
          <div style="text-align:center;">
            <h3 style="font-weight:1200; margin-bottom:15px; color:#41644A;">DAFTAR PRODUK: ${catName.toUpperCase()}</h3>
            <div style="background:#f9fbf9; border-radius:20px; border:1px solid #eef2ed; overflow:hidden;">
              <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                <thead style="background:#eef2ed;">
                  <tr style="text-align:center;">
                    <th style="padding:12px;">NAMA</th>
                    <th style="padding:12px;">STOK</th>
                    <th style="padding:12px;">STATUS</th>
                  </tr>
                </thead>
                <tbody style="text-align:center;">
                  ${products.map(p => `
                    <tr style="border-bottom:1px solid #eee; background:white;">
                      <td style="padding:12px; text-align:left; font-weight:700;">${p.nama}</td>
                      <td style="padding:12px; font-weight:900;">${p.stok}</td>
                      <td style="padding:12px;">
                        <span style="font-size:0.7rem; font-weight:900; color:${p.aktif ? '#2ecc71' : '#e74c3c'}">
                          ${p.aktif ? '● AKTIF' : '● OFF'}
                        </span>
                      </td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>`;
        document.getElementById('statusModal').style.display = 'flex';
      };
    });
  }

  _setupGlobalModalEvents() {
    document.querySelectorAll('.close-modal-btn').forEach(btn => btn.onclick = () => {
        document.getElementById('statusModal').style.display = 'none';
        document.getElementById('taskModal').style.display = 'none';
    });
  }

  _createSummaryItem(label, value, color) {
    return `<div style="background: ${color}; padding: 25px; border-radius: 20px; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align:center;">
              <label style="font-size: 0.75rem; font-weight: 800; opacity: 0.9; text-transform: uppercase;">${label}</label>
              <h3 style="font-size: 1.5rem; margin: 10px 0 0; font-weight: 1200;">${value}</h3>
            </div>`;
  }

  _renderError() {
    this.container.innerHTML = `<div style="padding:60px; text-align:center;"><h3 style="color:#c53030; font-weight:1200;">⚠️ DATABASE ERROR</h3><button onclick="location.reload()" style="margin-top:20px; padding:15px 35px; background:#41644A; color:white; border:none; border-radius:15px; cursor:pointer; font-weight:1200;">RELOAD DASHBOARD</button></div>`;
  }
}

export default HomePresenter;