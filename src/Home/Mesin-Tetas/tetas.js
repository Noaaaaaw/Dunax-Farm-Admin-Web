import TetasPresenter from './tetas-presenter.js';

const Tetas = {
  async render() {
    return `
      <section class="page" style="padding: 20px; display:flex; flex-direction:column; gap:30px; max-width:1200px; margin:0 auto;">
        <div class="page-header-card" style="background:#fff; padding:40px; border-radius:24px; text-align:center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
            <h1 style="font-family:'Luckiest Guy'; color:#6CA651; font-size:2.5rem; margin:0; letter-spacing:2px;">MANAGEMENT MESIN TETAS</h1>
            <h2 id="catName" style="font-weight:900; color:#1f3326; margin-top:10px; text-transform:uppercase;"></h2>
            <div style="margin-top:10px; background:#fff4f4; color:#e74c3c; padding:8px 15px; border-radius:10px; display:inline-block; font-size:0.75rem; font-weight:900; border:1px dashed #e74c3c;">
                MODE SIMULASI: TOMBOL PETIR (⚡) AKAN LANGSUNG MEMINDAHKAN TELUR KE KOTAK PANEN
            </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:15px;">
            <div class="mesin-card" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
                <button class="btn-fast-forward" data-from="MESIN_1" title="Lompat ke Kotak Panen" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; font-size:1.2rem;">⚡</button>
                <div>
                    <h3 style="color:#666; font-size:0.9rem; font-weight:900;">MESIN 1</h3>
                    <div id="val-MESIN_1" style="font-size:2.8rem; font-weight:1200; color:#6CA651; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#aaa; font-weight:800;">BUTIR TELUR</div>
                </div>
                <button class="btn-move" data-from="MESIN_1" data-to="MESIN_2" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#6CA651; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Konfirmasi Minggu 1</button>
            </div>

            <div class="mesin-card" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
                <button class="btn-fast-forward" data-from="MESIN_2" title="Lompat ke Kotak Panen" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; font-size:1.2rem;">⚡</button>
                <div>
                    <h3 style="color:#666; font-size:0.9rem; font-weight:900;">MESIN 2</h3>
                    <div id="val-MESIN_2" style="font-size:2.8rem; font-weight:1200; color:#d68910; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#aaa; font-weight:800;">BUTIR TELUR</div>
                </div>
                <button class="btn-move" data-from="MESIN_2" data-to="MESIN_3" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#d68910; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Konfirmasi Minggu 2</button>
            </div>

            <div class="mesin-card" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
                <button class="btn-fast-forward" data-from="MESIN_3" title="Lompat ke Kotak Panen" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; font-size:1.2rem;">⚡</button>
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
                    <div style="font-size:0.7rem; color:#16a34a; font-weight:800;">BUTIR TERSEDIA</div>
                </div>
                <button id="btnFinalHatch" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#1f3326; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Input Hasil DOC</button>
            </div>
        </div>

        <div class="table-container" style="background:white; border-radius:20px; padding:25px; border:1px solid #eee; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <h3 style="margin-bottom:20px; color:#41644A; font-weight:900; text-transform:uppercase;">Daftar Antrian & Monitoring Umur</h3>
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <thead>
                    <tr style="background:#f8fafc; border-bottom:2px solid #eee;">
                        <th style="padding:15px; color:#64748b; font-size:0.85rem;">TANGGAL MASUK (MESIN 1)</th>
                        <th style="padding:15px; color:#64748b; font-size:0.85rem;">POSISI</th>
                        <th style="padding:15px; color:#64748b; font-size:0.85rem;">JUMLAH</th>
                        <th style="padding:15px; color:#64748b; font-size:0.85rem;">UMUR SEKARANG</th>
                        <th style="padding:15px; color:#64748b; font-size:0.85rem;">ESTIMASI PANEN</th>
                    </tr>
                </thead>
                <tbody id="umurTableBody">
                    <tr><td colspan="5" style="text-align:center; padding:20px; color:#ccc;">Memuat data...</td></tr>
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
        const totals = {};
        data.forEach(item => {
            totals[item.status] = (totals[item.status] || 0) + parseInt(item.jumlah);
        });
        Object.keys(totals).forEach(status => {
            const el = document.getElementById(`val-${status}`);
            if (el) el.innerText = totals[status].toLocaleString();
        });

        const tableBody = document.getElementById('umurTableBody');
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:#aaa; font-weight:700;">BELUM ADA ANTRIAN.</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.map(item => {
            const tglMasuk = new Date(item.mesi_1_tgl);
            const diffTime = Math.abs(new Date() - tglMasuk);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const estimasiPanen = new Date(tglMasuk);
            estimasiPanen.setDate(estimasiPanen.getDate() + 21);
            const isLate = diffDays >= 21 ? 'color: #e74c3c; font-weight: 900;' : 'font-weight: 700;';
            return `
                <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:15px; font-weight:700;">${tglMasuk.toLocaleDateString('id-ID')}</td>
                    <td style="padding:15px;"><span style="background:#f1f5f9; padding:5px 10px; border-radius:8px; font-size:0.75rem; font-weight:800; color:#475569;">${item.status}</span></td>
                    <td style="padding:15px; font-weight:800; color:#6CA651;">${item.jumlah} Butir</td>
                    <td style="padding:15px; ${isLate}">${diffDays} Hari</td>
                    <td style="padding:15px; color:#e74c3c; font-weight:700;">${estimasiPanen.toLocaleDateString('id-ID')}</td>
                </tr>
            `;
        }).join('');
      }
    });

    // Event Klik Pindah Normal
    document.querySelectorAll('.btn-move').forEach(btn => {
        btn.onclick = async (e) => {
            const { from, to } = e.target.dataset;
            const currentVal = parseInt(document.getElementById(`val-${from}`).innerText);
            if (currentVal <= 0) return alert("Mesin kosong!");
            if (!confirm(`KONFIRMASI: Pindahkan ${currentVal} butir ke tahap berikutnya?`)) return;

            const res = await presenter.moveMesin({
                kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
                from_status: from,
                to_status: to
            });
            if (res.status === 'success') location.reload();
        };
    });

    // ✅ FITUR TOMBOL CEPAT (⚡): LANGSUNG KE KOTAK PANEN
    document.querySelectorAll('.btn-fast-forward').forEach(btn => {
        btn.onclick = async (e) => {
            const { from } = e.target.dataset;
            const currentVal = parseInt(document.getElementById(`val-${from}`).innerText);
            if (currentVal <= 0) return alert("Tidak ada data untuk disimulasikan.");
            
            if (!confirm(`SIMULASI CEPAT: Langsung pindahkan telur dari ${from} ke KOTAK PANEN?`)) return;

            const res = await presenter.moveMesin({
                kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
                from_status: from,
                to_status: 'SIAP_PANEN' // Lompat langsung ke box 4
            });

            if (res.status === 'success') location.reload();
        };
    });

    // Panen Akhir dari Card 4
    document.getElementById('btnFinalHatch').onclick = async () => {
        const currentVal = parseInt(document.getElementById('val-SIAP_PANEN').innerText);
        if (currentVal <= 0) return alert("KOTAK PANEN kosong!");
        const jmlHidup = prompt(`HASIL PANEN FINAL\nBerapa ekor yang HIDUP?`);
        if (jmlHidup === null) return;
        const hidup = parseInt(jmlHidup) || 0;
        const mati = currentVal - hidup;
        if (!confirm(`Simpan ke STOK DOC?`)) return;

        const res = await presenter.moveMesin({
            kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
            from_status: 'SIAP_PANEN',
            to_status: 'SELESAI',
            jumlah_hidup: hidup,
            jumlah_mati: mati
        });
        if (res.status === 'success') {
            alert("Mentereng! Stok DOC diperbarui. 🐣");
            location.reload();
        }
    };

    await presenter.init();
  }
};

export default Tetas;