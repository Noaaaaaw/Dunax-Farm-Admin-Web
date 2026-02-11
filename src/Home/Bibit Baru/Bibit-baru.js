import BibitBaruPresenter from './Bibit-baru-presenter.js';

const BibitBaru = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width:1400px; margin: 0 auto; min-height: 100vh; font-family: 'Inter', sans-serif;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px; text-align: center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy'; color: #6CA651; font-size: 2.5rem; letter-spacing: 2px;">PENGADAAN ASSET & ALAT</h1>
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
                        <div id="customSelectList" style="display: none; position: absolute; width: 100%; max-height: 200px; background: white; border: 2px solid #6CA651; border-radius: 12px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.1); top: 100%;">
                            <div class="optionItem" data-value="DOC">DOC</div><div class="optionItem" data-value="DOD">DOD</div><div class="optionItem" data-value="PULLET AYAM">PULLET AYAM</div><div class="optionItem" data-value="AYAM PEJANTAN">AYAM PEJANTAN</div><div class="optionItem" data-value="AYAM PETELUR">AYAM PETELUR</div><div class="optionItem" data-value="IKAN GURAME">IKAN GURAME</div><div class="optionItem" data-value="IKAN LELE">IKAN LELE</div><div class="optionItem" data-value="IKAN NILA">IKAN NILA</div><div class="optionItem" data-value="KAMBING MUDA">KAMBING MUDA</div><div class="optionItem" data-value="KAMBING">KAMBING</div><div class="optionItem" data-value="SAPI MUDA">SAPI MUDA</div><div class="optionItem" data-value="SAPI">SAPI</div>
                        </div>
                        <input type="hidden" id="produkAsset" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group"><label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">JUMLAH EKOR</label><input type="number" id="jumlahAsset" required placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;"></div>
                        <div class="form-group"><label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">HARGA SATUAN (RP)</label><input type="number" id="hargaAssetSatuan" required placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;"></div>
                    </div>
                    <div class="form-group"><label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">TANGGAL BELI / LAHIR</label><input type="date" id="tglAsset" required style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;"></div>
                    <div class="form-group"><label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">KETERANGAN</label><input type="text" id="ketAsset" placeholder="Detail keterangan" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;"></div>
                    <div class="form-group"><label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">UPLOAD BUKTI (FOTO)</label><input type="file" id="buktiBibit" accept="image/*" style="width: 100%; padding: 10px; border: 2px dashed #6CA651; border-radius: 12px; font-weight: 800;"></div>
                    <button type="submit" class="btn-submit" style="margin-top: auto; padding: 18px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer; text-transform: uppercase;">SIMPAN ASSET</button>
                </form>
            </div>

            <div class="main-content-card" style="background: #fdfdfd; padding: 30px; border-radius: 30px; border: 1.5px dashed #41644A; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                <h2 style="font-weight: 900; color: #41644A; margin-bottom: 20px; text-transform: uppercase; font-size: 1rem; text-align: center;">INPUT ALAT & BARANG BARU</h2>
                <form id="alatBaruForm" style="display: flex; flex-direction: column; gap: 15px; flex-grow: 1;">
                    <div class="form-group"><label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">NAMA BARANG</label><input type="text" id="namaAlat" required placeholder="Masukan nama alat" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;"></div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group"><label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">JUMLAH UNIT</label><input type="number" id="jumlahAlat" required placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;"></div>
                        <div class="form-group"><label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">HARGA SATUAN (RP)</label><input type="number" id="hargaAlat" required placeholder="0" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;"></div>
                    </div>
                    <div class="form-group"><label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">TANGGAL PEMBELIAN</label><input type="date" id="tglAlat" required style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;"></div>
                    <div class="form-group"><label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">KETERANGAN</label><input type="text" id="ketAlat" placeholder="Detail pembelian..." style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;"></div>
                    <div class="form-group"><label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">UPLOAD BUKTI (FOTO)</label><input type="file" id="buktiAlat" accept="image/*" style="width: 100%; padding: 10px; border: 2px dashed #41644A; border-radius: 12px; font-weight: 800;"></div>
                    <button type="submit" class="btn-submit" style="margin-top: auto; padding: 18px; background: #41644A; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer; text-transform: uppercase;">SIMPAN ALAT</button>
                </form>
            </div>
        </div>
        
        <div class="dashboard-card" style="background: white; padding: 35px; border-radius: 35px; border: 1px solid #eef2ed; box-shadow: 0 15px 45px rgba(0,0,0,0.04); display: flex; flex-direction: column; align-items: center; gap: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div style="flex: 1;"></div>
                <div style="flex: 2; text-align: center;">
                    <h3 style="font-weight: 900; color: #1f3326; text-transform: uppercase; font-size: 1.4rem; margin: 0; letter-spacing: 1px;">RIWAYAT PENGADAAN</h3>
                    <p style="margin: 0; color: #888; font-size: 0.9rem; font-weight: 600;">Pantau aliran asset berdasarkan Tanggal Input</p>
                </div>
                <div style="flex: 1; text-align: right;"><button id="btnDownloadCSV" style="background: #41644A; color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 0.75rem;">DOWNLOAD CSV</button></div>
            </div>

            <div style="display: flex; align-items: center; gap: 20px; background: #f4f6f4; padding: 10px 25px; border-radius: 20px; border: 1px solid #e0eadd; margin-top: 10px;">
                <button id="prevDay" style="background: #6CA651; color: white; border: none; padding: 8px 20px; border-radius: 10px; font-weight: 900; cursor: pointer;">« PREV</button>
                <div style="text-align: center; min-width: 250px;"><span id="displayTanggal" style="font-weight: 900; color: #1f3326; text-transform: uppercase; font-size: 1rem;">MEMUAT...</span></div>
                <button id="nextDay" style="background: #6CA651; color: white; border: none; padding: 8px 20px; border-radius: 10px; font-weight: 900; cursor: pointer;">NEXT »</button>
            </div>

            <div class="filter-wrapper" style="position: relative; background: #f4f6f4; padding: 6px; border-radius: 20px; display: flex; width: fit-content; border: 1px solid #e0eadd;">
                <div id="filterSlider" style="position: absolute; top: 6px; left: 6px; height: calc(100% - 12px); width: 100px; background: #41644A; border-radius: 15px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 1;"></div>
                <button id="btnFilterAll" class="filter-btn active" style="padding: 12px 25px; border: none; background: transparent; cursor: pointer; font-weight: 800; font-size: 0.75rem; position: relative; z-index: 2; width: 100px; color: white;">SEMUA</button>
                <button id="btnFilterAsset" class="filter-btn" style="padding: 12px 25px; border: none; background: transparent; cursor: pointer; font-weight: 800; font-size: 0.75rem; position: relative; z-index: 2; width: 130px; color: #666;">ASSET TERNAK</button>
                <button id="btnFilterAlat" class="filter-btn" style="padding: 12px 25px; border: none; background: transparent; cursor: pointer; font-weight: 800; font-size: 0.75rem; position: relative; z-index: 2; width: 130px; color: #666;">ALAT & BARANG</button>
            </div>

            <div style="overflow-x: auto; width: 100%;">
                <table style="width: 100%; border-collapse: separate; border-spacing: 0 10px; font-size: 0.85rem;">
                    <thead>
                        <tr style="color: #41644A; font-weight: 900; text-transform: uppercase; font-size: 0.75rem;">
                            <th style="padding: 15px; text-align: center;">Waktu Input</th>
                            <th style="padding: 15px; text-align: center;">Tgl Beli</th>
                            <th style="padding: 15px; text-align: center;">Nama Item</th>
                            <th style="padding: 15px; text-align: center;">Umur</th>
                            <th style="padding: 15px; text-align: center;">Jumlah</th>
                            <th style="padding: 15px; text-align: center;">Total Rp</th>
                            <th style="padding: 15px; text-align: center;">Keterangan</th>
                            <th style="padding: 15px; text-align: center;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="historyCombinedBody"></tbody>
                </table>
            </div>
        </div>

        <div id="editModal" style="display: none; position: fixed; z-index: 10001; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; backdrop-filter: blur(4px);">
            <div style="background: white; width: 90%; max-width: 500px; padding: 30px; border-radius: 25px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
                <h3 style="font-weight: 900; color: #41644A; margin-top: 0; text-align: center;">PERBAIKI DATA ASSET</h3>
                <form id="editAssetForm" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="hidden" id="editId">
                    <div class="form-group"><label style="font-weight: 800; font-size: 0.7rem;">NAMA ITEM</label><input type="text" id="editNama" required style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ddd;"></div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group"><label style="font-weight: 800; font-size: 0.7rem;">JUMLAH</label><input type="number" id="editJumlah" required style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ddd;"></div>
                        <div class="form-group"><label style="font-weight: 800; font-size: 0.7rem;">HARGA SATUAN</label><input type="number" id="editHarga" required style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ddd;"></div>
                    </div>
                    <div class="form-group"><label style="font-weight: 800; font-size: 0.7rem;">TGL BELI</label><input type="date" id="editTgl" required style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ddd;"></div>
                    <div class="form-group"><label style="font-weight: 800; font-size: 0.7rem;">KETERANGAN</label><input type="text" id="editKet" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ddd;"></div>
                    <div class="form-group"><label style="font-weight: 800; font-size: 0.7rem;">GANTI BUKTI (OPSIONAL)</label><input type="file" id="editBukti" accept="image/*" style="width: 100%;"></div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                        <button type="button" id="closeEditModal" style="padding: 12px; border-radius: 12px; border: none; background: #eee; font-weight: 800; cursor: pointer;">BATAL</button>
                        <button type="submit" style="padding: 12px; border-radius: 12px; border: none; background: #41644A; color: white; font-weight: 800; cursor: pointer;">SIMPAN PERUBAHAN</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="imageModal" style="display: none; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); align-items: center; justify-content: center; backdrop-filter: blur(5px);">
            <div style="position: relative; max-width: 90%; max-height: 90%;"><span id="closeModal" style="position: absolute; top: -50px; right: 0; color: white; font-size: 40px; font-weight: bold; cursor: pointer;">&times;</span><img id="modalImg" src="" style="width: 100%; border-radius: 20px; border: 5px solid white; box-shadow: 0 0 50px rgba(0,0,0,0.5);"></div>
        </div>
      </section>

      <style>
        .optionItem { padding: 12px 20px; cursor: pointer; font-weight: 700; transition: 0.2s; text-align: left;}
        .optionItem:hover { background: #f0f7f0; color: #6CA651; }
        .btn-submit:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(108, 166, 81, 0.2); filter: brightness(1.1); }
        .history-row { background: white; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        .filter-btn { transition: color 0.3s ease; }
        .btn-aksi { border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 0.65rem; transition: 0.2s; color: white; }
        .btn-edit { background: #6CA651; margin-right: 5px; }
        .btn-hapus { background: #d9534f; }
        .btn-lihat { background: #41644A; margin-right: 5px; }
      </style>
    `;
  },

  async afterRender() {
    const presenter = new BibitBaruPresenter();
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const editModal = document.getElementById('editModal');
    const slider = document.getElementById('filterSlider');
    const btns = document.querySelectorAll('.filter-btn');
    const displayTanggal = document.getElementById('displayTanggal');
    
    let currentDate = new Date();
    let currentFilter = 'all';

    // KOMPRESI GAMBAR
    const processImage = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
        };
    });

    const updateDisplayDate = () => {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      displayTanggal.innerText = currentDate.toLocaleDateString('id-ID', options);
    };

    const updateSlider = (btn) => {
        btns.forEach(b => { b.classList.remove('active'); b.style.color = '#666'; });
        btn.classList.add('active');
        btn.style.color = 'white';
        slider.style.width = `${btn.offsetWidth}px`;
        slider.style.left = `${btn.offsetLeft}px`;
    };

    // FUNGSI AKSI (GLOBAL)
    window.openBukti = (src) => { modalImg.src = src; modal.style.display = "flex"; };
    window.handleEdit = (id, nama, jml, hrg, tgl, ket) => {
        document.getElementById('editId').value = id;
        document.getElementById('editNama').value = nama;
        document.getElementById('editJumlah').value = jml;
        document.getElementById('editHarga').value = hrg;
        document.getElementById('editTgl').value = tgl.split('T')[0];
        document.getElementById('editKet').value = ket === 'null' ? '' : ket;
        editModal.style.display = "flex";
    };
    window.handleHapus = async (id) => {
        if(confirm("Hapus data ini?")) {
            const res = await presenter.deleteAsset(id);
            if(res.status === 'success') loadHistory();
        }
    };

    document.getElementById('closeModal').onclick = () => modal.style.display = "none";
    document.getElementById('closeEditModal').onclick = () => editModal.style.display = "none";

    const toBase64 = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
    });

    const formatUmurLengkap = (tglInput) => {
        if (!tglInput) return "0 Hr";
        const tglAwal = new Date(tglInput);
        const tglSekarang = new Date();
        let tahun = tglSekarang.getFullYear() - tglAwal.getFullYear();
        let bulan = tglSekarang.getMonth() - tglAwal.getMonth();
        let hari = tglSekarang.getDate() - tglAwal.getDate();
        if (hari < 0) { bulan--; const tglLastMonth = new Date(tglSekarang.getFullYear(), tglSekarang.getMonth(), 0); hari += tglLastMonth.getDate(); }
        if (bulan < 0) { tahun--; bulan += 12; }
        let hasil = [];
        if (tahun > 0) hasil.push(`${tahun} Thn`);
        if (bulan > 0) hasil.push(`${bulan} Bln`);
        if (hari > 0 || hasil.length === 0) hasil.push(`${hari} Hr`);
        return hasil.join(" ");
    };

    const loadHistory = async () => {
        const history = await presenter.fetchAlatHistory();
        const container = document.getElementById('historyCombinedBody');
        const selectedDateStr = currentDate.toLocaleDateString('en-CA'); 

        const filteredData = history.filter(item => {
            const inputDateStr = new Date(item.created_at).toLocaleDateString('en-CA');
            const matchDate = inputDateStr === selectedDateStr;
            const matchCat = currentFilter === 'all' ? true : item.kategori_id === currentFilter;
            return matchDate && matchCat;
        });

        container.innerHTML = filteredData.length === 0 ? `<tr><td colspan="8" style="text-align:center; padding:50px; color:#ccc; font-weight:700;">Tidak ada pengadaan yang diinput pada tanggal ini</td></tr>` : 
        filteredData.map((item) => `
            <tr class="history-row">
                <td style="padding: 20px 15px; text-align: center; color: #1f3326; font-weight: 800; font-size: 0.8rem;">
                    ${new Date(item.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                </td>
                <td style="padding: 20px 15px; text-align: center; color: #888; font-weight: 600;">${new Date(item.tanggal_beli).toLocaleDateString('id-ID')}</td>
                <td style="padding: 20px 15px; text-align: center; font-weight: 800; color: #1f3326; text-transform: uppercase;">${item.nama_alat}</td>
                <td style="padding: 20px 15px; text-align: center; color: #6CA651; font-weight: 700;">${formatUmurLengkap(item.tanggal_beli)}</td>
                <td style="padding: 20px 15px; text-align: center; font-weight: 700;">${item.jumlah} ${item.kategori_id === 'asset_ternak' ? 'Ekor' : 'Unit'}</td>
                <td style="padding: 20px 15px; text-align: center; font-weight: 900; color: #41644A;">Rp ${(item.jumlah * item.harga).toLocaleString()}</td>
                <td style="padding: 20px 15px; text-align: center; color: #777; font-style: italic;">${item.keterangan || '-'}</td>
                <td style="padding: 20px 15px; text-align: center;">
                    ${item.bukti_pembayaran ? `<button class="btn-aksi btn-lihat" onclick="openBukti('${item.bukti_pembayaran}')">BUKTI</button>` : ''}
                    <button class="btn-aksi btn-edit" onclick="handleEdit(${item.id}, '${item.nama_alat}', ${item.jumlah}, ${item.harga}, '${item.tanggal_beli}', '${item.keterangan}')">EDIT</button>
                    <button class="btn-aksi btn-hapus" onclick="handleHapus(${item.id})">HAPUS</button>
                </td>
            </tr>
        `).join('');
    };

    // SUBMIT EDIT FORM
    document.getElementById('editAssetForm').onsubmit = async (e) => {
        e.preventDefault();
        const file = document.getElementById('editBukti').files[0];
        const compressedImage = file ? await processImage(file) : null;

        const res = await presenter.updateUnifiedTable({
            id: document.getElementById('editId').value,
            nama_alat: document.getElementById('editNama').value,
            jumlah: document.getElementById('editJumlah').value,
            harga: document.getElementById('editHarga').value,
            tanggal_beli: document.getElementById('editTgl').value,
            keterangan: document.getElementById('editKet').value,
            bukti_pembayaran: compressedImage
        });

        if(res.status === 'success') {
            alert("Data diperbarui!");
            editModal.style.display = "none";
            loadHistory();
        }
    };

    // Handler lain-lain (SAMA)
    document.getElementById('prevDay').onclick = () => { currentDate.setDate(currentDate.getDate() - 1); updateDisplayDate(); loadHistory(); };
    document.getElementById('nextDay').onclick = () => { currentDate.setDate(currentDate.getDate() + 1); updateDisplayDate(); loadHistory(); };
    btns.forEach(btn => btn.onclick = () => { updateSlider(btn); currentFilter = btn.id === 'btnFilterAll' ? 'all' : (btn.id === 'btnFilterAsset' ? 'asset_ternak' : 'alat_barang'); loadHistory(); });

    document.getElementById('assetBaruForm').onsubmit = async (e) => {
        e.preventDefault();
        const file = document.getElementById('buktiBibit').files[0];
        const compressedImage = file ? await processImage(file) : null;
        const res = await presenter.submitToUnifiedTable({
            nama_alat: document.getElementById('produkAsset').value,
            jumlah: parseInt(document.getElementById('jumlahAsset').value),
            harga: parseInt(document.getElementById('hargaAssetSatuan').value), 
            tanggal_beli: document.getElementById('tglAsset').value,
            kategori_id: 'asset_ternak',
            keterangan: document.getElementById('ketAsset').value,
            bukti_pembayaran: compressedImage
        });
        if (res.status === 'success') { alert("Simpan Berhasil!"); e.target.reset(); loadHistory(); }
    };

    document.getElementById('alatBaruForm').onsubmit = async (e) => {
        e.preventDefault();
        const file = document.getElementById('buktiAlat').files[0];
        const compressedImage = file ? await processImage(file) : null;
        const res = await presenter.submitToUnifiedTable({
            nama_alat: document.getElementById('namaAlat').value,
            jumlah: parseInt(document.getElementById('jumlahAlat').value),
            harga: parseInt(document.getElementById('hargaAlat').value),
            tanggal_beli: document.getElementById('tglAlat').value,
            kategori_id: 'alat_barang',
            keterangan: document.getElementById('ketAlat').value,
            bukti_pembayaran: compressedImage
        });
        if (res.status === 'success') { alert("Simpan Berhasil!"); e.target.reset(); loadHistory(); }
    };

    const trigger = document.getElementById('customSelectTrigger');
    const list = document.getElementById('customSelectList');
    trigger.onclick = (e) => { e.stopPropagation(); list.style.display = list.style.display === 'none' ? 'block' : 'none'; };
    document.querySelectorAll('.optionItem').forEach(item => {
        item.onclick = (e) => {
            document.getElementById('selectedProductLabel').innerText = e.target.innerText;
            document.getElementById('produkAsset').value = e.target.innerText;
            list.style.display = 'none';
        }
    });

    updateDisplayDate();
    updateSlider(document.getElementById('btnFilterAll'));
    await loadHistory();
  }
};

export default BibitBaru;