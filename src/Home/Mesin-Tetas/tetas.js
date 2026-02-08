import TetasPresenter from './tetas-presenter.js';

const Tetas = {
  async render() {
    return `
      <section class="page" style="padding: 20px; display:flex; flex-direction:column; gap:30px; max-width:1200px; margin:0 auto;">
        <div class="page-header-card" style="background:#fff; padding:40px; border-radius:24px; text-align:center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
            <h1 style="font-family:'Luckiest Guy'; color:#6CA651; font-size:2.5rem; margin:0; letter-spacing:2px;">MANAGEMENT MESIN TETAS</h1>
            <h2 id="catName" style="font-weight:900; color:#1f3326; margin-top:10px; text-transform:uppercase;"></h2>
        </div>

        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:15px;">
            <div class="mesin-card" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
                <button class="btn-fast-forward" data-from="MESIN_1" title="Cepat ke Kotak Panen" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; font-size:1.2rem;">⚡</button>
                <div>
                    <h3 style="color:#666; font-size:0.9rem; font-weight:900;">MESIN 1</h3>
                    <div id="val-MESIN_1" style="font-size:2.8rem; font-weight:1200; color:#6CA651; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#aaa; font-weight:800;">BUTIR TELUR</div>
                </div>
                <button class="btn-move" data-from="MESIN_1" data-to="MESIN_2" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#6CA651; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Konfirmasi Minggu 1</button>
            </div>

            <div class="mesin-card" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
                <button class="btn-fast-forward" data-from="MESIN_2" title="Cepat ke Kotak Panen" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; font-size:1.2rem;">⚡</button>
                <div>
                    <h3 style="color:#666; font-size:0.9rem; font-weight:900;">MESIN 2</h3>
                    <div id="val-MESIN_2" style="font-size:2.8rem; font-weight:1200; color:#d68910; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#aaa; font-weight:800;">BUTIR TELUR</div>
                </div>
                <button class="btn-move" data-from="MESIN_2" data-to="MESIN_3" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#d68910; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Konfirmasi Minggu 2</button>
            </div>

            <div class="mesin-card" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
                <button class="btn-fast-forward" data-from="MESIN_3" title="Cepat ke Kotak Panen" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; font-size:1.2rem;">⚡</button>
                <div>
                    <h3 style="color:#666; font-size:0.9rem; font-weight:900;">MESIN 3</h3>
                    <div id="val-MESIN_3" style="font-size:2.8rem; font-weight:1200; color:#e74c3c; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#aaa; font-weight:800;">BUTIR TELUR</div>
                </div>
                <button class="btn-move" data-from="MESIN_3" data-to="SIAP_PANEN" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#e74c3c; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Konfirmasi Minggu 3</button>
            </div>

            <div class="mesin-card" style="background:#f0fdf4; padding:20px; border-radius:20px; text-align:center; border:2px solid #16a34a; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="color:#16a34a; font-size:0.9rem; font-weight:900;">KOTAK PANEN</h3>
                    <div id="val-SIAP_PANEN" style="font-size:2.8rem; font-weight:1200; color:#1f3326; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#16a34a; font-weight:800; margin-bottom:15px;">TOTAL TELUR TERSEDIA</div>
                    
                    <div id="inputAreaDOC" style="display:none; background:#fff; padding:15px; border-radius:15px; border:1px solid #16a34a; flex-direction:column; gap:8px;">
                        <label style="font-size:0.75rem; font-weight:900; color:#16a34a;">JUMLAH MENETAS HIDUP</label>
                        <input type="number" id="jmlHidupInput" value="0" style="width:100%; padding:10px; border-radius:8px; border:2px solid #16a34a; font-size:1.2rem; font-weight:900; text-align:center;">
                    </div>
                </div>
                <button id="btnToggleInput" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#1f3326; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Input Hasil Panen</button>
                <button id="btnFinalHatch" style="display:none; margin-top:10px; width:100%; padding:15px; border-radius:12px; background:#16a34a; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Konfirmasi Hasil DOC</button>
            </div>
        </div>

        <div class="table-container" style="background:white; border-radius:20px; padding:25px; border:1px solid #eee; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <h3 style="margin-bottom:20px; color:#41644A; font-weight:900; text-transform:uppercase;">Monitoring Antrian & Hatch Rate</h3>
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <thead>
                    <tr style="background:#f8fafc; border-bottom:2px solid #eee;">
                        <th style="padding:15px; color:#64748b; font-size:0.85rem;">TANGGAL MASUK</th>
                        <th style="padding:15px; color:#64748b; font-size:0.85rem;">POSISI MESIN</th>
                        <th style="padding:15px; color:#64748b; font-size:0.85rem;">STATUS</th>
                        <th style="padding:15px; color:#64748b; font-size:0.85rem;">JUMLAH (AKTIF)</th>
                        <th style="padding:15px; color:#64748b; font-size:0.85rem;">HATCH RATE</th>
                        <th style="padding:15px; color:#64748b; font-size:0.85rem;">UMUR</th>
                    </tr>
                </thead>
                <tbody id="umurTableBody">
                    <tr><td colspan="6" style="text-align:center; padding:20px; color:#ccc;">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const presenter = new TetasPresenter({
      onDataReady: (cat) => { document.getElementById('catName').innerText = cat.nama; },
      onUpdateUI: (data) => {
        ['MESIN_1', 'MESIN_2', 'MESIN_3', 'SIAP_PANEN'].forEach(id => {
            document.getElementById(`val-${id}`).innerText = "0";
        });
        
        // Hanya hitung total untuk yang belum menetas permanen
        const activeData = data.filter(item => item.status !== 'DOC_HIDUP');
        activeData.forEach(item => {
            const el = document.getElementById(`val-${item.status}`);
            if (el) {
                const current = parseInt(el.innerText);
                el.innerText = (current + parseInt(item.jumlah)).toLocaleString();
            }
        });

        const tableBody = document.getElementById('umurTableBody');
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:#aaa; font-weight:700;">BELUM ADA DATA.</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.map(item => {
            const tglMasuk = new Date(item.mesi_1_tgl);
            const diffDays = Math.floor(Math.abs(new Date() - tglMasuk) / (1000 * 60 * 60 * 24));
            
            // Logika Status Mentereng
            const isHatched = item.status === 'DOC_HIDUP';
            const statusLabel = isHatched 
                ? `<span style="background:#dcfce7; color:#166534; padding:5px 10px; border-radius:8px; font-size:0.75rem; font-weight:800;">BERHASIL TETAS</span>`
                : `<span style="background:#f1f5f9; padding:5px 10px; border-radius:8px; font-size:0.75rem; font-weight:800; color:#475569;">${item.status.replace('_', ' ')}</span>`;

            // Hitung Hatch Rate (Hanya jika sudah menetas)
            // Catatan: Ryan butuh kolom 'jumlah_awal' di DB atau kita asumsikan jumlah di baris ini tidak berubah selama pengeraman
            const rateTampil = isHatched ? `<b style="color:#16a34a;">Mentereng!</b>` : `<span style="color:#94a3b8;">Proses...</span>`;

            return `
                <tr style="border-bottom:1px solid #f1f5f9; background: ${isHatched ? '#fcfdfc' : 'transparent'};">
                    <td style="padding:15px; font-weight:700;">${tglMasuk.toLocaleDateString('id-ID')}</td>
                    <td style="padding:15px; font-weight:800; color:#1e293b;">${isHatched ? 'KANDANG DOC' : item.status.replace('_', ' ')}</td>
                    <td style="padding:15px;">${statusLabel}</td>
                    <td style="padding:15px; font-weight:800; color:#6CA651;">${item.jumlah} Ekor/Butir</td>
                    <td style="padding:15px; font-weight:800;">${rateTampil}</td>
                    <td style="padding:15px; font-weight:700;">${diffDays} Hari</td>
                </tr>
            `;
        }).join('');
      }
    });

    // Event Klik Pindah Normal
    document.querySelectorAll('.btn-move').forEach(btn => {
        btn.onclick = async (e) => {
            const { from, to } = e.target.dataset;
            const res = await presenter.moveMesin({
                kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
                from_status: from, to_status: to
            });
            if (res.status === 'success') location.reload();
        };
    });

    // ⚡ Simulasi Cepat
    document.querySelectorAll('.btn-fast-forward').forEach(btn => {
        btn.onclick = async (e) => {
            const { from } = e.target.dataset;
            const res = await presenter.moveMesin({
                kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
                from_status: from, to_status: 'SIAP_PANEN'
            });
            if (res.status === 'success') location.reload();
        };
    });

    // Logika Input Langsung di Card
    const btnToggle = document.getElementById('btnToggleInput');
    const inputArea = document.getElementById('inputAreaDOC');
    const btnFinal = document.getElementById('btnFinalHatch');
    const jmlInput = document.getElementById('jmlHidupInput');

    btnToggle.onclick = () => {
        const currentVal = parseInt(document.getElementById('val-SIAP_PANEN').innerText);
        if (currentVal <= 0) return alert("Belum ada telur di Kotak Panen!");
        btnToggle.style.display = 'none';
        inputArea.style.display = 'flex';
        btnFinal.style.display = 'block';
        jmlInput.focus();
    };

    btnFinal.onclick = async () => {
        const currentVal = parseInt(document.getElementById('val-SIAP_PANEN').innerText);
        const hidup = parseInt(jmlInput.value) || 0;
        if (hidup > currentVal) return alert("Angka menetas tidak logis!");
        
        const res = await presenter.moveMesin({
            kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
            from_status: 'SIAP_PANEN', to_status: 'SELESAI',
            jumlah_hidup: hidup, jumlah_mati: (currentVal - hidup)
        });
        if (res.status === 'success') location.reload();
    };

    await presenter.init();
  }
};

export default Tetas;