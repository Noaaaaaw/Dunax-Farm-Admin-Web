class HomePresenter {
  constructor({ container }) {
    this.container = container;
  }

  async init() {
    try {
      const response = await fetch('http://localhost:5000/commodities');
      const result = await response.json();
      const commodities = result.data;

      let allRealData = [];
      let categoryStats = [];
      let salesStats = [];

      commodities.forEach(cat => {
        const serverData = (cat.details && cat.details.length > 0)
          ? cat.details
          : JSON.parse(localStorage.getItem(cat.storageKey)) || [];

        const totalStokKategori = serverData.reduce((acc, curr) => acc + curr.stok, 0);
        categoryStats.push({ label: cat.id.toUpperCase(), stok: totalStokKategori });

        const totalPemasukan = serverData.reduce((acc, curr) => acc + (curr.terjual ? curr.terjual * curr.harga : 0), 0);
        salesStats.push({ label: cat.id.toUpperCase(), nilai: totalPemasukan });

        allRealData = [...allRealData, ...serverData.map(item => ({
          ...item,
          kategoriLabel: cat.id.toUpperCase()
        }))];
      });

      const totalStokGlobal = allRealData.reduce((acc, curr) => acc + curr.stok, 0);
      const summary = {
        totalJenis: allRealData.length,
        totalKategori: commodities.length,
        totalEstimasiNilai: allRealData.reduce((acc, curr) => acc + (curr.harga * curr.stok), 0),
        danaMasuk: salesStats.reduce((acc, curr) => acc + curr.nilai, 0)
      };

      this._render(allRealData, summary, categoryStats, totalStokGlobal, salesStats);
    } catch (err) {
      this.container.innerHTML = `<div class="dashboard-card" style="color:red; text-align:center;">Gagal muat data. Cek API port 5000.</div>`;
    }
  }

  _render(data, summary, stats, totalStokGlobal, salesStats) {
    const colors = ['#f39c12', '#41644A', '#3498db', '#9b59b6', '#e74c3c', '#1abc9c'];

    this.container.innerHTML = `
      <div class="dashboard-grid" style="display: flex; flex-direction: column; gap: 24px; padding: 0 20px;">
        
        <div class="summary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          <div class="summary-item accent-orange" style="background: #f39c12; padding: 20px; border-radius: 15px; color: white;">
            <label style="font-size: 0.8rem; font-weight: 700; opacity: 0.9;">Total Kategori</label>
            <h3 style="font-size: 1.8rem; margin: 5px 0 0;">${summary.totalKategori}</h3>
          </div>
          <div class="summary-item accent-green" style="background: #41644A; padding: 20px; border-radius: 15px; color: white;">
            <label style="font-size: 0.8rem; font-weight: 700; opacity: 0.9;">Total Item</label>
            <h3 style="font-size: 1.8rem; margin: 5px 0 0;">${summary.totalJenis}</h3>
          </div>
          <div class="summary-item accent-blue" style="background: #3498db; padding: 20px; border-radius: 15px; color: white;">
            <label style="font-size: 0.8rem; font-weight: 700; opacity: 0.9;">Nilai Stok</label>
            <h3 style="font-size: 1.8rem; margin: 5px 0 0;">Rp ${summary.totalEstimasiNilai.toLocaleString('id-ID')}</h3>
          </div>
          <div class="summary-item accent-purple" style="background: #9b59b6; padding: 20px; border-radius: 15px; color: white;">
            <label style="font-size: 0.8rem; font-weight: 700; opacity: 0.9;">Dana Masuk</label>
            <h3 style="font-size: 1.8rem; margin: 5px 0 0;">Rp ${summary.danaMasuk.toLocaleString('id-ID')}</h3>
          </div>
        </div>

        <div class="dashboard-card" style="background: white; padding: 24px; border-radius: 20px; border: 1px solid #e0eadd;">
          <div style="width: 100%; display: flex; justify-content: center; margin-bottom: 20px;">
              <h4 style="margin: 0; font-weight: 800; text-align: center;">📊 Perbandingan Stok Global Per Kategori</h4>
          </div>

          <div class="stock-bar-container" style="display: flex; height: 35px; border-radius: 10px; overflow: hidden; background: #eee; margin-bottom: 20px;">
            ${stats.map((s, i) => {
              const perc = totalStokGlobal > 0 ? (s.stok / totalStokGlobal * 100) : 0;
              return perc > 0 ? `<div class="stock-segment" style="width:${perc}%; background:${colors[i % colors.length]}; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.7rem; font-weight: 900;">${perc > 8 ? s.label : ''}</div>` : '';
            }).join('')}
          </div>

          <div class="chart-legend" style="display: flex; justify-content: center; flex-wrap: wrap; gap: 15px; padding-top: 10px; border-top: 1px dashed #eee;">
            ${stats.map((s, i) => `
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 12px; height: 12px; border-radius: 3px; background: ${colors[i % colors.length]};"></span>
                <span style="font-size: 0.75rem; font-weight: 700; color: #555;">${s.label}: ${s.stok.toLocaleString('id-ID')} unit</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="dashboard-card" style="background: white; padding: 24px; border-radius: 20px; border: 1px solid #e0eadd;">
          <div style="width: 100%; display: flex; justify-content: center; margin-bottom: 25px;">
            <h4 style="margin: 0; font-weight: 800; text-align: center;">💰 Analisis Pemasukan per Kategori</h4>
          </div>
          
          <div class="chart-wrapper-horizontal" style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
            ${salesStats.map((s, i) => {
              const maxVal = Math.max(...salesStats.map(o => o.nilai)) || 1;
              const widthPerc = (s.nilai / maxVal * 100);
              return `
                <div style="display: flex; align-items: center; gap: 15px;">
                  <div style="width: 80px; font-size: 0.75rem; font-weight: 800; color: #555; text-align: right; flex-shrink: 0;">
                    ${s.label}
                  </div>
                  <div style="flex-grow: 1; background: #f0f4f1; height: 30px; border-radius: 6px; overflow: hidden; position: relative;">
                    <div style="width: ${widthPerc}%; height: 100%; background: ${colors[i % colors.length]}; border-radius: 0 6px 6px 0; transition: width 1s ease-out;"></div>
                  </div>
                  <div style="width: 140px; font-size: 0.85rem; font-weight: 800; color: #41644A; flex-shrink: 0;">
                    Rp ${s.nilai.toLocaleString('id-ID')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="dashboard-card" style="background: white; border-radius: 20px; border: 1px solid #e0eadd; overflow: hidden; padding: 24px;">
          <div style="width: 100%; display: flex; justify-content: center; margin-bottom: 20px;">
            <h4 style="margin: 0; font-weight: 800; text-align: center;">📋 Daftar Persediaan Terpusat</h4>
          </div>
          
          <div class="table-wrapper" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d1d1; font-family: sans-serif;">
              <thead>
                <tr style="background: #f2f2f2; color: #333; border-bottom: 2px solid #bbb;">
                  <th style="padding: 12px; border: 1px solid #d1d1d1; text-align: center;">No</th>
                  <th style="padding: 12px; border: 1px solid #d1d1d1; text-align: center;">Kategori</th>
                  <th style="padding: 12px; border: 1px solid #d1d1d1; text-align: center;">Produk</th>
                  <th style="padding: 12px; border: 1px solid #d1d1d1; text-align: center;">Harga</th>
                  <th style="padding: 12px; border: 1px solid #d1d1d1; text-align: center;">Stok</th>
                  <th style="padding: 12px; border: 1px solid #d1d1d1; text-align: center;">Total Nilai</th>
                  <th style="padding: 12px; border: 1px solid #d1d1d1; text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.map((item, i) => `
                  <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#fafafa'}; text-align: center;">
                    <td style="padding: 10px; border: 1px solid #d1d1d1;">${i + 1}</td>
                    <td style="padding: 10px; border: 1px solid #d1d1d1;">
                       <span style="background: #eef2ed; padding: 4px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 800; color: #41644A; border: 1px solid #cddbc9;">
                         ${item.kategoriLabel}
                       </span>
                    </td>
                    <td style="padding: 10px; border: 1px solid #d1d1d1; font-weight: 600; text-align: left;">${item.nama}</td>
                    <td style="padding: 10px; border: 1px solid #d1d1d1; text-align: right;">Rp ${item.harga.toLocaleString('id-ID')}</td>
                    <td style="padding: 10px; border: 1px solid #d1d1d1; font-weight: 800;">${item.stok}</td>
                    <td style="padding: 10px; border: 1px solid #d1d1d1; text-align: right; font-weight: 800; color: #41644A;">Rp ${(item.harga * item.stok).toLocaleString('id-ID')}</td>
                    <td style="padding: 10px; border: 1px solid #d1d1d1;">
                      <span style="font-size: 0.7rem; font-weight: 900; color: ${item.aktif ? '#2ecc71' : '#e74c3c'}">
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
}

export default HomePresenter;