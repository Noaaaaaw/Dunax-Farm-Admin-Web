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
                            <div class="optionItem" data-value="DOC">DOC</div>
                            <div class="optionItem" data-value="DOD">DOD</div>
                            <div class="optionItem" data-value="KAMBING">KAMBING</div>
                            <div class="optionItem" data-value="SAPI">SAPI</div>
                        </div>
                        <input type="hidden" id="produkAsset" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <input type="number" id="jumlahAsset" required placeholder="Jumlah Ekor" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                        <input type="number" id="hargaAsset" required placeholder="Harga Total" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    </div>
                    <input type="date" id="tglAsset" required style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    <input type="text" id="ketAsset" placeholder="Keterangan..." style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    <input type="file" id="buktiBibit" accept="image/*" style="width: 100%; padding: 10px; border: 2px dashed #6CA651; border-radius: 12px; font-weight: 800;">
                    <button type="submit" style="margin-top: auto; padding: 18px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer;">SIMPAN ASSET</button>
                </form>
            </div>

            <div class="main-content-card" style="background: #fdfdfd; padding: 30px; border-radius: 30px; border: 1.5px dashed #6CA651; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                <h2 style="font-weight: 900; color: #41644A; margin-bottom: 20px; text-transform: uppercase; font-size: 1rem; text-align: center;">INPUT ALAT & BARANG BARU</h2>
                <form id="alatBaruForm" style="display: flex; flex-direction: column; gap: 15px; flex-grow: 1;">
                    <input type="text" id="namaAlat" required placeholder="Nama Barang (Contoh: Mesin Tetas)" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <input type="number" id="jumlahAlat" required placeholder="Jumlah Unit" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                        <input type="number" id="hargaAlat" required placeholder="Harga Satuan" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    </div>
                    <input type="date" id="tglAlat" required style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    <input type="text" id="ketAlat" placeholder="Keterangan Pembelian..." style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    <input type="file" id="buktiAlat" accept="image/*" style="width: 100%; padding: 10px; border: 2px dashed #41644A; border-radius: 12px; font-weight: 800;">
                    <button type="submit" style="margin-top: auto; padding: 18px; background: #41644A; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer;">SIMPAN ALAT</button>
                </form>
            </div>
        </div>
        
        <div class="dashboard-card" style="background: white; padding: 25px; border-radius: 28px; border: 1px solid #eef2ed; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <h3 style="font-weight: 900; color: #1f3326; margin-bottom: 15px; text-align: center; text-transform: uppercase; font-size: 0.85rem;">RIWAYAT PENGADAAN ASSET & ALAT</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">
                    <thead style="background: #6CA651; color: white;">
                        <tr>
                            <th style="padding: 12px 5px; text-align: center;">TANGGAL</th>
                            <th style="padding: 12px 5px; text-align: center;">NAMA ITEM</th>
                            <th style="padding: 12px 5px; text-align: center;">JUMLAH</th>
                            <th style="padding: 12px 5px; text-align: center;">TOTAL RP</th>
                            <th style="padding: 12px 5px; text-align: center;">BUKTI</th>
                        </tr>
                    </thead>
                    <tbody id="historyCombinedBody"></tbody>
                </table>
            </div>
        </div>

        <div id="imageModal" style="display: none; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); align-items: center; justify-content: center;">
            <div style="position: relative; max-width: 90%; max-height: 90%;">
                <span id="closeModal" style="position: absolute; top: -45px; right: 0; color: white; font-size: 40px; font-weight: bold; cursor: pointer;">&times;</span>
                <img id="modalImg" src="" style="width: 100%; border-radius: 10px; border: 4px solid white;">
            </div>
        </div>
      </section>
      <style>
        .optionItem { padding: 12px 20px; cursor: pointer; font-weight: 700; }
        .optionItem:hover { background: #f0f7f0; color: #6CA651; }
      </style>
    `;
  },

  async afterRender() {
    const presenter = new BibitBaruPresenter();
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');

    window.openBukti = (src) => {
        modalImg.src = src;
        modal.style.display = "flex";
    };
    document.getElementById('closeModal').onclick = () => modal.style.display = "none";

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const loadHistory = async () => {
        const history = await presenter.fetchAlatHistory();
        const container = document.getElementById('historyCombinedBody');
        container.innerHTML = history.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:20px;">Kosong</td></tr>' : 
        history.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 5px; text-align: center;">${new Date(item.tanggal_beli || item.created_at).toLocaleDateString('id-ID')}</td>
                <td style="padding: 12px 5px; font-weight: 800; text-align: center;">${item.nama_alat}</td>
                <td style="padding: 12px 5px; text-align: center;">${item.jumlah} Unit/Ekor</td>
                <td style="padding: 12px 5px; font-weight: 700; text-align: center;">Rp ${(item.jumlah * item.harga).toLocaleString()}</td>
                <td style="padding: 12px 5px; text-align: center;">
                    ${item.bukti_pembayaran ? `<button onclick="openBukti('${item.bukti_pembayaran}')" style="background:#6CA651; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">LIHAT</button>` : '-'}
                </td>
            </tr>
        `).join('');
    };

    // Card Ternak Submit
    document.getElementById('assetBaruForm').onsubmit = async (e) => {
        e.preventDefault();
        const file = document.getElementById('buktiBibit').files[0];
        const res = await presenter.submitToUnifiedTable({
            nama_alat: document.getElementById('produkAsset').value,
            jumlah: parseInt(document.getElementById('jumlahAsset').value),
            harga: parseInt(document.getElementById('hargaAsset').value) / (parseInt(document.getElementById('jumlahAsset').value) || 1),
            tanggal_beli: document.getElementById('tglAsset').value,
            keterangan: document.getElementById('ketAsset').value,
            bukti_pembayaran: file ? await toBase64(file) : null
        });
        if (res.status === 'success') { alert("Asset Ternak Berhasil!"); loadHistory(); }
    };

    // Card Alat Submit
    document.getElementById('alatBaruForm').onsubmit = async (e) => {
        e.preventDefault();
        const file = document.getElementById('buktiAlat').files[0];
        const res = await presenter.submitToUnifiedTable({
            nama_alat: document.getElementById('namaAlat').value,
            jumlah: parseInt(document.getElementById('jumlahAlat').value),
            harga: parseInt(document.getElementById('hargaAlat').value),
            tanggal_beli: document.getElementById('tglAlat').value,
            keterangan: document.getElementById('ketAlat').value,
            bukti_pembayaran: file ? await toBase64(file) : null
        });
        if (res.status === 'success') { alert("Alat Baru Berhasil!"); loadHistory(); }
    };

    // Custom Select Trigger
    const trigger = document.getElementById('customSelectTrigger');
    const list = document.getElementById('customSelectList');
    trigger.onclick = () => list.style.display = list.style.display === 'none' ? 'block' : 'none';
    document.querySelectorAll('.optionItem').forEach(item => {
        item.onclick = (e) => {
            document.getElementById('selectedProductLabel').innerText = e.target.innerText;
            document.getElementById('produkAsset').value = e.target.innerText;
            list.style.display = 'none';
        }
    });

    await loadHistory();
  }
};

export default BibitBaru;