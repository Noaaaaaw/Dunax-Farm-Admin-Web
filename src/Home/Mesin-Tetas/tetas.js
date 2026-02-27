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
                    <button class="btn-start" data-mesin="${id}" style="width:100%; padding:12px; border-radius:12px; background:#4b7bec; color:#fff; border:none; cursor:pointer; font-weight:900;">SIMPAN & MULAI</button>
                    <button class="btn-move" id="btn-panen-${id}" data-from="${id}" disabled style="width:100%; padding:12px; border-radius:12px; background:#ccc; color:#fff; border:none; cursor:not-allowed; font-weight:900;">KONFIRMASI PANEN</button>
                </div>
            </div>
            `).join('')}

            <div class="mesin-card" style="background:#f0fdf4; padding:20px; border-radius:20px; text-align:center; border:2px solid #16a34a; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="color:#16a34a; font-size:0.9rem; font-weight:900;">KOTAK PANEN (DOC)</h3>
                    <div id="val-SIAP_PANEN" style="font-size:2.8rem; font-weight:1200; color:#1f3326; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#16a34a; font-weight:800;">TOTAL SIAP PINDAH</div>
                </div>
                <button id="btnFinalHatch" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#16a34a; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Kirim ke Kelola DOC 🚀</button>
            </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const categoryId = window.location.hash.split('-').slice(1).join('-').toLowerCase();

    const presenter = new TetasPresenter({
      onDataReady: (cat) => { 
        document.getElementById('catName').innerText = cat.nama; 
      },
      onUpdateUI: (data) => {
        // Reset UI
        ['MESIN_1', 'MESIN_2', 'MESIN_3', 'SIAP_PANEN'].forEach(id => {
            const el = document.getElementById(`val-${id}`);
            if(el) el.innerText = "0";
        });

        data.forEach(item => {
            const valEl = document.getElementById(`val-${item.status}`);
            const daysEl = document.getElementById(`days-${item.status}`);
            const btnPanen = document.getElementById(`btn-panen-${item.status}`);
            const btnStart = document.querySelector(`.btn-start[data-mesin="${item.status}"]`);

            if (valEl) {
                // UPDATE: Tampilkan angka telur dari database (misal: 110)
                valEl.innerText = item.jumlah.toLocaleString();
                
                if (item.status.includes('MESIN')) {
                    // Cek Tanggal Masuk (untuk hitung mundur 21 hari)
                    if (item.mesi_1_tgl) {
                        const tglMasuk = new Date(item.mesi_1_tgl);
                        const diffDays = Math.floor(Math.abs(new Date() - tglMasuk) / (1000 * 60 * 60 * 24));
                        
                        if (daysEl) daysEl.innerText = `${diffDays} / 21 HARI`;

                        // Jika sudah 21 hari atau lebih
                        if (diffDays >= 21) {
                            if (btnPanen) {
                                btnPanen.disabled = false;
                                btnPanen.style.background = "#6CA651";
                                btnPanen.style.cursor = "pointer";
                            }
                            if (btnStart) btnStart.style.display = "none"; // Sembunyikan tombol simpan
                        } else {
                            // Jika sedang inkubasi (belum 21 hari)
                            if (btnStart) btnStart.innerText = "SEDANG PROSES";
                            if (btnStart) btnStart.disabled = true;
                            if (btnStart) btnStart.style.background = "#aaa";
                        }
                    } else {
                        // Jika mesi_1_tgl masih null (Berarti telur baru hasil sortiran)
                        if (daysEl) daysEl.innerText = "SIAP DIMULAI";
                    }
                }
            }
        });
      }
    });

    // ACTION: SIMPAN (OTOMATIS AMBIL ANGKA DARI KARTU)
    document.querySelectorAll('.btn-start').forEach(btn => {
        btn.onclick = async (e) => {
            const mesinId = e.target.dataset.mesin;
            const displayVal = document.getElementById(`val-${mesinId}`).innerText.replace(/,/g, '');
            const jumlahOtomatis = parseInt(displayVal) || 0;

            if (jumlahOtomatis <= 0) {
                return alert("Gagal: Tidak ada stok telur untuk diproses!");
            }

            if (confirm(`Gunakan ${jumlahOtomatis} butir telur untuk memulai inkubasi 21 hari di ${mesinId.replace('_', ' ')}?`)) {
                const res = await presenter.startIncubation({
                    kategori_id: categoryId,
                    status: mesinId,
                    jumlah: jumlahOtomatis
                });
                
                if (res.status === 'success') {
                    alert("Berhasil! Hitungan 21 hari telah dimulai.");
                    location.reload();
                }
            }
        };
    });

    // ACTION: KONFIRMASI PANEN (INPUT HASIL TETAS)
    document.querySelectorAll('.btn-move').forEach(btn => {
        btn.onclick = async (e) => {
            const { from } = e.currentTarget.dataset;
            const totalAwal = parseInt(document.getElementById(`val-${from}`).innerText.replace(/,/g, ''));
            
            const netas = prompt(`HASIL PANEN ${from.replace('_', ' ')}\nTotal Telur: ${totalAwal}\nBerapa yang BERHASIL MENETAS?`, totalAwal);
            
            if (netas === null || netas === "") return; 
            const jmlNetas = parseInt(netas);

            if (isNaN(jmlNetas) || jmlNetas < 0 || jmlNetas > totalAwal) {
                return alert("Input jumlah tidak valid!");
            }

            const res = await presenter.moveMesin({
                kategori_id: categoryId,
                from_status: from,
                to_status: 'SIAP_PANEN',
                jumlah_berhasil: jmlNetas 
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
                btnPanen.style.background = "#F59E0B";
                btnPanen.style.cursor = "pointer";
                alert(`⚡ CHEAT: ${from} siap panen sekarang!`);
            }
        };
    });

    // ACTION: KIRIM KE DOC
    document.getElementById('btnFinalHatch').onclick = async () => {
        const val = parseInt(document.getElementById('val-SIAP_PANEN').innerText.replace(/,/g, ''));
        if (val <= 0) return alert("Kotak Panen kosong!");
        if (confirm(`Kirim ${val} DOC ke Kelola DOC?`)) {
            const res = await presenter.moveMesin({
                kategori_id: categoryId,
                from_status: 'SIAP_PANEN',
                to_status: 'SELESAI'
            });
            if (res.status === 'success') location.reload();
        }
    };

    await presenter.init();
  }
};

export default Tetas;