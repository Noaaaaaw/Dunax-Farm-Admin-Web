import BibitBaruPresenter from './Bibit-baru-presenter.js';

const BibitBaru = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04); text-align: center;">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.5rem; color: #6CA651; letter-spacing: 2px; text-transform: uppercase;">
            PENGADAAN ASSET BARU
          </h1>
        </div>

        <div class="main-content-card" style="background: white; padding: 35px; border-radius: 30px; border: 1px solid #e0eadd; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <form id="assetBaruForm" style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 10px; font-size: 0.85rem;">PILIH PRODUK ASSET</label>
                        <select id="produkAsset" required style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eef2ed; background: #f9fbf9; font-weight: 800;">
                            <option value="">-- PILIH PRODUK --</option>
                            <option value="DOC">DOC (ANAK AYAM)</option>
                            <option value="PULLET">PULLET (AYAM REMAJA)</option>
                            <option value="AYAM PEJANTAN">AYAM PEJANTAN</option>
                            <option value="AYAM BETINA">AYAM BETINA</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 10px; font-size: 0.85rem;">JUMLAH MASUK (EKOR)</label>
                        <input type="number" id="jumlahAsset" required min="1" placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eef2ed; font-weight: 800; text-align: center; font-size: 1.2rem;">
                    </div>
                </div>
                <button type="submit" style="width: 100%; padding: 20px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 1200; font-size: 1.1rem; cursor: pointer; box-shadow: 0 6px 0 #4a7337; text-transform: uppercase;">Konfirmasi Asset Baru</button>
            </form>
        </div>

        <div class="dashboard-card" style="background: white; padding: 30px; border-radius: 28px; border: 1px solid #eef2ed;">
            <h3 style="font-weight: 1200; color: #1f3326; margin-bottom: 20px; text-align: center;">📦 RIWAYAT ASSET MASUK</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 0.85rem;">
                    <thead style="background: #41644A; color: white;">
                        <tr>
                            <th style="padding: 15px;">TANGGAL</th>
                            <th style="padding: 15px;">PRODUK</th>
                            <th style="padding: 15px;">JUMLAH MASUK</th>
                        </tr>
                    </thead>
                    <tbody id="historyAssetBody">
                        <tr><td colspan="3" style="padding: 30px; color: #ccc;">Memuat data...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const presenter = new BibitBaruPresenter();
    const form = document.getElementById('assetBaruForm');
    const historyBody = document.getElementById('historyAssetBody');

    const loadHistory = async () => {
        const history = await presenter.fetchHistory();
        if (history.length === 0) {
            historyBody.innerHTML = `<tr><td colspan="3" style="padding: 30px; color: #999; font-style: italic;">Belum ada riwayat pengadaan.</td></tr>`;
            return;
        }
        historyBody.innerHTML = history.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px;">${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                <td style="padding: 15px; font-weight: 800; color: #41644A;">${item.produk}</td>
                <td style="padding: 15px; font-weight: 900;">${item.jumlah.toLocaleString()} EKOR</td>
            </tr>
        `).join('');
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const produk = document.getElementById('produkAsset').value;
        const jumlah = parseInt(document.getElementById('jumlahAsset').value);
        const res = await presenter.submitAsset({ produk, jumlah });
        if (res.status === 'success') {
            alert("Asset Berhasil Ditambahkan ke Stok! 🚀");
            form.reset();
            await loadHistory();
        }
    };
    await loadHistory();
  }
};

export default BibitBaru;