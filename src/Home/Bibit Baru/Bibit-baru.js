import BibitBaruPresenter from './Bibit-baru-presenter.js';

const BibitBaru = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width:1200px; margin: 0 auto; min-height: 100vh;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px; text-align: center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy'; color: #6CA651; font-size: 2.5rem; letter-spacing: 2px;">PENGADAAN ASSET BARU</h1>
        </div>

        <div class="main-content-card" style="background: white; padding: 40px; border-radius: 30px; border: 1px solid #e0eadd; box-shadow: 0 10px 30px rgba(0,0,0,0.05); position: relative; z-index: 10;">
            <form id="assetBaruForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                
                <div class="form-group" style="grid-column: span 2; position: relative;">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">PRODUK KOMODITAS</label>
                    
                    <div id="customSelectTrigger" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800; background:#f9fbf9; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span id="selectedProductLabel">-- PILIH PRODUK --</span>
                        <span style="color: #6CA651; transform: scaleY(0.7); font-size: 1.2rem;">▼</span>
                    </div>

                    <div id="customSelectList" style="display: none; position: absolute; top: 105%; left: 0; width: 100%; max-height: 250px; background: white; border: 2px solid #6CA651; border-radius: 12px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                        <div style="padding: 10px; background: #f0f7f0; font-weight: 900; color: #1f3326; font-size: 0.75rem; border-bottom: 1px solid #e0eadd;">UNGGAS</div>
                        <div class="optionItem" data-value="DOC" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">DOC</div>
                        <div class="optionItem" data-value="DOD" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">DOD</div>
                        <div class="optionItem" data-value="PULLET (8 MINGGU)" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">PULLET (8 MINGGU)</div>
                        <div class="optionItem" data-value="AYAM PEJANTAN" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">AYAM PEJANTAN</div>
                        <div class="optionItem" data-value="AYAM BETINA" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">AYAM BETINA</div>
                        <div class="optionItem" data-value="BEBEK" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">BEBEK</div>
                        
                        <div style="padding: 10px; background: #f0f7f0; font-weight: 900; color: #1f3326; font-size: 0.75rem; border-bottom: 1px solid #e0eadd; border-top: 1px solid #e0eadd;">IKAN</div>
                        <div class="optionItem" data-value="IKAN LELE" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">IKAN LELE</div>
                        <div class="optionItem" data-value="IKAN NILA" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">IKAN NILA</div>
                        <div class="optionItem" data-value="IKAN GURAME" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">IKAN GURAME</div>
                        <div class="optionItem" data-value="IKAN BAWAL" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">IKAN BAWAL</div>
                        
                        <div style="padding: 10px; background: #f0f7f0; font-weight: 900; color: #1f3326; font-size: 0.75rem; border-bottom: 1px solid #e0eadd; border-top: 1px solid #e0eadd;">TERNAK BESAR</div>
                        <div class="optionItem" data-value="KAMBING" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">KAMBING</div>
                        <div class="optionItem" data-value="KAMBING MUDA" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">KAMBING MUDA</div>
                        <div class="optionItem" data-value="SAPI" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">SAPI</div>
                        
                        <div style="padding: 10px; background: #f0f7f0; font-weight: 900; color: #1f3326; font-size: 0.75rem; border-bottom: 1px solid #e0eadd; border-top: 1px solid #e0eadd;">PERTANIAN</div>
                        <div class="optionItem" data-value="BAYAM" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">BAYAM</div>
                        <div class="optionItem" data-value="KANGKUNG" style="padding: 12px 20px; cursor: pointer; font-weight: 700;">KANGKUNG</div>
                        
                        <div class="optionItem" data-value="LAINNYA" style="padding: 12px 20px; cursor: pointer; font-weight: 700; border-top: 1px solid #eee;">LAINNYA</div>
                    </div>
                    <input type="hidden" id="produkAsset" required>
                </div>

                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">JUMLAH</label>
                    <input type="number" id="jumlahAsset" required min="1" placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>

                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">HARGA UNIT BELI (RP)</label>
                    <input type="number" id="hargaAsset" required placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>

                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">UMUR SAAT INI (HARI)</label>
                    <input type="number" id="umurAsset" required placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>

                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">KETERANGAN</label>
                    <input type="text" id="keteranganAsset" placeholder="Supplier, Lokasi, dll" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>

                <button type="submit" style="grid-column: span 2; padding: 20px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 5px 0 #4a7337; text-transform: uppercase;">
                    Konfirmasi Aset Baru 🚀
                </button>
            </form>
        </div>

        <div class="dashboard-card" style="background: white; padding: 30px; border-radius: 28px; border: 1px solid #eef2ed; position: relative; z-index: 1;">
            <h3 style="font-weight: 900; color: #1f3326; margin-bottom: 20px; text-align: center; text-transform: uppercase;">📦 DATA RIWAYAT ASSET MASUK</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: center;">
                    <thead style="background: #41644A; color: white;">
                        <tr>
                            <th style="padding: 15px;">TANGGAL</th>
                            <th style="padding: 15px;">PRODUK</th>
                            <th style="padding: 15px;">UMUR</th>
                            <th style="padding: 15px;">JUMLAH</th>
                            <th style="padding: 15px;">TOTAL HARGA BELI</th>
                        </tr>
                    </thead>
                    <tbody id="historyAssetBody">
                        <tr><td colspan="5" style="padding: 30px; color: #ccc;">Memuat data asset...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
      </section>
      
      <style>
        .optionItem:hover { background: #f0f7f0; color: #6CA651; }
      </style>
    `;
  },

  async afterRender() {
    const presenter = new BibitBaruPresenter();
    const trigger = document.getElementById('customSelectTrigger');
    const list = document.getElementById('customSelectList');
    const selectedLabel = document.getElementById('selectedProductLabel');
    const hiddenInput = document.getElementById('produkAsset');
    const form = document.getElementById('assetBaruForm');
    const historyBody = document.getElementById('historyAssetBody');

    // LOGIKA DROPDOWN SAKTI (Selalu Kebawah & Pendek)
    trigger.onclick = (e) => {
        e.stopPropagation();
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    };

    document.querySelectorAll('.optionItem').forEach(item => {
        item.onclick = (e) => {
            const val = e.target.dataset.value;
            selectedLabel.innerText = val;
            hiddenInput.value = val;
            list.style.display = 'none';
            selectedLabel.style.color = '#1f3326';
        };
    });

    document.onclick = () => { list.style.display = 'none'; };

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
                <td style="padding: 15px; font-weight: 900; color: #6CA651;">${item.jumlah} Unit</td>
                <td style="padding: 15px; font-weight: 700;">Rp ${(item.jumlah * (item.harga || 0)).toLocaleString()}</td>
            </tr>
        `).join('');
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        if (!hiddenInput.value) return alert("Pilih produk komoditas dulu!");

        const res = await presenter.submitAsset({
            produk: hiddenInput.value,
            jumlah: parseInt(document.getElementById('jumlahAsset').value),
            harga: parseInt(document.getElementById('hargaAsset').value),
            umur: parseInt(document.getElementById('umurAsset').value),
            keterangan: document.getElementById('keteranganAsset').value
        });

        if (res.status === 'success') {
            alert("Aset Baru Berhasil Disimpan!");
            form.reset();
            selectedLabel.innerText = "-- PILIH PRODUK --";
            selectedLabel.style.color = '#757575';
            hiddenInput.value = "";
            await loadHistory();
        }
    };
    await loadHistory();
  }
};

export default BibitBaru;