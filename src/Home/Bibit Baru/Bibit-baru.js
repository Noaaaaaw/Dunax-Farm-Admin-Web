import BibitBaruPresenter from './Bibit-baru-presenter.js';
import { supabase } from '../../config.js'; 

const BibitBaru = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width:1400px; margin: 0 auto; min-height: 100vh; font-family: 'Inter', sans-serif; overflow-x: hidden; position: relative;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px; text-align: center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy'; color: #6CA651; font-size: 2.5rem; letter-spacing: 2px;">PENGADAAN ASSET & ALAT</h1>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; align-items: stretch;">
            <div class="main-content-card" style="background: white; padding: 30px; border-radius: 30px; border: 1px solid #e0eadd; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                <h2 id="assetFormTitle" style="font-weight: 900; color: #6CA651; margin-bottom: 20px; text-transform: uppercase; font-size: 1rem; text-align: center;">INPUT ASSET TERNAK BARU</h2>
                <form id="assetBaruForm" style="display: flex; flex-direction: column; gap: 15px; flex: 1;">
                    <input type="hidden" id="editAssetId">
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">PRODUK KOMODITAS</label>
                        <div id="customSelectTrigger" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800; background:#f9fbf9; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                            <span id="selectedProductLabel">-- PILIH PRODUK --</span>
                            <span style="color: #6CA651;">▼</span>
                        </div>
                        <div id="customSelectList" style="display: none; position: absolute; width: 100%; max-height: 200px; background: white; border: 2px solid #6CA651; border-radius: 12px; overflow-y: auto; z-index: 999; top: 100%;">
                            <div class="optionItem" data-value="DOC">DOC</div><div class="optionItem" data-value="DOD">DOD</div><div class="optionItem" data-value="PULLET AYAM">PULLET AYAM</div><div class="optionItem" data-value="AYAM PETELUR">AYAM PETELUR</div><div class="optionItem" data-value="KAMBING">KAMBING</div><div class="optionItem" data-value="SAPI">SAPI</div>
                        </div>
                        <input type="hidden" id="produkAsset" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group">
                            <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">JUMLAH EKOR</label>
                            <input type="number" id="jumlahAsset" required placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                        </div>
                        <div class="form-group">
                            <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">HARGA SATUAN (RP)</label>
                            <input type="number" id="hargaAssetSatuan" required placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">TANGGAL LAHIR</label>
                        <input type="date" id="tglAsset" required style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">KETERANGAN / DETAIL ASSET</label>
                        <input type="text" id="ketAsset" placeholder="..." style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    </div>
                    <div class="form-group" style="margin-top: auto;">
                        <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">UPLOAD BUKTI (FOTO)</label>
                        <input type="file" id="buktiBibit" accept="image/*" style="width: 100%; padding: 10px; border: 2px dashed #6CA651; border-radius: 12px;">
                    </div>
                    <button type="submit" id="btnSubmitAsset" style="width: 100%; padding: 18px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer;">SIMPAN ASSET</button>
                    <button type="button" id="btnCancelAsset" style="display: none; width: 100%; padding: 10px; background: #888; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer; margin-top: -10px;">BATAL EDIT</button>
                </form>
            </div>

            <div class="main-content-card" style="background: #fdfdfd; padding: 30px; border-radius: 30px; border: 1.5px dashed #41644A; display: flex; flex-direction: column;">
                <h2 id="alatFormTitle" style="font-weight: 900; color: #41644A; margin-bottom: 20px; text-transform: uppercase; font-size: 1rem; text-align: center;">INPUT ALAT & BARANG</h2>
                <form id="alatBaruForm" style="display: flex; flex-direction: column; gap: 15px; flex: 1;">
                    <input type="hidden" id="editAlatId">
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">NAMA BARANG</label>
                        <input type="text" id="namaAlat" required placeholder="..." style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group">
                            <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">UNIT</label>
                            <input type="number" id="jumlahAlat" required placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                        </div>
                        <div class="form-group">
                            <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">HARGA (RP)</label>
                            <input type="number" id="hargaAlat" required placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">TANGGAL PEMBELIAN</label>
                        <input type="date" id="tglAlat" required style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">KETERANGAN PEMBELIAN</label>
                        <input type="text" id="ketAlat" placeholder="..." style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                    </div>
                    <div class="form-group" style="margin-top: auto;">
                        <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 5px; font-size: 0.8rem;">UPLOAD BUKTI</label>
                        <input type="file" id="buktiAlat" accept="image/*" style="width: 100%; padding: 10px; border: 2px dashed #41644A; border-radius: 12px;">
                    </div>
                    <button type="submit" id="btnSubmitAlat" style="width: 100%; padding: 18px; background: #41644A; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer;">SIMPAN ALAT</button>
                    <button type="button" id="btnCancelAlat" style="display: none; width: 100%; padding: 10px; background: #888; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer; margin-top: -10px;">BATAL EDIT</button>
                </form>
            </div>
        </div>
        
        <div class="dashboard-card" style="background: white; padding: 35px; border-radius: 35px; box-shadow: 0 15px 45px rgba(0,0,0,0.04);">
            <h3 style="font-weight: 900; color: #1f3326; text-transform: uppercase; font-size: 1.4rem; text-align: center; margin-bottom: 25px;">RIWAYAT HASIL PENGADAAN</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: center; border: 3px solid white;">
                    <thead>
                        <tr style="background: #6CA651; color: white; text-transform: uppercase; font-size: 0.75rem; font-weight: 900;">
                            <th style="padding: 15px; border: 3px solid white; text-align: center;">Tgl Input</th>
                            <th style="padding: 15px; border: 3px solid white; text-align: center;">Tgl Beli</th>
                            <th style="padding: 15px; border: 3px solid white; text-align: center;">Nama Item</th>
                            <th style="padding: 15px; border: 3px solid white; text-align: center;">Umur</th>
                            <th style="padding: 15px; border: 3px solid white; text-align: center;">Jumlah</th>
                            <th style="padding: 15px; border: 3px solid white; text-align: center;">Total Rp</th>
                            <th style="padding: 15px; border: 3px solid white; text-align: center;">Keterangan</th>
                            <th style="padding: 15px; border: 3px solid white; text-align: center;">Bukti</th>
                            <th style="padding: 15px; border: 3px solid white; text-align: center;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="historyCombinedBody"></tbody>
                </table>
            </div>
        </div>

        <div id="imageModal" style="display: none; position: fixed; inset: 0; z-index: 99999; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); align-items: center; justify-content: center; padding: 20px;">
            <div style="background: white; width: 100%; max-width: 450px; border-radius: 30px; border: 3px solid #000; box-shadow: 0 15px 0 #000; overflow: hidden;">
                <div style="background: #6CA651; padding: 15px; display: flex; justify-content: center; border-bottom: 3px solid #000; position: relative;">
                    <h3 style="margin: 0; font-family: 'Luckiest Guy'; color: white;">FOTO BUKTI</h3>
                    <button onclick="closeAllModals()" style="position: absolute; right: 15px; top: 10px; background: white; border: 2px solid #000; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">✕</button>
                </div>
                <div style="padding: 20px; text-align: center;"><img id="modalImg" src="" style="width: 100%; max-height: 400px; object-fit: contain;"></div>
            </div>
        </div>
      </section>

      <style>
        .optionItem { padding: 12px 20px; cursor: pointer; font-weight: 700; }
        .optionItem:hover { background: #f0f7f0; color: #6CA651; }
        .history-row { background-color: #fcfcfc; border-bottom: 3px solid white; }
        .history-row:nth-child(even) { background-color: #f4f8f4; }
        .btn-table { border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 0.65rem; color: white; margin: 2px; }
      </style>
    `;
  },

  async afterRender() {
    const presenter = new BibitBaruPresenter();
    const modalImg = document.getElementById('modalImg');
    
    const formatUmurManusiawi = (tglBeli) => {
        if (!tglBeli) return "N/A";
        const tglAwal = new Date(tglBeli);
        const tglSekarang = new Date();
        let tahun = tglSekarang.getFullYear() - tglAwal.getFullYear();
        let bulan = tglSekarang.getMonth() - tglAwal.getMonth();
        let hari = tglSekarang.getDate() - tglAwal.getDate();
        if (hari < 0) { bulan--; const tglBulanLalu = new Date(tglSekarang.getFullYear(), tglSekarang.getMonth(), 0); hari += tglBulanLalu.getDate(); }
        if (bulan < 0) { tahun--; bulan += 12; }
        let hasil = [];
        if (tahun > 0) hasil.push(`${tahun} Tahun`);
        if (bulan > 0) hasil.push(`${bulan} Bulan`);
        if (hari >= 0) hasil.push(`${hari} Hari`);
        return hasil.join(" ");
    };

    window.closeAllModals = () => {
        document.getElementById('imageModal').style.display = "none";
        document.body.style.overflow = "auto";
        window.dispatchEvent(new Event('resize')); 
    };

    const uploadToSupabase = async (file) => {
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const { data, error } = await supabase.storage.from('bukti-pengadaan').upload(fileName, file);
        if (error) throw error;
        return supabase.storage.from('bukti-pengadaan').getPublicUrl(fileName).data.publicUrl;
    };

    const loadHistory = async () => {
        const history = await presenter.fetchAlatHistory();
        const container = document.getElementById('historyCombinedBody');
        history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        container.innerHTML = history.length === 0 ? `<tr><td colspan="9" style="padding:50px; color:#ccc; text-align:center;">Belum ada data</td></tr>` : 
        history.map((item) => `
            <tr class="history-row">
                <td style="padding: 15px; text-align: center; border: 3px solid white;">${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                <td style="padding: 15px; text-align: center; border: 3px solid white;">${new Date(item.tanggal_beli).toLocaleDateString('id-ID')}</td>
                <td style="padding: 15px; text-align: center; font-weight: 900; text-transform: uppercase; border: 3px solid white;">${item.nama_alat}</td>
                <td style="padding: 15px; text-align: center; color: #6CA651; font-weight: 800; font-size: 0.8rem; border: 3px solid white;">${formatUmurManusiawi(item.tanggal_beli)}</td>
                <td style="padding: 15px; text-align: center; border: 3px solid white;">${item.jumlah}</td>
                <td style="padding: 15px; text-align: center; font-weight: 900; color: #41644A; border: 3px solid white;">Rp ${(item.jumlah * item.harga).toLocaleString()}</td>
                <td style="padding: 15px; text-align: center; color: #333; font-weight: 800; font-size: 1.1rem; max-width: 250px; border: 3px solid white;">${item.keterangan || '-'}</td>
                <td style="padding: 15px; text-align: center; border: 3px solid white;">
                    ${item.bukti_pembayaran ? `<button class="btn-table" style="background:#41644A;" onclick="window.openBukti('${item.bukti_pembayaran}')">LIHAT</button>` : '-'}
                </td>
                <td style="padding: 15px; text-align: center; border: 3px solid white;">
                    <div style="display: flex; justify-content: center; gap: 5px;">
                        <button class="btn-table" style="background:#f0ad4e;" onclick='window.handleEditAction(${JSON.stringify(item)})'>EDIT</button>
                        <button class="btn-table" style="background:#d9534f;" onclick="window.handleHapusAsset(${item.id}, '${item.nama_alat}')">HAPUS</button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    // LOGIKA EDIT (NARIK SEMUA DATA)
    window.handleEditAction = (item) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Format tanggal yyyy-mm-dd agar bisa dibaca input type="date"
        const tglFormatted = new Date(item.tanggal_beli).toISOString().split('T')[0];

        if (item.kategori_id === 'asset_ternak') {
            document.getElementById('editAssetId').value = item.id;
            document.getElementById('produkAsset').value = item.nama_alat;
            document.getElementById('selectedProductLabel').innerText = item.nama_alat;
            document.getElementById('jumlahAsset').value = item.jumlah;
            document.getElementById('hargaAssetSatuan').value = item.harga;
            document.getElementById('tglAsset').value = tglFormatted; // FIXED
            document.getElementById('ketAsset').value = item.keterangan || '';
            document.getElementById('btnSubmitAsset').innerText = "UPDATE ASSET";
            document.getElementById('btnCancelAsset').style.display = "block";
            document.getElementById('assetFormTitle').innerText = "EDIT ASSET TERNAK";
        } else {
            document.getElementById('editAlatId').value = item.id;
            document.getElementById('namaAlat').value = item.nama_alat;
            document.getElementById('jumlahAlat').value = item.jumlah;
            document.getElementById('hargaAlat').value = item.harga;
            document.getElementById('tglAlat').value = tglFormatted; // FIXED
            document.getElementById('ketAlat').value = item.keterangan || '';
            document.getElementById('btnSubmitAlat').innerText = "UPDATE ALAT";
            document.getElementById('btnCancelAlat').style.display = "block";
            document.getElementById('alatFormTitle').innerText = "EDIT ALAT & BARANG";
        }
    };

    const resetForms = () => {
        document.getElementById('assetBaruForm').reset();
        document.getElementById('alatBaruForm').reset();
        document.getElementById('editAssetId').value = "";
        document.getElementById('editAlatId').value = "";
        document.getElementById('btnSubmitAsset').innerText = "SIMPAN ASSET";
        document.getElementById('btnSubmitAlat').innerText = "SIMPAN ALAT";
        document.getElementById('btnCancelAsset').style.display = "none";
        document.getElementById('btnCancelAlat').style.display = "none";
        document.getElementById('assetFormTitle').innerText = "INPUT ASSET TERNAK BARU";
        document.getElementById('alatFormTitle').innerText = "INPUT ALAT & BARANG";
        document.getElementById('selectedProductLabel').innerText = "-- PILIH PRODUK --";
    };

    document.getElementById('btnCancelAsset').onclick = resetForms;
    document.getElementById('btnCancelAlat').onclick = resetForms;

    window.openBukti = (src) => { modalImg.src = src; document.getElementById('imageModal').style.display = "flex"; document.body.style.overflow = "hidden"; };
    
    window.handleHapusAsset = async (id, nama) => {
        if(confirm(`Hapus data ${nama}?`)) {
            const res = await presenter.deleteAsset(id);
            if(res.status === 'success') { loadHistory(); }
        }
    };

    document.getElementById('assetBaruForm').onsubmit = async (e) => {
        e.preventDefault();
        const editId = document.getElementById('editAssetId').value;
        const btn = document.getElementById('btnSubmitAsset');
        btn.disabled = true; btn.innerText = "SAVING...";
        const file = document.getElementById('buktiBibit').files[0];
        const url = file ? await uploadToSupabase(file) : null;

        const data = {
            nama_alat: document.getElementById('produkAsset').value,
            jumlah: parseInt(document.getElementById('jumlahAsset').value),
            harga: parseInt(document.getElementById('hargaAssetSatuan').value), 
            tanggal_beli: document.getElementById('tglAsset').value,
            keterangan: document.getElementById('ketAsset').value,
            kategori_id: 'asset_ternak',
            bukti_pembayaran: url
        };

        if (editId) {
            data.id = editId;
            await presenter.updateUnifiedTable(data);
        } else {
            await presenter.submitToUnifiedTable(data);
        }
        resetForms(); loadHistory(); btn.disabled = false;
    };

    document.getElementById('alatBaruForm').onsubmit = async (e) => {
        e.preventDefault();
        const editId = document.getElementById('editAlatId').value;
        const btn = document.getElementById('btnSubmitAlat');
        btn.disabled = true; btn.innerText = "SAVING...";
        const file = document.getElementById('buktiAlat').files[0];
        const url = file ? await uploadToSupabase(file) : null;

        const data = {
            nama_alat: document.getElementById('namaAlat').value,
            jumlah: parseInt(document.getElementById('jumlahAlat').value),
            harga: parseInt(document.getElementById('hargaAlat').value), 
            tanggal_beli: document.getElementById('tglAlat').value,
            keterangan: document.getElementById('ketAlat').value,
            kategori_id: 'alat_barang',
            bukti_pembayaran: url
        };

        if (editId) {
            data.id = editId;
            await presenter.updateUnifiedTable(data);
        } else {
            await presenter.submitToUnifiedTable(data);
        }
        resetForms(); loadHistory(); btn.disabled = false;
    };

    document.getElementById('customSelectTrigger').onclick = (e) => {
        e.stopPropagation();
        const list = document.getElementById('customSelectList');
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    };
    document.querySelectorAll('.optionItem').forEach(item => {
        item.onclick = (e) => {
            document.getElementById('selectedProductLabel').innerText = e.target.innerText;
            document.getElementById('produkAsset').value = e.target.innerText;
            document.getElementById('customSelectList').style.display = 'none';
        }
    });

    await loadHistory();
  }
};

export default BibitBaru;