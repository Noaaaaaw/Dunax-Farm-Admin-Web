import BibitBaruPresenter from './Bibit-baru-presenter.js';

const BibitBaru = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width:1400px; margin: 0 auto; min-height: 100vh;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px; text-align: center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy'; color: #6CA651; font-size: 2.5rem; letter-spacing: 2px;">PENGADAAN ASSET BARU</h1>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; align-items: stretch;">
            <div class="main-content-card" style="background: white; padding: 30px; border-radius: 30px; border: 1px solid #e0eadd; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                <h2 style="font-weight: 900; color: #6CA651; margin-bottom: 20px; text-transform: uppercase; font-size: 1rem; text-align: center;">INPUT ASSET TERNAK BARU</h2>
                <form id="assetBaruForm" style="display: flex; flex-direction: column; gap: 15px; flex-grow: 1;">
                    <div class="form-group" style="position: relative;">
                        <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">PRODUK KOMODITAS</label>
                        <div id="customSelectTrigger" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800; background:#f9fbf9; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                            <span id="selectedProductLabel">-- PILIH PRODUK --</span>
                            <span style="color: #6CA651;">▼</span>
                        </div>
                        <div id="customSelectList" style="display: none; position: absolute; top: 105%; left: 0; width: 100%; max-height: 200px; background: white; border: 2px solid #6CA651; border-radius: 12px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                            <div style="padding: 10px; background: #f0f7f0; font-weight: 900; color: #1f3326; font-size: 0.75rem;">UNGGAS</div>
                            <div class="optionItem" data-value="DOC">DOC</div>
                            <div class="optionItem" data-value="DOD">DOD</div>
                            <div class="optionItem" data-value="PULLET">PULLET</div>
                            <div style="padding: 10px; background: #f0f7f0; font-weight: 900; color: #1f3326; font-size: 0.75rem;">LAINNYA</div>
                            <div class="optionItem" data-value="KAMBING">KAMBING</div>
                            <div class="optionItem" data-value="SAPI">SAPI</div>
                        </div>
                        <input type="hidden" id="produkAsset" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group">
                            <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">JUMLAH EKOR</label>
                            <input type="number" id="jumlahAsset" required min="1" placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                        </div>
                        <div class="form-group">
                            <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">HARGA (RUPIAH)</label>
                            <input type="number" id="hargaAsset" required placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">TANGGAL LAHIR TERNAK</label>
                        <input type="date" id="tglLahirAsset" required style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800; background: #f9fbf9;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">UPLOAD BUKTI (OPSIONAL)</label>
                        <input type="file" id="buktiBibit" accept="image/*" style="width: 100%; padding: 10px; border: 2px dashed #6CA651; border-radius: 12px; background: #f9fbf9;">
                    </div>
                    <button type="submit" style="margin-top: auto; padding: 18px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer; box-shadow: 0 5px 0 #4a7337; text-transform: uppercase;">SIMPAN</button>
                </form>
            </div>

            <div class="main-content-card" style="background: #fdfdfd; padding: 30px; border-radius: 30px; border: 1.5px dashed #6CA651; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                <h2 style="font-weight: 900; color: #41644A; margin-bottom: 20px; text-transform: uppercase; font-size: 1rem; text-align: center;">INPUT ALAT & BARANG BARU</h2>
                <form id="alatBaruForm" style="display: flex; flex-direction: column; gap: 15px; flex-grow: 1;">
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">NAMA BARANG</label>
                        <input type="text" id="namaAlat" required placeholder="Contoh: Mesin Tetas" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group">
                            <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">JUMLAH UNIT</label>
                            <input type="number" id="jumlahAlat" required min="1" placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                        </div>
                        <div class="form-group">
                            <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">HARGA SATUAN</label>
                            <input type="number" id="hargaAlat" required placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">NAMA PEMBELI</label>
                        <input type="text" id="pembeliAlat" required placeholder="Siapa yang beli?" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">UPLOAD BUKTI PEMBAYARAN</label>
                        <input type="file" id="buktiAlat" accept="image/*" required style="width: 100%; padding: 10px; border: 2px dashed #41644A; border-radius: 12px; background: #f9fbf9;">
                    </div>
                    <button type="submit" style="margin-top: auto; padding: 18px; background: #41644A; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer; box-shadow: 0 5px 0 #2d4a36; text-transform: uppercase;">SIMPAN ALAT</button>
                </form>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; align-items: stretch;">
            <div class="dashboard-card" style="background: white; padding: 25px; border-radius: 28px; border: 1px solid #eef2ed; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; flex-direction: column;">
                <h3 style="font-weight: 900; color: #1f3326; margin-bottom: 15px; text-align: center; text-transform: uppercase; font-size: 0.85rem;">RIWAYAT BIBIT TERNAK</h3>
                <div style="overflow-x: auto; flex-grow: 1;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">
                        <thead style="background: #6CA651; color: white;">
                            <tr>
                                <th style="padding: 12px 5px; text-align: center;">TANGGAL</th>
                                <th style="padding: 12px 5px; text-align: center;">PRODUK</th>
                                <th style="padding: 12px 5px; text-align: center;">UMUR</th>
                                <th style="padding: 12px 5px; text-align: center;">TOTAL RP</th>
                            </tr>
                        </thead>
                        <tbody id="historyAssetBody"></tbody>
                    </table>
                </div>
            </div>

            <div class="dashboard-card" style="background: white; padding: 25px; border-radius: 28px; border: 1px solid #eef2ed; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; flex-direction: column;">
                <h3 style="font-weight: 900; color: #1f3326; margin-bottom: 15px; text-align: center; text-transform: uppercase; font-size: 0.85rem;">RIWAYAT BELANJA ALAT</h3>
                <div style="overflow-x: auto; flex-grow: 1;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">
                        <thead style="background: #41644A; color: white;">
                            <tr>
                                <th style="padding: 12px 5px; text-align: center;">TANGGAL</th>
                                <th style="padding: 12px 5px; text-align: center;">NAMA ALAT</th>
                                <th style="padding: 12px 5px; text-align: center;">PEMBELI</th>
                                <th style="padding: 12px 5px; text-align: center;">TOTAL RP</th>
                            </tr>
                        </thead>
                        <tbody id="historyAlatBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
      </section>
      <style>
        .optionItem { padding: 12px 20px; cursor: pointer; font-weight: 700; transition: 0.2s; text-align: left; }
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
    
    const formBibit = document.getElementById('assetBaruForm');
    const formAlat = document.getElementById('alatBaruForm');
    
    const historyBody = document.getElementById('historyAssetBody');
    const historyAlatBody = document.getElementById('historyAlatBody');

    // Logic Dropdown
    trigger.onclick = (e) => {
        e.stopPropagation();
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    };
    document.querySelectorAll('.optionItem').forEach(item => {
        item.onclick = (e) => {
            selectedLabel.innerText = e.target.innerText;
            hiddenInput.value = e.target.innerText;
            list.style.display = 'none';
        };
    });
    document.onclick = () => { if (list) list.style.display = 'none'; };

    const loadHistory = async () => {
        const [history, alatHistory] = await Promise.all([
            presenter.fetchHistory(),
            presenter.fetchAlatHistory()
        ]);

        historyBody.innerHTML = history.length === 0 ? `<tr><td colspan="4" style="padding: 20px; color: #999; text-align: center;">Kosong</td></tr>` : 
        history.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 5px; text-align: center;">${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                <td style="padding: 12px 5px; font-weight: 800; text-align: center;">${item.produk} ${item.bukti_pembayaran ? '🖼️' : ''}</td>
                <td style="padding: 12px 5px; text-align: center; color: #d68910; font-weight: 800;">${item.umur}</td>
                <td style="padding: 12px 5px; font-weight: 700; text-align: center;">Rp ${(item.jumlah * (item.harga || 0)).toLocaleString()}</td>
            </tr>
        `).join('');

        historyAlatBody.innerHTML = alatHistory.length === 0 ? `<tr><td colspan="4" style="padding: 20px; color: #999; text-align: center;">Kosong</td></tr>` : 
        alatHistory.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 5px; text-align: center;">${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                <td style="padding: 12px 5px; font-weight: 800; text-align: center;">${item.nama_alat} ${item.bukti_pembayaran ? '🖼️' : ''}</td>
                <td style="padding: 12px 5px; text-align: center;">${item.pembeli}</td>
                <td style="padding: 12px 5px; font-weight: 700; text-align: center; color: #41644A;">Rp ${(item.jumlah * (item.harga || 0)).toLocaleString()}</td>
            </tr>
        `).join('');
    };

    formBibit.onsubmit = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('buktiBibit');
        const res = await presenter.submitAsset({
            produk: hiddenInput.value,
            jumlah: parseInt(document.getElementById('jumlahAsset').value),
            harga: parseInt(document.getElementById('hargaAsset').value),
            umur: document.getElementById('tglLahirAsset').value,
            bukti_pembayaran: fileInput.files[0] ? fileInput.files[0].name : '' // Sementara ambil nama file
        });
        if (res.status === 'success') {
            alert("Bibit Berhasil Disimpan!");
            formBibit.reset();
            selectedLabel.innerText = "-- PILIH PRODUK --";
            await loadHistory();
        }
    };

    formAlat.onsubmit = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('buktiAlat');
        const res = await presenter.submitAlat({
            nama_alat: document.getElementById('namaAlat').value,
            jumlah: parseInt(document.getElementById('jumlahAlat').value),
            harga: parseInt(document.getElementById('hargaAlat').value),
            pembeli: document.getElementById('pembeliAlat').value,
            bukti_pembayaran: fileInput.files[0] ? fileInput.files[0].name : ''
        });
        if (res.status === 'success') {
            alert("Data Alat & Bukti Tersimpan!");
            formAlat.reset();
            await loadHistory();
        }
    };

    await loadHistory();
  }
};

export default BibitBaru;