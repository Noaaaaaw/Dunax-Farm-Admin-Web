import { CONFIG } from '../../config.js';

class HomePresenter {
  constructor({ container }) {
    this.container = container;
  }

  async init() {
    try {
      // ✅ Nembak langsung ke API Production di Railway
      const response = await fetch(`${CONFIG.BASE_URL}/commodities`);
      const result = await response.json();

      if (result.status !== 'success') throw new Error('Respons server gagal');

      const commodities = result.data;
      this._processDataAndRender(commodities);

    } catch (err) {
      console.error("Dashboard Error:", err);
      this._renderError();
    }
  }

  _processDataAndRender(commodities) {
    let allRealData = [];
    let categoryStats = [];
    let salesStats = [];

    // Pengolahan data dari Supabase
    commodities.forEach(cat => {
      // Gunakan data 'details' yang sudah dikirim oleh Backend
      const serverData = cat.details || [];

      // Statistik Stok per Kategori
      const totalStokKategori = serverData.reduce((acc, curr) => acc + (Number(curr.stok) || 0), 0);
      categoryStats.push({ label: cat.nama, stok: totalStokKategori });

      // Statistik Pemasukan (Analisis Omzet)
      const totalPemasukan = serverData.reduce((acc, curr) => acc + (curr.terjual ? curr.terjual * curr.harga : 0), 0);
      salesStats.push({ label: cat.nama, nilai: totalPemasukan });

      // Gabungkan untuk Tabel Utama
      allRealData = [...allRealData, ...serverData.map(item => ({
        ...item,
        kategoriLabel: cat.nama
      }))];
    });

    const totalStokGlobal = allRealData.reduce((acc, curr) => acc + (Number(curr.stok) || 0), 0);
    const summary = {
      totalJenis: allRealData.length,
      totalKategori: commodities.length,
      totalEstimasiNilai: allRealData.reduce((acc, curr) => acc + (curr.harga * curr.stok), 0),
      danaMasuk: salesStats.reduce((acc, curr) => acc + curr.nilai, 0)
    };

    this._render(allRealData, summary, categoryStats, totalStokGlobal, salesStats);
  }

  _renderError() {
    this.container.innerHTML = `
      <div class="dashboard-card" style="background:white; padding:50px; border-radius:20px; text-align:center; border:2px solid #f8d7da;">
        <h3 style="color:#721c24;">⚠️ Koneksi Cloud Terputus</h3>
        <p>Gagal menarik data dari database. Pastikan backend di Railway sudah <b>ACTIVE</b>.</p>
        <button onclick="location.reload()" style="margin-top:20px; padding:10px 25px; background:#41644A; color:white; border:none; border-radius:10px; cursor:pointer;">Segarkan Dashboard</button>
      </div>`;
  }

  _render(data, summary, stats, totalStokGlobal, salesStats) {
    const colors = ['#f39c12', '#41644A', '#3498db', '#9b59b6', '#e74c3c', '#1abc9c'];

    this.container.innerHTML = `
      <div class="dashboard-grid" style="display: flex; flex-direction: column; gap: 24px; padding: 0 20px;">
        
        <div class="summary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          ${this._createSummaryItem('Total Kategori', summary.totalKategori, '#f39c12')}
          ${this._createSummaryItem('Total Produk', summary.totalJenis, '#41644A')}
          ${this._createSummaryItem('Nilai Aset Stok', `Rp ${summary.totalEstimasiNilai.toLocaleString('id-ID')}`, '#3498db')}
          ${this._createSummaryItem('Omzet Terjual', `Rp ${summary.danaMasuk.toLocaleString('id-ID')}`, '#9b59b6')}
        </div>

        <div class="dashboard-card" style="background: white; padding: 24px; border-radius: 20px; border: 1px solid #e0eadd; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h4 style="margin: 0 0 20px; font-weight: 800; text-align: center;">📊 Komposisi Stok Global Per Kategori</h4>
          <div style="display: flex; height: 35px; border-radius: 10px; overflow: hidden; background: #f0f0f0; margin-bottom: 20px;">
            ${stats.map((s, i) => {
              const perc = totalStokGlobal > 0 ? (s.stok / totalStokGlobal * 100) : 0;
              return perc > 0 ? `<div style="width:${perc}%; background:${colors[i % colors.length]}; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.65rem; font-weight: 900;" title="${s.label}">${perc > 10 ? s.label : ''}</div>` : '';
            }).join('')}
          </div>
          <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 15px;">
            ${stats.map((s, i) => `
              <div style="display: flex; align-items: center; gap: 5px;">
                <span style="width:10px; height:10px; border-radius:2px; background:${colors[i % colors.length]}"></span>
                <span style="font-size:0.7rem; font-weight:700;">${s.label}: ${s.stok.toLocaleString('id-ID')}</span>
              </div>`).join('')}
          </div>
        </div>

        <div class="dashboard-card" style="background: white; padding: 24px; border-radius: 20px; border: 1px solid #e0eadd; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h4 style="margin: 0 0 25px; font-weight: 800; text-align: center;">💰 Analisis Pemasukan per Kategori</h4>
          <div style="display: flex; flex-direction: column; gap: 15px;">
            ${salesStats.map((s, i) => {
              const maxVal = Math.max(...salesStats.map(o => o.nilai)) || 1;
              return `
                <div style="display: flex; align-items: center; gap: 15px;">
                  <div style="width: 100px; font-size: 0.7rem; font-weight: 800; text-align: right;">${s.label}</div>
                  <div style="flex-grow: 1; background: #eee; height: 25px; border-radius: 5px; overflow: hidden;">
                    <div style="width: ${(s.nilai / maxVal * 100)}%; height: 100%; background: ${colors[i % colors.length]}; transition: width 1s ease;"></div>
                  </div>
                  <div style="width: 140px; font-size: 0.8rem; font-weight: 800; color: #41644A;">Rp ${s.nilai.toLocaleString('id-ID')}</div>
                </div>`;
            }).join('')}
          </div>
        </div>

        <div class="dashboard-card" style="background: white; border-radius: 20px; border: 1px solid #e0eadd; overflow: hidden; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h4 style="margin: 0 0 20px; font-weight: 800; text-align: center;">📋 Daftar Inventaris Real-time (Supabase)</h4>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
              <thead style="background: #41644A; color: white;">
                <tr>
                  <th style="padding: 12px;">No</th>
                  <th style="padding: 12px;">Kategori</th>
                  <th style="padding: 12px; text-align: left;">Produk</th>
                  <th style="padding: 12px; text-align: right;">Harga</th>
                  <th style="padding: 12px;">Stok</th>
                  <th style="padding: 12px; text-align: right;">Total Nilai</th>
                  <th style="padding: 12px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.map((item, i) => `
                  <tr style="border-bottom: 1px solid #eee; text-align: center;">
                    <td style="padding: 10px; color: #999;">${i + 1}</td>
                    <td style="padding: 10px;"><span style="background:#eef2ed; padding:3px 8px; border-radius:15px; font-size:0.6rem; font-weight:800; color:#41644A; border:1px solid #cddbc9; text-transform:uppercase;">${item.kategoriLabel}</span></td>
                    <td style="padding: 10px; text-align: left; font-weight: 600;">${item.nama}</td>
                    <td style="padding: 10px; text-align: right;">Rp ${item.harga.toLocaleString('id-ID')}</td>
                    <td style="padding: 10px; font-weight: 800;">${item.stok}</td>
                    <td style="padding: 10px; text-align: right; font-weight: 800; color: #41644A;">Rp ${(item.harga * item.stok).toLocaleString('id-ID')}</td>
                    <td style="padding: 10px;">
                      <span style="font-size: 0.65rem; font-weight: 900; color: ${item.aktif ? '#2ecc71' : '#e74c3c'}">
                        ${item.aktif ? '● AKTIF' : '● NON-AKTIF'}
                      </span>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  _createSummaryItem(label, value, color) {
    return `
      <div style="background: ${color}; padding: 20px; border-radius: 15px; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <label style="font-size: 0.75rem; font-weight: 700; opacity: 0.8; text-transform: uppercase;">${label}</label>
        <h3 style="font-size: 1.6rem; margin: 5px 0 0;">${value}</h3>
      </div>`;
  }
}

export default HomePresenter;