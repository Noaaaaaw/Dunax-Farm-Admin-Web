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
            ${['MESIN_1', 'MESIN_2', 'MESIN_3'].map((id, index) => `
            <div class="mesin-card" id="card-${id}" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
                <button class="btn-cheat" data-from="${id}" title="Cheat: Selesaikan Inkubasi" style="position:absolute; top:10px; right:10px; background:#fef3c7; border:1px solid #f59e0b; border-radius:50%; width:30px; height:30px; cursor:pointer; font-size:1rem;">⚡</button>
                <div>
                    <h3 style="color:#666; font-size:0.9rem; font-weight:900;">MESIN ${index + 1}</h3>
                    <div id="val-${id}" style="font-size:2.8rem; font-weight:1200; color:#6CA651; margin: 10px 0;">0</div>
                    <div id="days-${id}" style="font-size:0.7rem; color:#aaa; font-weight:800; margin-bottom:10px;">IDLE</div>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button class="btn-start" id="btn-start-${id}" data-mesin="${id}" style="width:100%; padding:12px; border-radius:12px; background:#4b7bec; color:#fff; border:none; cursor:pointer; font-weight:900;">SIMPAN & MULAI</button>
                    <button class="btn-move" id="btn-panen-${id}" data-from="${id}" disabled style="width:100%; padding:12px; border-radius:12px; background:#ccc; color:#fff; border:none; cursor:not-allowed; font-weight:900;">KONFIRMASI PANEN</button>
                </div>
            </div>
            `).join('')}

            <div class="mesin-card" style="background:#f0fdf4; padding:20px; border-radius:20px; text-align:center; border:2px solid #16a34a; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="color:#16a34a; font-size:0.9rem; font-weight:900;">KOTAK PANEN (DOC)</h3>
                    <div id="val-SIAP_PANEN" style="font-size:2.8rem; font-weight:1200; color:#1f3326; margin: 10px 0;">0</div>
                </div>
                <button id="btnFinalHatch" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#16a34a; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Kirim ke Kelola DOC 🚀</button>
            </div>
        </div>

        <div class="table-container" style="background:white; border-radius:20px; padding:25px; border:1px solid #eee; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <h3 style="margin-bottom:20px; color:#41644A; font-weight:900; text-align: center; text-transform:uppercase;">Monitoring Antrian Inkubasi</h3>
            <table style="width:100%; border-collapse:collapse; text-align:center;">
                <thead>
                    <tr style="background:#6CA651;">
                        <th style="padding:15px; color:white; font-size:0.85rem; border: 2px solid #fff;">TANGGAL MULAI</th>
                        <th style="padding:15px; color:white; font-size:0.85rem; border: 2px solid #fff;">MESIN</th>
                        <th style="padding:15px; color:white; font-size:0.85rem; border: 2px solid #fff;">JUMLAH</th>
                        <th style="padding:15px; color:white; font-size:0.85rem; border: 2px solid #fff;">UMUR</th>
                    </tr>
                </thead>
                <tbody id="umurTableBody"></tbody>
            </table>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const categoryId = window.location.hash.split('-').slice(1).join('-').toLowerCase();

    const presenter = new TetasPresenter({
      onDataReady: (cat) => { document.getElementById('catName').innerText = cat.nama; },
      onUpdateUI: (data) => {
        // RESET UI
        ['MESIN_1', 'MESIN_2', 'MESIN_3', 'SIAP_PANEN'].forEach(id => {
            const valEl = document.getElementById(`val-${id}`);
            if (valEl) valEl.innerText = "0";
            if (id !== 'SIAP_PANEN') {
                document.getElementById(`days-${id}`).innerText = "IDLE";
                const btnS = document.getElementById(`btn-start-${id}`);
                const btnP = document.getElementById(`btn-panen-${id}`);
                btnS.style.display = "block";
                btnS.disabled = false;
                btnS.innerText = "SIMPAN & MULAI";
                btnS.style.background = "#4b7bec";
                btnP.disabled = true;
                btnP.style.background = "#ccc";
                btnP.style.cursor = "not-allowed";
            }
        });

        const tableBody = document.getElementById('umurTableBody');
        tableBody.innerHTML = "";

        data.forEach(item => {
            const targetId = item.status.replace('WAITING_', 'MESIN_');
            const valEl = document.getElementById(`val-${targetId}`);
            const daysEl = document.getElementById(`days-${targetId}`);
            const btnStart = document.getElementById(`btn-start-${targetId}`);
            const btnPanen = document.getElementById(`btn-panen-${targetId}`);

            if (valEl) {
                const currentVal = parseInt(valEl.innerText.replace(/,/g, '')) || 0;
                valEl.innerText = (currentVal + parseInt(item.jumlah)).toLocaleString();
                
                if (item.mesi_1_tgl) {
                    const tglMasuk = new Date(item.mesi_1_tgl);
                    const diffDays = Math.floor(Math.abs(new Date() - tglMasuk) / (1000 * 60 * 60 * 24));
                    if (daysEl) daysEl.innerText = `${diffDays} / 21 HARI`;

                    if (btnStart) {
                        btnStart.innerText = "SEDANG PROSES";
                        btnStart.disabled = true;
                        btnStart.style.background = "#aaa";
                    }

                    if (diffDays >= 21) {
                        if (btnPanen) {
                            btnPanen.disabled = false;
                            btnPanen.style.background = "#6CA651";
                            btnPanen.style.cursor = "pointer";
                        }
                        if (btnStart) btnStart.style.display = "none";
                    }

                    tableBody.innerHTML += `
                        <tr style="background:#f8f9fa;">
                            <td style="padding:15px; font-weight:700; border: 2px solid #fff;">${tglMasuk.toLocaleDateString('id-ID')}</td>
                            <td style="padding:15px; font-weight:800; border: 2px solid #fff;">${targetId}</td>
                            <td style="padding:15px; font-weight:800; border: 2px solid #fff; color:#6CA651;">${item.jumlah} Butir</td>
                            <td style="padding:15px; font-weight:700; border: 2px solid #fff;">${diffDays} Hari</td>
                        </tr>`;
                } else {
                    if (daysEl) daysEl.innerText = "STANDBY (BELUM MULAI)";
                }
            }
        });

        if (tableBody.innerHTML === "") {
            tableBody.innerHTML = `<tr><td colspan="4" style="padding:20px; color:#999; text-align:center;">Belum ada inkubasi yang berjalan.</td></tr>`;
        }
      }
    });

    // ACTION: SIMPAN & MULAI (Tetap di Card sesuai Gambar)
    document.querySelectorAll('.btn-start').forEach(btn => {
        btn.onclick = async (e) => {
            const mesinId = e.target.dataset.mesin;
            const jumlah = parseInt(document.getElementById(`val-${mesinId}`).innerText.replace(/,/g, '')) || 0;
            
            if (jumlah <= 0) return alert("Gagal: Tidak ada telur standby!");

            // LOGIKA SIKLUS: Cek kalau Mesin 1 di-klik tapi mesin sebelumnya belum kelar (optional, sesuai flow lo)
            if (confirm(`Mulai inkubasi ${jumlah} butir di ${mesinId.replace('_', ' ')}?`)) {
                const res = await presenter.startIncubation({ 
                    kategori_id: categoryId, 
                    status: mesinId.replace('MESIN_', 'WAITING_') 
                });
                if (res.status === 'success') {
                    alert("Berhasil! Inkubasi dimulai.");
                    location.reload();
                }
            }
        };
    });

    // ACTION: KONFIRMASI PANEN
    document.querySelectorAll('.btn-move').forEach(btn => {
        btn.onclick = async (e) => {
            const { from } = e.currentTarget.dataset;
            const total = parseInt(document.getElementById(`val-${from}`).innerText.replace(/,/g, ''));
            const netas = prompt(`Berapa ekor yang BERHASIL MENETAS?`, total);
            if (netas === null || netas === "") return;

            const res = await presenter.moveMesin({
                kategori_id: categoryId,
                from_status: from.replace('MESIN_', 'WAITING_'),
                to_status: 'SIAP_PANEN',
                jumlah_berhasil: parseInt(netas) 
            });
            if (res.status === 'success') location.reload();
        };
    });

    // ACTION: CHEAT
    document.querySelectorAll('.btn-cheat').forEach(btn => {
        btn.onclick = (e) => {
            const { from } = e.currentTarget.dataset;
            const btnPanen = document.getElementById(`btn-panen-${from}`);
            if (btnPanen) {
                btnPanen.disabled = false;
                btnPanen.style.background = "#6CA651";
                btnPanen.style.cursor = "pointer";
                document.getElementById(`btn-start-${from}`).style.display = "none";
                alert(`⚡ CHEAT: Mesin ${from} siap panen sekarang!`);
            }
        };
    });

    // ACTION: KIRIM KE DOC
    document.getElementById('btnFinalHatch').onclick = async () => {
        const val = parseInt(document.getElementById('val-SIAP_PANEN').innerText.replace(/,/g, ''));
        if (val <= 0) return alert("Kotak Panen kosong!");
        if (confirm(`Kirim ${val} DOC ke Kelola DOC?`)) {
            const res = await presenter.moveMesin({ kategori_id: categoryId, from_status: 'SIAP_PANEN', to_status: 'SELESAI' });
            if (res.status === 'success') location.reload();
        }
    };

    await presenter.init();
  }
};

export default Tetas;