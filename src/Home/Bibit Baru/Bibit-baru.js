import BibitBaruPresenter from './Bibit-baru-presenter.js';

const BibitBaru = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width:1200px; margin: 0 auto;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04); text-align: center;">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.5rem; color: #6CA651; letter-spacing: 2px;">PENGADAAN ASSET BARU</h1>
          <p style="color: #666; font-weight: 700; margin-top:10px;">Input Data Pembelian Asset Mandiri</p>
        </div>

        <div class="main-content-card" style="background: white; padding: 40px; border-radius: 30px; border: 1px solid #e0eadd; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <form id="assetBaruForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">PILIH PRODUK ASSET</label>
                    <select id="produkAsset" required style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                        <option value="">-- PILIH PRODUK --</option>
                        <option value="DOC">DOC (Masuk Mesin 1)</option>
                        <option value="PULLET">PULLET</option>
                        <option value="AYAM PEJANTAN">AYAM PEJANTAN</option>
                        <option value="AYAM BETINA">AYAM BETINA</option>
                        <option value="LAINNYA">LAINNYA</option>
                    </select>
                </div>

                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">JUMLAH (EKOR/UNIT)</label>
                    <input type="number" id="jumlahAsset" required min="1" placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>

                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">HARGA BELI (RP)</label>
                    <input type="number" id="hargaAsset" required placeholder="Contoh: 15000" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>

                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">UMUR ASSET (HARI)</label>
                    <input type="number" id="umurAsset" required placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>

                <div class="form-group" style="grid-column: span 2;">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">KETERANGAN DETAIL</label>
                    <textarea id="keteranganAsset" placeholder="Contoh: Pembelian dari Supplier A, Kondisi Sehat" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 600; min-height: 80px;"></textarea>
                </div>

                <button type="submit" style="grid-column: span 2; padding: 20px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 5px 0 #4a7337; text-transform: uppercase; transition: 0.2s;">
                    Simpan ke Tabel Asset
                </button>
            </form>
        </div>

        <div class="dashboard-card" style="background: white; padding: 30px; border-radius: 28px; border: 1px solid #eef2ed;">
            <h3 style="font-weight: 900; color: #1f3326; margin-bottom: 20px; text-align: center; text-transform: uppercase;">📦 DATA RIWAYAT ASSET MASUK</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: center;">
                    <thead style="background: #41644A; color: white;">
                        <tr>
                            <th style="padding: 15px;">TANGGAL</th>
                            <th style="padding: 15px;">PRODUK</th>
                            <th style="padding: 15px;">UMUR</th>
                            <th style="padding: 15px;">JUMLAH</th>
                            <th style="padding: 15px;">TOTAL HARGA</th>
                        </tr>
                    </thead>
                    <tbody id="historyAssetBody">
                        <tr><td colspan="5" style="padding: 30px; color: #ccc;">Memuat data...</td></tr>
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
            historyBody.innerHTML = `<tr><td colspan="5" style="padding: 30px; color: #999;">Belum ada riwayat asset.</td></tr>`;
            return;
        }
        historyBody.innerHTML = history.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px;">${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                <td style="padding: 15px; font-weight: 800;">${item.produk}</td>
                <td style="padding: 15px;">${item.umur || 0} Hari</td>
                <td style="padding: 15px; font-weight: 900; color: #6CA651;">${item.jumlah}</td>
                <td style="padding: 15px; font-weight: 700;">Rp ${(item.jumlah * (item.harga || 0)).toLocaleString()}</td>
            </tr>
        `).join('');
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
            produk: document.getElementById('produkAsset').value,
            jumlah: parseInt(document.getElementById('jumlahAsset').value),
            harga: parseInt(document.getElementById('hargaAsset').value),
            umur: parseInt(document.getElementById('umurAsset').value),
            keterangan: document.getElementById('keteranganAsset').value
        };

        const res = await presenter.submitAsset(payload);
        if (res.status === 'success') {
            alert("Asset Berhasil Disimpan!");
            form.reset();
            await loadHistory();
        } else {
            alert("Gagal: " + (res.message || "Server Error"));
        }
    };
    await loadHistory();
  }
};

export default BibitBaru;