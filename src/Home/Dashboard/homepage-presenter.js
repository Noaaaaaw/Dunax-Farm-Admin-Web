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
      const [resInv, resOpAyam, resOpKambing] = await Promise.all([
        fetch(`${CONFIG.BASE_URL}/commodities`),
        fetch(`${CONFIG.BASE_URL}/api/laporan`),
        fetch(`${CONFIG.BASE_URL}/api/laporan-kambing`)
      ]);

      const resultInv = await resInv.json();
      const resultOpAyam = await resOpAyam.json();
      const resultOpKambing = await resOpKambing.json();

      if (resultInv.status !== 'success' || resultOpAyam.status !== 'success' || resultOpKambing.status !== 'success') {
        throw new Error('Respons server gagal');
      }

      this.allCommoditiesData = resultInv.data;
      this.allOperationalData = [...(resultOpAyam.data || []), ...(resultOpKambing.data || [])];
      
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

    const eggEfficiency = this._calculateEggEfficiency();

    this.summaryData = {
      categoryStats,
      salesStats,
      eggEfficiency,
      totalStokGlobal: allItems.reduce((acc, curr) => acc + (Number(curr.stok) || 0), 0),
      totalDanaMasukGlobal: salesStats.reduce((acc, curr) => acc + curr.nilai, 0),
      summaryItems: {
        totalJenis: allItems.length,
        totalKategori: this.allCommoditiesData.length,
        totalEstimasiNilai: allItems.reduce((acc, curr) => acc + (curr.harga * curr.stok), 0),
        danaMasuk: salesStats.reduce((acc, curr) => acc + curr.nilai, 0)
      }
    };
  }

  _calculateEggEfficiency() {
    const dateStr = this.viewDate.toLocaleDateString('id-ID');
    let totalPanenHariIni = 0;

    this.allOperationalData.forEach(op => {
      const itemDate = new Date(op.tanggal_jam || op.created_at).toLocaleDateString('id-ID');
      if (itemDate === dateStr && op.hewan.toLowerCase().includes('ayam')) {
        let panenRecord = parseInt(op.total_panen) || 0;
        if (panenRecord === 0) {
            const jobPanen = (op.pekerjaan_data || []).find(j => j.name.toLowerCase().includes('panen telur'));
            panenRecord = parseInt(jobPanen?.val) || 0;
        }
        totalPanenHariIni += panenRecord;
      }
    });

    const targetKapasitas = 5 * 15 * 10; 
    const persentase = targetKapasitas > 0 ? ((totalPanenHariIni / targetKapasitas) * 100).toFixed(1) : 0;

    return { hasil: totalPanenHariIni, target: targetKapasitas, persen: persentase, deret: 10 };
}
  
  _renderFullDashboard() {
    this._renderMainStructure();
    this._renderOperationalTable(); 
    this._renderProductionStats(); 
    this._setupNavigationEvents();
    this._bindTableButtons();
    this._setupGlobalModalEvents();
  }

  _renderMainStructure() {
    const { summaryItems, salesStats, totalDanaMasukGlobal, categoryStats, totalStokGlobal } = this.summaryData;
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
          <h4 style="margin: 0 0 25px; font-weight: 1200; font-size: 1rem; text-transform: uppercase; color: #14280a; letter-spacing: 1px; text-align: center;">📊 KOMPOSISI STOK GLOBAL PER KATEGORI</h4>
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

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px;">
            <div class="dashboard-card" style="background: white; padding: 30px; border-radius: 24px; border: 1px solid #e0eadd; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <h4 style="margin: 0 0 30px; font-weight: 1200; font-size: 1rem; text-transform: uppercase; color: #14280a; text-align: center;">💰 ANALISIS PEMASUKAN PER KATEGORI</h4>
              <div style="display: flex; flex-direction: column; gap: 15px;">
                ${salesStats.map((s, i) => {
                  const perc = totalDanaMasukGlobal > 0 ? ((s.nilai / totalDanaMasukGlobal) * 100).toFixed(1) : 0;
                  return `
                    <div style="display: flex; align-items: center; gap: 15px;">
                      <div style="width: 100px; font-size: 0.7rem; font-weight: 900; color: #4a5568;">${s.label}</div>
                      <div style="flex-grow: 1; background: #edf2f7; height: 16px; border-radius: 8px; overflow: hidden;">
                        <div style="width: ${perc}%; height: 100%; background: ${colors[i % colors.length]}; transition: width 1s;"></div>
                      </div>
                      <div style="width: 45px; font-size: 0.75rem; font-weight: 1200; color: #41644A;">${perc}%</div>
                    </div>`;
                }).join('')}
              </div>
            </div>

            <div id="productionStatsContainer" class="dashboard-card" style="background: white; padding: 30px; border-radius: 24px; border: 1px solid #e0eadd; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center;">
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
                  <th style="padding: 18px; text-align: center;">STATUS</th>
                  <th style="padding: 18px; text-align: center;">PRODUK</th>
                </tr>
              </thead>
              <tbody>
                ${this.summaryData.categoryStats.map((cat, i) => `
                  <tr style="border-bottom: 1px solid #eee; text-align: center;">
                    <td style="padding: 15px; color: #999;">${i + 1}</td>
                    <td style="padding: 15px;"><span style="background:#eef2ed; padding:5px 12px; border-radius:15px; font-size:0.7rem; font-weight:900; color:#41644A; border:1px solid #cddbc9;">${cat.label}</span></td>
                    <td style="padding: 15px; font-weight: 1200; color: #14280a; font-size: 1rem;">${cat.stok.toLocaleString('id-ID')}</td>
                    <td style="padding: 15px;"><span style="font-size: 0.75rem; font-weight: 1200; color: ${cat.aktif ? '#2ecc71' : '#e74c3c'}">${cat.aktif ? '● AKTIF' : '● OFF'}</span></td>
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
  
  _renderProductionStats() {
    const container = document.getElementById('productionStatsContainer');
    if (!container) return;
    const stats = this._calculateEggEfficiency();
    
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateLabel = this.viewDate.toLocaleDateString('id-ID', options).toUpperCase();

    container.innerHTML = `
        <h4 style="margin: 0 0 15px; font-weight: 1200; font-size: 0.9rem; text-transform: uppercase; color: #14280a; text-align: center;">📈 MONITOR PRODUKTIVITAS TELUR</h4>
        
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 20px; background: #f0f4f0; padding: 10px; border-radius: 12px;">
            <button type="button" id="prevDateEgg" style="background: #6CA651; color: white; border: none; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-weight: 900; font-size: 0.7rem;">&laquo; PREV</button>
            <span style="font-weight: 900; font-size: 0.75rem; color: #14280a; min-width: 150px; text-align: center;">${dateLabel}</span>
            <button type="button" id="nextDateEgg" style="background: #6CA651; color: white; border: none; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-weight: 900; font-size: 0.7rem;">NEXT &raquo;</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f9fbf9; padding: 15px; border-radius: 18px; border: 1px solid #eef2ed;">
                <div>
                    <span style="display:block; font-size:0.65rem; font-weight:900; color:#666; margin-bottom: 5px;">PANEN TANGGAL INI</span>
                    <span style="font-size:1.6rem; font-weight:1200; color:#6CA651;">${stats.hasil} <small style="font-size:0.75rem; font-weight: 800;">BUTIR</small></span>
                </div>
                <div style="text-align:right;">
                    <span style="display:block; font-size:0.65rem; font-weight:900; color:#666; margin-bottom: 5px;">KAPASITAS TOTAL</span>
                    <span style="font-size:1.6rem; font-weight:1200; color:#14280a;">${stats.deret} <small style="font-size:0.75rem; font-weight: 800;">BARIS</small></span>
                </div>
            </div>
            <div style="background: #6CA651; padding: 25px; border-radius: 25px; color: white; text-align: center; box-shadow: 0 10px 25px rgba(108,166,81,0.25);">
                <label style="font-size:0.7rem; font-weight:900; opacity:0.8; letter-spacing: 1px;">EFISIENSI PRODUKSI</label>
                <div style="font-size:2.8rem; font-weight:1200; margin:5px 0;">${stats.persen}%</div>
                <div style="font-size:0.75rem; font-weight:800; background:rgba(255,255,255,0.2); display:inline-block; padding:6px 16px; border-radius:12px; border: 1px solid rgba(255,255,255,0.3);">
                    TARGET IDEAL: ${stats.target} BUTIR
                </div>
            </div>
        </div>
        <div style="margin-top: 20px; font-size: 0.6rem; color: #999; text-align: center; font-weight: 700;">
            * TARGET: (5 Ekor x 15 Kotak x 10 Baris) = 750 Indukan
        </div>
    `;

    document.getElementById('prevDateEgg').onclick = () => {
        this.viewDate.setDate(this.viewDate.getDate() - 1);
        this._renderProductionStats(); // Update box telur
        this._renderOperationalTable(); // Update tabel harian biar sinkron
    };
    document.getElementById('nextDateEgg').onclick = () => {
        this.viewDate.setDate(this.viewDate.getDate() + 1);
        this._renderProductionStats();
        this._renderOperationalTable();
    };
}

  _renderOperationalTable() {
    const tableBody = document.getElementById('opTableBodyHome');
    const dateDisplay = document.getElementById('currentDateDisplayHome');
    if (!tableBody || !dateDisplay) return;

    const selectedDateStr = this.viewDate.toLocaleDateString('id-ID');
    dateDisplay.innerText = this.viewDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();

    const filteredData = this.allOperationalData.filter(item => {
        const itemDate = item.tanggal_jam || item.created_at;
        return new Date(itemDate).toLocaleDateString('id-ID') === selectedDateStr;
    });

    if (filteredData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="padding: 50px; color: #ccc; text-align: center;">Tidak ada aktivitas operasional pada tanggal ini.</td></tr>`;
      return;
    }

    filteredData.sort((a, b) => new Date(b.tanggal_jam || b.created_at) - new Date(a.tanggal_jam || a.created_at));

    tableBody.innerHTML = filteredData.map(item => {
      const kesehatan = item.kesehatan_data || { status: 'SEHAT', detail: [] };
      const kelayakan = item.kelayakan_data || { status: 'LAYAK', problems: [] };
      const pekerjaan = item.pekerjaan_data || [];
      const time = new Date(item.tanggal_jam || item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      const isAman = pekerjaan.length > 0 && pekerjaan.every(p => p.status === true);
      const hColor = kesehatan.status === 'SAKIT' ? {bg:'#fff5f5', txt:'#c53030'} : {bg:'#eef2ed', txt:'#2d4a36'};
      const lColor = (kelayakan.status === 'TIDAK LAYAK' || kelayakan.status === 'TIDAK_STANDAR') ? {bg:'#fff5f5', txt:'#c53030'} : {bg:'#eef2ed', txt:'#2d4a36'};

      return `
        <tr style="border-bottom: 1px solid #eee; text-align: center;">
          <td style="padding: 15px; font-weight: 700;">${time} WIB</td>
          <td style="padding: 15px; font-weight: 1200;">${item.hewan}</td>
          <td style="padding: 15px;">${item.deret_kandang || item.deret}</td>
          <td style="padding: 15px;">${item.sesi}</td>
          <td style="padding: 15px;"><button class="btn-pop-health" data-hewan="${item.hewan}" data-status="${kesehatan.status}" data-detail='${JSON.stringify(kesehatan.detail)}' style="border:none; padding:6px 15px; border-radius:10px; font-weight:1200; cursor:pointer; background:${hColor.bg}; color:${hColor.txt};">${kesehatan.status}</button></td>
          <td style="padding: 15px;"><button class="btn-pop-layak" data-status="${kelayakan.status}" data-problems='${JSON.stringify(kelayakan.problems || [])}' style="border:none; padding:6px 15px; border-radius:10px; font-weight:1200; cursor:pointer; background:${lColor.bg}; color:${lColor.txt};">${kelayakan.status}</button></td>
          <td style="padding: 15px; font-weight: 900;">${item.petugas}</td>
          <td style="padding: 15px;">
            <button class="btn-pop-task" data-tasks='${JSON.stringify(pekerjaan)}' style="border:none; padding:8px 18px; border-radius:10px; font-weight:1200; color:white; background:${isAman ? '#41644A' : '#e74c3c'}; cursor:pointer;">
                LIHAT KERJA
            </button>
          </td>
        </tr>`;
    }).join('');

    this._bindTableButtons(); 
  }

  _setupNavigationEvents() {
    const prev = document.getElementById('prevDateHome');
    const next = document.getElementById('nextDateHome');
    if (prev) prev.onclick = () => { this.viewDate.setDate(this.viewDate.getDate() - 1); this._renderOperationalTable(); this._renderProductionStats(); };
    if (next) next.onclick = () => { this.viewDate.setDate(this.viewDate.getDate() + 1); this._renderOperationalTable(); this._renderProductionStats(); };
  }

  _bindTableButtons() {
    this.container.querySelectorAll('.btn-pop-health').forEach(btn => {
      btn.onclick = () => {
        const { status, detail, hewan } = btn.dataset;
        if (status === 'SEHAT') return alert(`${hewan} Sehat Semua! ✅`);
        const details = JSON.parse(detail);
        const isKambing = hewan.toLowerCase().includes('kambing');
        document.getElementById('modalTitleText').innerHTML = `<span style="font-size: 0.7rem; font-weight: 1000; letter-spacing: 1px;">DETAIL ${hewan.toUpperCase()} SAKIT ⚠️</span>`;
        document.getElementById('modalNote').innerHTML = `<div style="overflow-x:auto; border-radius:12px; border:2px solid #000; margin-top:5px;"><table class="pop-table" style="width:100%; border-collapse:collapse;"><thead><tr><th style="padding:10px; border:2px solid #000; font-size:0.75rem;">NO. KDG</th><th style="padding:10px; border:2px solid #000; font-size:0.75rem;">ID</th><th style="padding:10px; border:2px solid #000; font-size:0.75rem;">GEJALA</th>${isKambing ? '<th style="padding:10px; border:2px solid #000; font-size:0.75rem;">PEMULIHAN</th>' : '<th style="padding:10px; border:2px solid #000; font-size:0.75rem;">OBAT</th>'}</tr></thead><tbody style="text-align:center;">${details.map(d => `<tr><td style="padding:10px; border:2px solid #000;">${d.kandang}</td><td style="padding:10px; border:2px solid #000;">${d.noKambing || d.ayam || '-'}</td><td style="padding:10px; border:2px solid #000;">${d.penyakit}</td><td style="padding:10px; border:2px solid #000;">${d.recovery || d.obat || '-'}</td></tr>`).join('')}</tbody></table></div>`;
        document.getElementById('statusModal').style.display = 'flex';
      };
    });

    this.container.querySelectorAll('.btn-pop-layak').forEach(btn => {
      btn.onclick = () => {
        const { status, problems } = btn.dataset;
        if (status === 'LAYAK') return alert("Aman!");
        const details = JSON.parse(problems);
        document.getElementById('modalNote').innerHTML = `<table style="width:100%; border:2px solid #000;">${details.map(p => `<tr><td>${p.kandang}</td><td>${p.note}</td></tr>`).join('')}</table>`;
        document.getElementById('statusModal').style.display = 'flex';
      };
    });

    this.container.querySelectorAll('.btn-pop-task').forEach(btn => {
      btn.onclick = () => {
        const tasks = JSON.parse(btn.dataset.tasks);
        document.getElementById('taskListContent').innerHTML = `<table style="width:100%;">${tasks.map(t => `<tr><td>${t.status?'✅':'❌'}</td><td>${t.name}</td><td>${t.val}</td></tr>`).join('')}</table>`;
        document.getElementById('taskModal').style.display = 'flex';
      };
    });

    this.container.querySelectorAll('.btn-pop-inv-category').forEach(btn => {
      btn.onclick = () => {
        const products = JSON.parse(btn.dataset.products);
        document.getElementById('modalNote').innerHTML = `<div style="padding:20px;">${products.map(p => `<div>${p.nama}: ${p.stok}</div>`).join('')}</div>`;
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
    return `<div style="background: ${color}; padding: 25px; border-radius: 20px; color: white; text-align:center;"><label style="font-size: 0.75rem; font-weight: 800; opacity: 0.9;">${label}</label><h3 style="font-size: 1.5rem; margin: 10px 0 0; font-weight: 1200;">${value}</h3></div>`;
  }

  _renderError() {
    this.container.innerHTML = `<div style="padding:60px; text-align:center;"><h3 style="color:#c53030;">⚠️ DATABASE ERROR</h3><button onclick="location.reload()">RELOAD</button></div>`;
  }
}

export default HomePresenter;