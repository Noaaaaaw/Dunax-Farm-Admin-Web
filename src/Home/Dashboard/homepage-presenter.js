import { CONFIG } from '../../config.js';

class HomePresenter {
  constructor({ container }) {
    this.container = container;
    this.viewDate = new Date(); 
    this.statsMonthDate = new Date(); // State navigasi bulan untuk grafik tren
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

    // 1. Proses Data Komoditas & Pemasukan per Kategori
    this.allCommoditiesData.forEach(cat => {
      const serverData = cat.details || [];
      const totalStokKategori = serverData.reduce((acc, curr) => acc + (Number(curr.stok) || 0), 0);
      
      categoryStats.push({ 
        label: cat.nama, 
        stok: totalStokKategori,
        aktif: cat.aktif,
        products: serverData 
      });

      // Rumus: Total Penjualan per Kategori (Berdasarkan terjual * harga)
      const totalPemasukan = serverData.reduce((acc, curr) => acc + (curr.terjual ? curr.terjual * curr.harga : 0), 0);
      salesStats.push({ label: cat.nama, nilai: totalPemasukan });

      allItems = [...allItems, ...serverData.map(item => ({ ...item, kategoriLabel: cat.nama }))];
    });

    // 2. Kalkulasi Efisiensi Produksi Telur (Sesuai Revisi Tabel)
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
    const getPopulasi = (name) => {
      const cat = this.allCommoditiesData.find(c => c.nama.toLowerCase().includes(name.toLowerCase()));
      return cat ? cat.details.reduce((acc, curr) => acc + (Number(curr.stok) || 0), 0) : 0;
    };

    const popAyam = getPopulasi('Ayam');
    const popBebek = getPopulasi('Bebek');

    // Ambil panen dari data operasional pada viewDate
    const dateStr = this.viewDate.toLocaleDateString('id-ID');
    let panenAyam = 0;
    let panenBebek = 0;

    this.allOperationalData.forEach(op => {
      if (new Date(op.tanggal_jam || op.created_at).toLocaleDateString('id-ID') === dateStr) {
        const tasks = op.pekerjaan_data || [];
        tasks.forEach(t => {
          if (t.name.toLowerCase().includes('panen telur')) {
            if (op.hewan.toLowerCase().includes('ayam')) panenAyam += (parseInt(t.val) || 0);
            if (op.hewan.toLowerCase().includes('bebek')) panenBebek += (parseInt(t.val) || 0);
          }
        });
      }
    });

    return {
      ayam: { hasil: panenAyam, populasi: popAyam, persen: popAyam > 0 ? ((panenAyam / popAyam) * 100).toFixed(1) : 0 },
      bebek: { hasil: panenBebek, populasi: popBebek, persen: popBebek > 0 ? ((panenBebek / popBebek) * 100).toFixed(1) : 0 }
    };
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
    const { summaryItems, salesStats, totalDanaMasukGlobal } = this.summaryData;
    const colors = ['#f39c12', '#41644A', '#3498db', '#9b59b6', '#e74c3c', '#1abc9c'];

    this.container.innerHTML = `
      <div class="dashboard-grid" style="display: flex; flex-direction: column; gap: 24px; padding: 0 20px;">
        
        <div class="summary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          ${this._createSummaryItem('Total Kategori', summaryItems.totalKategori, '#f39c12')}
          ${this._createSummaryItem('Total Produk', summaryItems.totalJenis, '#41644A')}
          ${this._createSummaryItem('Nilai Omzet Stok', `Rp ${summaryItems.totalEstimasiNilai.toLocaleString('id-ID')}`, '#3498db')}
          ${this._createSummaryItem('Omzet Terjual', `Rp ${summaryItems.danaMasuk.toLocaleString('id-ID')}`, '#9b59b6')}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            
            <div class="dashboard-card" style="background: white; padding: 30px; border-radius: 24px; border: 1px solid #e0eadd; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <h4 style="margin: 0 0 30px; font-weight: 1200; font-size: 1rem; text-transform: uppercase; color: #14280a; text-align: center;"> ANALISIS PEMASUKAN PER KATEGORI</h4>
              <div style="display: flex; flex-direction: column; gap: 15px;">
                ${salesStats.map((s, i) => {
                  const perc = totalDanaMasukGlobal > 0 ? ((s.nilai / totalDanaMasukGlobal) * 100).toFixed(1) : 0;
                  return `
                    <div style="display: flex; align-items: center; gap: 15px;">
                      <div style="width: 100px; font-size: 0.7rem; font-weight: 900; color: #4a5568; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.label}</div>
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

    const { ayam, bebek } = this.summaryData.eggEfficiency;

    container.innerHTML = `
        <h4 style="margin: 0 0 25px; font-weight: 1200; font-size: 1rem; text-transform: uppercase; color: #14280a; text-align: center;">📈 ANALISA PRODUKSI TELUR HARIAN</h4>
        <div style="width: 100%; display: flex; flex-direction: column; gap: 25px;">
            <div style="background: #f9fbf9; padding: 15px; border-radius: 15px; border: 1px solid #eef2ed;">
                <div style="display:flex; justify-content: space-between; font-size: 0.75rem; font-weight: 900; margin-bottom: 10px; color: #41644A;">
                    <span>AYAM PETELUR</span>
                    <span>${ayam.persen}%</span>
                </div>
                <div style="background: #edf2f7; height: 22px; border-radius: 11px; overflow: hidden; position: relative; border: 1px solid #e2e8f0;">
                    <div style="width: ${ayam.persen}%; height: 100%; background: #6CA651; transition: width 1s;"></div>
                    <span style="position: absolute; width: 100%; text-align: center; top: 0; font-size: 0.7rem; line-height: 20px; color: #14280a; font-weight: 1200;">
                        ${ayam.hasil} / ${ayam.populasi} BUTIR
                    </span>
                </div>
            </div>

            <div style="background: #f9fbf9; padding: 15px; border-radius: 15px; border: 1px solid #eef2ed;">
                <div style="display:flex; justify-content: space-between; font-size: 0.75rem; font-weight: 900; margin-bottom: 10px; color: #2980b9;">
                    <span>BEBEK PETELUR</span>
                    <span>${bebek.persen}%</span>
                </div>
                <div style="background: #edf2f7; height: 22px; border-radius: 11px; overflow: hidden; position: relative; border: 1px solid #e2e8f0;">
                    <div style="width: ${bebek.persen}%; height: 100%; background: #3498db; transition: width 1s;"></div>
                    <span style="position: absolute; width: 100%; text-align: center; top: 0; font-size: 0.7rem; line-height: 20px; color: #14280a; font-weight: 1200;">
                        ${bebek.hasil} / ${bebek.populasi} BUTIR
                    </span>
                </div>
            </div>
        </div>
        <div style="margin-top: 20px; padding: 10px; background: #fffdf0; border: 1px dashed #f1c40f; border-radius: 10px; font-size: 0.65rem; color: #7f8c8d; font-weight: 700; text-align: center;">
            RUMUS: (HASIL PANEN / TOTAL POPULASI) x 100%
        </div>
    `;
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
    if (prev) prev.onclick = () => { 
        this.viewDate.setDate(this.viewDate.getDate() - 1); 
        this._processInitialStats(); // Re-calculate efficiency for new date
        this._renderOperationalTable(); 
        this._renderProductionStats();
    };
    if (next) next.onclick = () => { 
        this.viewDate.setDate(this.viewDate.getDate() + 1); 
        this._processInitialStats();
        this._renderOperationalTable(); 
        this._renderProductionStats();
    };
  }

  _bindTableButtons() {
    this.container.querySelectorAll('.btn-pop-health').forEach(btn => {
      btn.onclick = () => {
        const { status, detail, hewan } = btn.dataset;
        if (status === 'SEHAT') return alert(`${hewan} Sehat Semua! ✅`);
        const details = JSON.parse(detail);
        const isKambing = hewan.toLowerCase().includes('kambing');
        document.getElementById('modalTitleText').innerHTML = `<span style="font-size: 0.7rem; font-weight: 1000; letter-spacing: 1px;">DETAIL ${hewan.toUpperCase()} SAKIT ⚠️</span>`;
        document.getElementById('modalNote').innerHTML = `<div style="overflow-x:auto; border-radius:12px; border:2px solid #000; margin-top:5px;"><table class="pop-table" style="width:100%; border-collapse:collapse;"><thead><tr><th style="padding:10px; border:2px solid #000; font-size:0.75rem;">Nomor Kandang</th><th style="padding:10px; border:2px solid #000; font-size:0.75rem;">${isKambing ? 'ID KAMBING' : 'AYAM'}</th><th style="padding:10px; border:2px solid #000; font-size:0.75rem;">GEJALA</th>${isKambing ? '<th style="padding:10px; border:2px solid #000; font-size:0.75rem;">PEMULIHAN</th><th style="padding:10px; border:2px solid #000; font-size:0.75rem;">KARANTINA</th>' : '<th style="padding:10px; border:2px solid #000; font-size:0.75rem;">OBAT</th>'}</tr></thead><tbody style="text-align:center;">${details.map(d => `<tr><td style="padding:10px; border:2px solid #000; font-weight:900;">${d.kandang}</td><td style="padding:10px; border:2px solid #000;">${d.noKambing || d.ayam || '-'}</td><td style="padding:10px; border:2px solid #000; text-align:left;">${d.penyakit}</td><td style="padding:10px; border:2px solid #000; text-align:left;">${d.recovery || d.pemulihan || d.obat || '-'}</td>${isKambing ? `<td style="padding:10px; border:2px solid #000; font-weight:bold; color:${d.karantina === 'YA' ? '#c53030' : '#2d4a36'}">${d.karantina || 'TIDAK'}</td>` : ''}</tr>`).join('')}</tbody></table></div>`;
        document.getElementById('statusModal').style.display = 'flex';
      };
    });

    this.container.querySelectorAll('.btn-pop-layak').forEach(btn => {
      btn.onclick = () => {
        const { status, problems } = btn.dataset;
        if (status === 'LAYAK') return alert("Kandang Aman!");
        const details = JSON.parse(problems);
        document.getElementById('modalTitleText').innerHTML = `<span style="font-size: 0.8rem; font-weight: 1200; letter-spacing: 1px;">DETAIL MASALAH KELAYAKAN ⚠️</span>`;
        document.getElementById('modalNote').innerHTML = `<table class="pop-table" style="width:100%; border-collapse:collapse; border:2.5px solid #000;"><thead><tr><th style="padding:10px; border:2.5px solid #000;">KDG</th><th style="padding:10px; border:2.5px solid #000;">RINCIAN MASALAH & BUKTI</th></tr></thead><tbody>${details.map(p => `<tr><td style="padding:10px; border:2.5px solid #000; font-weight:900;">${p.kandang}</td><td style="padding:10px; border:2.5px solid #000; text-align:left;"><div style="margin-bottom:10px; font-weight:800;">${p.note || '-'}</div>${p.photo ? `<img src="${p.photo}" style="width:100%; border-radius:12px; border:2.5px solid #000; display:block;">` : ''}</td></tr>`).join('')}</tbody></table>`;
        document.getElementById('statusModal').style.display = 'flex';
      };
    });

    this.container.querySelectorAll('.btn-pop-task').forEach(btn => {
      btn.onclick = () => {
        const tasks = JSON.parse(btn.dataset.tasks);
        document.getElementById('taskListContent').innerHTML = `<div style="overflow-x:auto; border-radius:12px; border:2.5px solid #000; margin-top:5px;"><table class="pop-table" style="width:100%; border-collapse:collapse;"><thead style="background:#6CA651; color:white;"><tr><th style="padding:12px; border:2.5px solid #000;">STATUS</th><th style="padding:12px; border:2.5px solid #000;">TUGAS OPERASIONAL</th><th style="padding:12px; border:2.5px solid #000;">HASIL</th></tr></thead><tbody style="text-align:center;">${tasks.map(t => `<tr><td style="padding:12px; border:2.5px solid #000; font-size:1.2rem;">${t.status ? '✅' : '❌'}</td><td style="padding:12px; border:2.5px solid #000; text-align:left; font-weight: 700;">${t.name}</td><td style="padding:12px; border:2.5px solid #000; font-weight:900; color:#41644A;">${t.val || '-'} ${t.unit || ''}</td></tr>`).join('')}</tbody></table></div>`;
        document.getElementById('taskModal').style.display = 'flex';
      };
    });

    this.container.querySelectorAll('.btn-pop-inv-category').forEach(btn => {
      btn.onclick = () => {
        const catName = btn.dataset.catname;
        const products = JSON.parse(btn.dataset.products);
        document.getElementById('modalNote').innerHTML = `<div style="text-align:center;"><h3 style="font-weight:1200; margin-bottom:15px; color:#41644A;">DAFTAR PRODUK: ${catName.toUpperCase()}</h3><div style="background:#f9fbf9; border-radius:20px; border:1px solid #eef2ed; overflow:hidden;"><table style="width:100%; border-collapse:collapse; font-size:0.85rem;"><thead style="background:#eef2ed;"><tr style="text-align:center;"><th style="padding:12px;">NAMA</th><th style="padding:12px;">STOK</th><th style="padding:12px;">STATUS</th></tr></thead><tbody style="text-align:center;">${products.map(p => `<tr style="border-bottom:1px solid #eee; background:white;"><td style="padding:12px; text-align:left; font-weight:700;">${p.nama}</td><td style="padding:12px; font-weight:900;">${p.stok}</td><td style="padding:12px;"><span style="font-size:0.7rem; font-weight:900; color:${p.aktif ? '#2ecc71' : '#e74c3c'}">${p.aktif ? '● AKTIF' : '● OFF'}</span></td></tr>`).join('')}</tbody></table></div></div>`;
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