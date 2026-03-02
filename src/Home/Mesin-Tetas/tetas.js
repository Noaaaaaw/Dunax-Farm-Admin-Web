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
                <button class="btn-cheat" data-from="${id}" title="Cheat" style="position:absolute; top:10px; right:10px; background:#fef3c7; border:1px solid #f59e0b; border-radius:50%; width:30px; height:30px; cursor:pointer;">⚡</button>
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
                <button id="btnFinalHatch" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#16a34a; color:#fff; border:none; cursor:pointer; font-weight:900;">Kirim ke Kelola DOC 🚀</button>
            </div>
        </div>

        <div class="table-container" style="background:white; border-radius:20px; padding:25px; border:1px solid #eee; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <h3 style="margin-bottom:20px; color:#41644A; font-weight:900; text-align: center;">Monitoring Antrian Inkubasi</h3>
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
    const colors = { MESIN_1: '#6CA651', MESIN_2: '#d68910', MESIN_3: '#e74c3c' };
    const totals = { MESIN_1: 0, MESIN_2: 0, MESIN_3: 0, SIAP_PANEN: 0 };
    
    // Reset UI ke IDLE
    ['MESIN_1', 'MESIN_2', 'MESIN_3'].forEach(id => {
        document.getElementById(`val-${id}`).innerText = "0";
        document.getElementById(`days-${id}`).innerText = "IDLE (KOSONG)";
        document.getElementById(`card-${id}`).style.border = "2px solid #eee";
        document.getElementById(`card-${id}`).style.opacity = "1";
    });

    data.forEach(item => {
        if (totals[item.status] !== undefined) {
            totals[item.status] += parseInt(item.jumlah);
            const targetId = item.status;
            const daysEl = document.getElementById(`days-${targetId}`);
            const btnS = document.getElementById(`btn-start-${targetId}`);
            const card = document.getElementById(`card-${targetId}`);

            document.getElementById(`val-${targetId}`).innerText = totals[targetId];

            // 🔒 JIKA MESIN SEDANG INKUBASI (KUNCI TOTAL)
            if (item.mulai_proses_tgl && item.mulai_proses_tgl !== 'BATAL') {
                const tglMulai = new Date(item.mulai_proses_tgl);
                const diffDays = Math.floor((new Date() - tglMulai) / (1000 * 60 * 60 * 24));
                
                if (daysEl) {
                    daysEl.innerText = `⏳ INKUBASI: ${diffDays} / 21 HARI`;
                    daysEl.style.color = "#f59e0b";
                }
                
                if (btnS) {
                    btnS.innerText = "PROSES DIKUNCI";
                    btnS.disabled = true;
                    btnS.style.background = "#aaa";
                }
                
                // Visualisasi Mesin Terkunci
                card.style.border = "2px solid #f59e0b";
                card.style.background = "#fffdf5";
            } else if (totals[targetId] > 0) {
                // 📥 MESIN LAGI NAMPUNG (BELUM DI-START)
                daysEl.innerText = "MENAMPUNG ANTREAN...";
                daysEl.style.color = "#4b7bec";
            }
        }
    });
}
    });

    // ACTION: KLIK SIMPAN & MULAI (MENJALANKAN LOCK)
    document.querySelectorAll('.btn-start').forEach(btn => {
        btn.onclick = async (e) => {
            const mesinId = e.target.dataset.mesin;
            const currentVal = parseInt(document.getElementById(`val-${mesinId}`).innerText);
            if (currentVal <= 0) return alert("Antrean telur kosong!");

            if (confirm(`Mulai proses inkubasi 21 hari di ${mesinId.replace('_', ' ')}?`)) {
                const res = await presenter.startProcess({ kategori_id: categoryId, status: mesinId });
                if (res.status === 'success') {
                    alert(`Berhasil! Inkubasi dikunci selama 21 hari.`);
                    location.reload();
                } else {
                    alert("Gagal: " + res.message);
                }
            }
        };
    });

    // ACTION: PANEN
    document.querySelectorAll('.btn-move').forEach(btn => {
        btn.onclick = async (e) => {
            const { from } = e.currentTarget.dataset;
            const total = parseInt(document.getElementById(`val-${from}`).innerText.replace(/,/g, ''));
            const netas = prompt(`Berapa ekor yang BERHASIL MENETAS?`, total);
            if (!netas) return;

            const res = await presenter.moveMesin({
                kategori_id: categoryId,
                from_status: from,
                to_status: 'SIAP_PANEN',
                jumlah_berhasil: parseInt(netas) 
            });
            if (res.status === 'success') location.reload();
        };
    });

    await presenter.init();
  }
};

export default Tetas;