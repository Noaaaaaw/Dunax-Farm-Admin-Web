import BibitBaruPresenter from './Bibit-baru-presenter.js';

const BibitBaru = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width:1200px; margin: 0 auto; min-height: 100vh;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px; text-align: center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy'; color: #6CA651; font-size: 2.5rem; letter-spacing: 2px;">PENGADAAN ASSET BARU</h1>
        </div>

        <div class="main-content-card" style="background: white; padding: 40px; border-radius: 30px; border: 1px solid #e0eadd; box-shadow: 0 10px 30px rgba(0,0,0,0.05); position: relative; z-index: 10;">
            <h2 style="font-weight: 900; color: #6CA651; margin-bottom: 20px; text-transform: uppercase; font-size: 1.2rem;">🐣 Input Bibit Ternak Baru</h2>
            <form id="assetBaruForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group" style="grid-column: span 2; position: relative;">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">PRODUK KOMODITAS</label>
                    <div id="customSelectTrigger" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800; background:#f9fbf9; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span id="selectedProductLabel">-- PILIH PRODUK --</span>
                        <span style="color: #6CA651;">▼</span>
                    </div>
                    <div id="customSelectList" style="display: none; position: absolute; top: 105%; left: 0; width: 100%; max-height: 250px; background: white; border: 2px solid #6CA651; border-radius: 12px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
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
                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">JUMLAH EKOR</label>
                    <input type="number" id="jumlahAsset" required min="1" placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>
                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">HARGA PER EKOR (RP)</label>
                    <input type="number" id="hargaAsset" required placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>
                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">TANGGAL LAHIR TERNAK</label>
                    <input type="date" id="tglLahirAsset" required style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800; background: #f9fbf9; cursor: pointer;">
                </div>
                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">KETERANGAN / SUPPLIER</label>
                    <input type="text" id="keteranganAsset" placeholder="Detail supplier..." style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>
                <button type="submit" style="grid-column: span 2; padding: 20px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 5px 0 #4a7337; text-transform: uppercase;">Simpan Bibit Baru 🚀</button>
            </form>
        </div>

        <div class="main-content-card" style="background: #fdfdfd; padding: 40px; border-radius: 30px; border: 1.5px dashed #6CA651; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <h2 style="font-weight: 900; color: #41644A; margin-bottom: 20px; text-transform: uppercase; font-size: 1.2rem;">🛠️ Input Alat & Barang Baru</h2>
            <form id="alatBaruForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group" style="grid-column: span 2;">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">NAMA BARANG / ALAT</label>
                    <input type="text" id="namaAlat" required placeholder="Contoh: Mesin Tetas / Wadah Pakan" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>
                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">JUMLAH BARANG</label>
                    <input type="number" id="jumlahAlat" required min="1" placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>
                <div class="form-group">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">HARGA SATUAN (RP)</label>
                    <input type="number" id="hargaAlat" required placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800;">
                </div>
                <div class="form-group" style="grid-column: span 2;">
                    <label style="font-weight: 900; color: #41644A; display: block; margin-bottom: 8px;">NAMA PEMBELI / PENANGGUNG JAWAB</label>
                    <input type="text" id="pembeliAlat" required placeholder="Siapa yang beli?" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-weight: 800; background: #fff;">
                </div>
                <button type="submit" style="grid-column: span 2; padding: 20px; background: #41644A; color: white; border: none; border-radius: 15px; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 5px 0 #2d4a36; text-transform: uppercase;">Simpan Alat Baru 🔧</button>
            </form>
        </div>

        <div class="dashboard-card" style="background: white; padding: 30px; border-radius: 28px; border: 1px solid #eef2ed;">
            <h3 style="font-weight: 900; color: #1f3326; margin-bottom: 20px; text-align: center; text-transform: uppercase;">📦 DATA RIWAYAT BIBIT TERNAK</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: #6CA651; color: white;">
                        <tr>
                            <th style="padding: 15px; text-align: center;">TANGGAL BELI</th>
                            <th style="padding: 15px; text-align: center;">PRODUK</th>
                            <th style="padding: 15px; text-align: center;">UMUR</th>
                            <th style="padding: 15px; text-align: center;">JUMLAH</th>
                            <th style="padding: 15px; text-align: center;">TOTAL HARGA</th>
                            <th style="padding: 15px; text-align: center;">KETERANGAN</th>
                        </tr>
                    </thead>
                    <tbody id="historyAssetBody"></tbody>
                </table>
            </div>
        </div>

        <div class="dashboard-card" style="background: white; padding: 30px; border-radius: 28px; border: 1px solid #eef2ed;">
            <h3 style="font-weight: 900; color: #1f3326; margin-bottom: 20px; text-align: center; text-transform: uppercase;">🛠️ DATA RIWAYAT BELANJA ALAT</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: #41644A; color: white;">
                        <tr>
                            <th style="padding: 15px; text-align: center;">TANGGAL</th>
                            <th style="padding: 15px; text-align: center;">NAMA BARANG</th>
                            <th style="padding: 15px; text-align: center;">JUMLAH</th>
                            <th style="padding: 15px; text-align: center;">TOTAL HARGA</th>
                            <th style="padding: 15px; text-align: center;">PEMBELI</th>
                        </tr>
                    </thead>
                    <tbody id="historyAlatBody">
                        <tr><td colspan="5" style="padding: 30px; color: #ccc; text-align: center;">Memuat data alat...</td></tr>
                    </tbody>
                </table>
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

    const calculateAge = (birthDateStr) => {
        if (!birthDateStr || !birthDateStr.includes('-')) return birthDateStr || '-';
        const birthDate = new Date(birthDateStr);
        const today = new Date();
        birthDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        let parts = [];
        if (years > 0) parts.push(`${years} Thn`);
        if (months > 0) parts.push(`${months} Bln`);
        if (days >= 0 || parts.length === 0) parts.push(`${days} Hari`);
        return parts.join(' ');
    };

    trigger.onclick = (e) => {
        e.stopPropagation();
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    };

    document.querySelectorAll('.optionItem').forEach(item => {
        item.onclick = (e) => {
            selectedLabel.innerText = e.target.innerText;
            hiddenInput.value = e.target.innerText;
            list.style.display = 'none';
            selectedLabel.style.color = '#1f3326';
        };
    });

    document.onclick = () => { if (list) list.style.display = 'none'; };

    const loadHistory = async () => {
        const history = await presenter.fetchHistory();
        const alatHistory = await presenter.fetchAlatHistory(); // Fungsi baru di presenter

        // Render Tabel Ternak
        historyBody.innerHTML = history.length === 0 ? `<tr><td colspan="6" style="padding: 20px; color: #999; text-align: center;">Belum ada riwayat bibit.</td></tr>` : 
        history.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px; text-align: center;">${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                <td style="padding: 15px; font-weight: 800; text-align: center;">${item.produk}</td>
                <td style="padding: 15px; text-align: center; color: #d68910; font-weight: 900;">${calculateAge(item.umur)}</td>
                <td style="padding: 15px; font-weight: 900; color: #6CA651; text-align: center;">${item.jumlah} Unit</td>
                <td style="padding: 15px; font-weight: 700; text-align: center;">Rp ${(item.jumlah * (item.harga || 0)).toLocaleString()}</td>
                <td style="padding: 15px; color: #000; font-style: italic; text-align: left;">${item.keterangan || '-'}</td>
            </tr>
        `).join('');

        // Render Tabel Alat
        historyAlatBody.innerHTML = alatHistory.length === 0 ? `<tr><td colspan="5" style="padding: 20px; color: #999; text-align: center;">Belum ada riwayat alat.</td></tr>` : 
        alatHistory.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px; text-align: center;">${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                <td style="padding: 15px; font-weight: 800; text-align: center;">${item.nama_alat}</td>
                <td style="padding: 15px; text-align: center;">${item.jumlah} Pcs</td>
                <td style="padding: 15px; font-weight: 700; text-align: center; color: #41644A;">Rp ${(item.jumlah * (item.harga || 0)).toLocaleString()}</td>
                <td style="padding: 15px; font-weight: 700; text-align: center;">${item.pembeli}</td>
            </tr>
        `).join('');
    };

    // SUBMIT BIBIT
    formBibit.onsubmit = async (e) => {
        e.preventDefault();
        if (!hiddenInput.value) return alert("Pilih produk bibit!");
        const res = await presenter.submitAsset({
            produk: hiddenInput.value,
            jumlah: parseInt(document.getElementById('jumlahAsset').value),
            harga: parseInt(document.getElementById('hargaAsset').value),
            umur: document.getElementById('tglLahirAsset').value,
            keterangan: document.getElementById('keteranganAsset').value
        });
        if (res.status === 'success') {
            alert("Bibit Berhasil Disimpan!");
            formBibit.reset();
            selectedLabel.innerText = "-- PILIH PRODUK --";
            await loadHistory();
        }
    };

    // SUBMIT ALAT
    formAlat.onsubmit = async (e) => {
        e.preventDefault();
        const res = await presenter.submitAlat({
            nama_alat: document.getElementById('namaAlat').value,
            jumlah: parseInt(document.getElementById('jumlahAlat').value),
            harga: parseInt(document.getElementById('hargaAlat').value),
            pembeli: document.getElementById('pembeliAlat').value
        });
        if (res.status === 'success') {
            alert("Asset Alat Berhasil Dicatat!");
            formAlat.reset();
            await loadHistory();
        }
    };

    await loadHistory();
  }
};

export default BibitBaru;