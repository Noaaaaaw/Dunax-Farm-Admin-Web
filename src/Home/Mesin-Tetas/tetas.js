import TetasPresenter from './tetas-presenter.js';

const Tetas = {
  async render() {
    return `
      <section class="page" style="padding: 20px; display:flex; flex-direction:column; gap:30px; max-width:1200px; margin:0 auto;">
        <div class="page-header-card" style="background:#fff; padding:40px; border-radius:24px; text-align:center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
            <h1 style="font-family:'Luckiest Guy'; color:#6CA651; font-size:2.5rem; margin:0; letter-spacing:2px;">MANAGEMENT MESIN TETAS</h1>
            <h2 id="catName" style="font-weight:900; color:#1f3326; margin-top:10px; text-transform:uppercase;"></h2>
        </div>

        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:25px;">
            
            <div class="mesin-card" style="background:#fff; padding:30px; border-radius:28px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; gap:15px;">
                <h3 style="color:#666; font-weight:900; font-size:1rem;">MINGGU 1 (AWAL)</h3>
                <div id="val-MESIN_1" style="font-size:3.5rem; font-weight:1200; color:#6CA651; line-height:1;">0</div>
                <div style="font-weight:800; color:#aaa; font-size:0.8rem;">BUTIR TELUR</div>
                <button class="btn-move" data-from="MESIN_1" data-to="MESIN_2" style="margin-top:15px; width:100%; padding:18px; border-radius:15px; background:#6CA651; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase; transition:0.3s;">LANJUT MINGGU 2</button>
            </div>

            <div class="mesin-card" style="background:#fff; padding:30px; border-radius:28px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; gap:15px;">
                <h3 style="color:#666; font-weight:900; font-size:1rem;">MINGGU 2 (TENGAH)</h3>
                <div id="val-MESIN_2" style="font-size:3.5rem; font-weight:1200; color:#d68910; line-height:1;">0</div>
                <div style="font-weight:800; color:#aaa; font-size:0.8rem;">BUTIR TELUR</div>
                <button class="btn-move" data-from="MESIN_2" data-to="MESIN_3" style="margin-top:15px; width:100%; padding:18px; border-radius:15px; background:#d68910; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase; transition:0.3s;">LANJUT MINGGU 3</button>
            </div>

            <div class="mesin-card" style="background:#fff; padding:30px; border-radius:28px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; gap:15px;">
                <h3 style="color:#666; font-weight:900; font-size:1rem;">MINGGU 3 (AKHIR)</h3>
                <div id="val-MESIN_3" style="font-size:3.5rem; font-weight:1200; color:#1f3326; line-height:1;">0</div>
                <div style="font-weight:800; color:#aaa; font-size:0.8rem;">BUTIR TELUR</div>
                <button id="btnPanenDoc" style="margin-top:15px; width:100%; padding:18px; border-radius:15px; background:#1f3326; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase; transition:0.3s;">PANEN JADI DOC</button>
            </div>

        </div>

        <div style="text-align:center; color:#999; font-weight:700; font-size:0.85rem;">
            * Pastikan telur sudah berada di mesin selama tepat 7 hari sebelum dipindahkan ke fase berikutnya.
        </div>
      </section>
    `;
  },

  async afterRender() {
    const presenter = new TetasPresenter({
      onDataReady: (cat) => { 
        document.getElementById('catName').innerText = cat.nama; 
      },
      onUpdateUI: (data) => {
        // Reset tampilan ke 0 dulu
        document.getElementById('val-MESIN_1').innerText = "0";
        document.getElementById('val-MESIN_2').innerText = "0";
        document.getElementById('val-MESIN_3').innerText = "0";

        // Isi data sesuai status dari database
        data.forEach(item => {
            const el = document.getElementById(`val-${item.status}`);
            if (el) el.innerText = item.total.toLocaleString();
        });
      }
    });

    // Event Klik Pindah Mesin (1 -> 2 dan 2 -> 3)
    document.querySelectorAll('.btn-move').forEach(btn => {
        btn.onclick = async (e) => {
            const { from, to } = e.target.dataset;
            const currentVal = parseInt(document.getElementById(`val-${from}`).innerText);
            
            if (currentVal <= 0) return alert("Tidak ada telur untuk dipindahkan!");
            if (!confirm(`Pindahkan semua telur dari ${from} ke ${to}?`)) return;

            const res = await presenter.moveMesin({
                kategori_id: window.location.hash.split('-').slice(1).join('-'),
                from_status: from,
                to_status: to
            });

            if (res.status === 'success') {
                alert("Berhasil dipindahkan! 🚀");
                location.reload();
            }
        };
    });

    // Event Klik Panen DOC (Minggu 3 -> Selesai)
    document.getElementById('btnPanenDoc').onclick = async () => {
        const currentVal = parseInt(document.getElementById('val-MESIN_3').innerText);
        if (currentVal <= 0) return alert("Belum ada telur di Minggu 3!");

        const jmlHidup = prompt(`Total telur di Minggu 3: ${currentVal}\nBerapa yang HIDUP / MENETAS?`);
        if (jmlHidup === null) return;
        
        const hidup = parseInt(jmlHidup) || 0;
        if (hidup > currentVal) return alert("Jumlah hidup tidak boleh melebihi isi mesin!");

        const mati = currentVal - hidup;
        if (!confirm(`Konfirmasi Panen:\n- Hidup: ${hidup} Ekor\n- Gagal/Mati: ${mati} Butir\n\nLanjutkan?`)) return;

        const res = await presenter.moveMesin({
            kategori_id: window.location.hash.split('-').slice(1).join('-'),
            from_status: 'MESIN_3',
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