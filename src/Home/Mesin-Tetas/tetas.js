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
            
            <div class="mesin-card" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="color:#666; font-size:0.9rem; font-weight:900;">MINGGU 1</h3>
                    <div id="val-MESIN_1" style="font-size:2.8rem; font-weight:1200; color:#6CA651; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#aaa; font-weight:800;">BUTIR TELUR</div>
                </div>
                <button class="btn-move" data-from="MESIN_1" data-to="MESIN_2" style="margin-top:20px; width:100%; padding:12px; border-radius:12px; background:#6CA651; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Lanjut Ke 2</button>
            </div>

            <div class="mesin-card" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="color:#666; font-size:0.9rem; font-weight:900;">MINGGU 2</h3>
                    <div id="val-MESIN_2" style="font-size:2.8rem; font-weight:1200; color:#d68910; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#aaa; font-weight:800;">BUTIR TELUR</div>
                </div>
                <button class="btn-move" data-from="MESIN_2" data-to="MESIN_3" style="margin-top:20px; width:100%; padding:12px; border-radius:12px; background:#d68910; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Lanjut Ke 3</button>
            </div>

            <div class="mesin-card" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="color:#666; font-size:0.9rem; font-weight:900;">MINGGU 3</h3>
                    <div id="val-MESIN_3" style="font-size:2.8rem; font-weight:1200; color:#e74c3c; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#aaa; font-weight:800;">BUTIR TELUR</div>
                </div>
                <button class="btn-move" data-from="MESIN_3" data-to="SIAP_PANEN" style="margin-top:20px; width:100%; padding:12px; border-radius:12px; background:#e74c3c; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Siap Panen</button>
            </div>

            <div class="mesin-card" style="background:#f0fdf4; padding:20px; border-radius:20px; text-align:center; border:2px solid #16a34a; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="color:#16a34a; font-size:0.9rem; font-weight:900;">TAHAP PANEN</h3>
                    <div id="val-SIAP_PANEN" style="font-size:2.8rem; font-weight:1200; color:#1f3326; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#16a34a; font-weight:800;">BUTIR TERSEDIA</div>
                </div>
                <button id="btnFinalHatch" style="margin-top:20px; width:100%; padding:12px; border-radius:12px; background:#1f3326; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Panen DOC</button>
            </div>

        </div>

        <div style="text-align:center; color:#999; font-weight:700; font-size:0.85rem;">
            * Telur bergerak dari Minggu 1 hingga ke Tahap Panen sebelum masuk ke Stok DOC.
        </div>
      </section>
    `;
  },

  async afterRender() {
    const presenter = new TetasPresenter({
      onDataReady: (cat) => { document.getElementById('catName').innerText = cat.nama; },
      onUpdateUI: (data) => {
        // Reset semua tampilan ke 0
        ['MESIN_1', 'MESIN_2', 'MESIN_3', 'SIAP_PANEN'].forEach(id => {
            document.getElementById(`val-${id}`).innerText = "0";
        });
        // Isi data berdasarkan status dari DB
        data.forEach(item => {
            const el = document.getElementById(`val-${item.status}`);
            if (el) el.innerText = item.total.toLocaleString();
        });
      }
    });

    // Event Klik Pindah Mesin (1->2, 2->3, 3->Siap Panen)
    document.querySelectorAll('.btn-move').forEach(btn => {
        btn.onclick = async (e) => {
            const { from, to } = e.target.dataset;
            const currentVal = parseInt(document.getElementById(`val-${from}`).innerText);
            
            if (currentVal <= 0) return alert("Tidak ada telur untuk dipindahkan!");

            const res = await presenter.moveMesin({
                kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
                from_status: from,
                to_status: to
            });

            if (res.status === 'success') {
                location.reload();
            }
        };
    });

    // Event Klik Panen Akhir (Card 4 -> Masuk ke Stok DOC)
    document.getElementById('btnFinalHatch').onclick = async () => {
        const currentVal = parseInt(document.getElementById('val-SIAP_PANEN').innerText);
        if (currentVal <= 0) return alert("Belum ada telur di Tahap Panen!");

        const jmlHidup = prompt(`Total telur di Tahap Panen: ${currentVal}\nBerapa yang HIDUP / MENETAS?`);
        if (jmlHidup === null) return;
        
        const hidup = parseInt(jmlHidup) || 0;
        if (hidup > currentVal) return alert("Jumlah hidup tidak boleh melebihi isi mesin!");

        const mati = currentVal - hidup;
        if (!confirm(`Konfirmasi Panen:\n- Menetas Hidup: ${hidup} Ekor\n- Gagal/Mati: ${mati} Butir\n\nData akan masuk ke Stok DOC asli. Lanjutkan?`)) return;

        const res = await presenter.moveMesin({
            kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
            from_status: 'SIAP_PANEN',
            to_status: 'SELESAI',
            jumlah_hidup: hidup,
            jumlah_mati: mati
        });

        if (res.status === 'success') {
            alert("Selamat! Stok DOC telah diperbarui. 🐣");
            location.reload();
        }
    };

    await presenter.init();
  }
};

export default Tetas;