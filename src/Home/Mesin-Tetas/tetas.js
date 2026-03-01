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
            ${[1, 2, 3].map(i => `
            <div class="mesin-card" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
                <button class="btn-cheat" data-from="MESIN_${i}" title="Cheat: Langsung Panen" style="position:absolute; top:10px; right:10px; background:#fef3c7; border:1px solid #f59e0b; border-radius:50%; width:30px; height:30px; cursor:pointer; font-size:1rem;">⚡</button>
                <div>
                    <h3 style="color:#666; font-size:0.9rem; font-weight:900;">MESIN ${i}</h3>
                    <div id="val-MESIN_${i}" style="font-size:2.8rem; font-weight:1200; color:${i === 1 ? '#6CA651' : i === 2 ? '#d68910' : '#e74c3c'}; margin: 10px 0;">0</div>
                    
                    <div id="timer-MESIN_${i}" style="font-size:0.75rem; color:#888; font-weight:900; margin-bottom:15px; background:#f5f5f5; padding:8px; border-radius:10px; min-height:35px; display:flex; align-items:center; justify-content:center; text-transform:uppercase;">
                        IDLE
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <button class="btn-start-process" id="btnStart-MESIN_${i}" data-status="MESIN_${i}" style="width:100%; padding:12px; border-radius:10px; background:#4A90E2; color:#fff; border:none; cursor:pointer; font-weight:800; font-size:0.8rem; text-transform:uppercase;">🚀 Simpan & Mulai</button>
                    <button class="btn-move-trigger" id="btnMove-MESIN_${i}" data-from="MESIN_${i}" style="width:100%; padding:15px; border-radius:12px; background:#ccc; color:#fff; border:none; cursor:not-allowed; font-weight:900; text-transform:uppercase;" disabled>Konfirmasi Panen</button>
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

        <div class="table-container" style="background:white; border-radius:20px; padding:25px; border:1px solid #eee;">
            <h3 style="margin-bottom:20px; color:#41644A; font-weight:900; text-align: center; text-transform:uppercase;">Monitoring Antrian Inkubasi</h3>
            <table style="width:100%; border-collapse:collapse; text-align:center;">
                <thead>
                    <tr style="background:#6CA651; color:white;">
                        <th style="padding:15px; border: 1px solid #fff;">TANGGAL MULAI</th>
                        <th style="padding:15px; border: 1px solid #fff;">MESIN</th>
                        <th style="padding:15px; border: 1px solid #fff;">JUMLAH</th>
                        <th style="padding:15px; border: 1px solid #fff;">UMUR</th>
                    </tr>
                </thead>
                <tbody id="umurTableBody"></tbody>
            </table>
        </div>

        <div id="modalSortir" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center;">
            <div style="background:white; padding:30px; border-radius:24px; width:90%; max-width:400px; text-align:center;">
                <h2 style="color:#6CA651; font-family:'Luckiest Guy';">SORTIR HASIL</h2>
                <div style="margin: 20px 0; text-align:left;">
                    <label style="font-weight:bold; color:#16a34a;">BERHASIL (HIDUP):</label>
                    <input type="number" id="inputBerhasil" style="width:100%; padding:12px; margin:10px 0; border:2px solid #eee; border-radius:8px;">
                    <label style="font-weight:bold; color:#e74c3c;">GAGAL (MATI/ZONK):</label>
                    <input type="number" id="inputGagal" style="width:100%; padding:12px; margin:10px 0; border:2px solid #eee; border-radius:8px;">
                </div>
                <button id="btnConfirmSortir" style="width:100%; padding:15px; background:#6CA651; color:white; border:none; border-radius:10px; font-weight:800;">KONFIRMASI</button>
                <button id="btnCancelSortir" style="margin-top:15px; background:none; border:none; color:#aaa; font-weight:bold; cursor:pointer;">BATAL</button>
            </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const presenter = new TetasPresenter({
      onDataReady: (cat) => { document.getElementById('catName').innerText = cat.nama; },
      onUpdateUI: (data) => {
        const colors = { MESIN_1: '#6CA651', MESIN_2: '#d68910', MESIN_3: '#e74c3c' };
        const totals = { MESIN_1: 0, MESIN_2: 0, MESIN_3: 0, SIAP_PANEN: 0 };
        
        // Helper Sakti buat benerin format tanggal Supabase biar dibaca browser sebagai objek Date
        const fixDate = (dateStr) => {
            if (!dateStr || dateStr === 'BATAL' || dateStr === 'null') return null;
            // PostgreSQL pake spasi, kita ganti 'T' biar jadi standar ISO
            return new Date(dateStr.replace(' ', 'T'));
        };

        // Reset UI Standar
        [1,2,3].forEach(i => {
            const s = `MESIN_${i}`;
            document.getElementById(`val-${s}`).innerText = "0";
            const tEl = document.getElementById(`timer-${s}`);
            tEl.innerText = "IDLE";
            tEl.style.background = "#f5f5f5";
            tEl.style.color = "#888";
            const bs = document.getElementById(`btnStart-${s}`);
            bs.style.display = "block";
            bs.disabled = false;
            bs.style.background = "#4A90E2";
            bs.innerText = "🚀 Simpan & Mulai";
            const bm = document.getElementById(`btnMove-${s}`);
            bm.disabled = true;
            bm.style.background = "#ccc";
        });

        data.forEach(item => {
          if (totals[item.status] !== undefined) {
            totals[item.status] += parseInt(item.jumlah);

            if (item.status.startsWith('MESIN_')) {
              const btnMove = document.getElementById(`btnMove-${item.status}`);
              const btnStart = document.getElementById(`btnStart-${item.status}`);
              const timerLabel = document.getElementById(`timer-${item.status}`);

              // PAKAI FIXER DISINI
              const tglMulai = fixDate(item.mulai_proses_tgl);

              if (tglMulai && !isNaN(tglMulai.getTime())) {
                const sekarang = new Date();
                const diffMs = sekarang - tglMulai;
                const umurHari = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                if (umurHari < 21) {
                  // STATUS INKUBASI: TAMPILKAN 0 / 21 HARI
                  timerLabel.innerText = `⏳ ${umurHari} / 21 HARI`;
                  timerLabel.style.background = "#fff8e1";
                  timerLabel.style.color = "#f59e0b";
                  
                  btnStart.innerText = "SEDANG INKUBASI";
                  btnStart.disabled = true;
                  btnStart.style.background = "#aaa";
                  btnMove.disabled = true;
                } else {
                  // SIAP PANEN
                  timerLabel.innerText = `✅ SIAP PANEN!`;
                  timerLabel.style.background = "#f0fdf4";
                  timerLabel.style.color = "#16a34a";
                  
                  btnStart.style.display = 'none';
                  btnMove.disabled = false;
                  btnMove.style.background = colors[item.status];
                  btnMove.style.cursor = "pointer";
                }
              }
            }
          }
        });

        // Update Kartu & Tabel
        document.getElementById('val-SIAP_PANEN').innerText = totals['SIAP_PANEN'];
        [1,2,3].forEach(i => document.getElementById(`val-MESIN_${i}`).innerText = totals[`MESIN_${i}`].toLocaleString());

        const tableBody = document.getElementById('umurTableBody');
        tableBody.innerHTML = data.map(item => {
            const tgl = fixDate(item.mulai_proses_tgl) || fixDate(item.mesi_1_tgl);
            const umur = tgl ? Math.floor((new Date() - tgl) / (1000 * 60 * 60 * 24)) : 0;
            return `<tr style="background:#f8f9fa;">
                <td style="padding:15px; border:1px solid #eee;">${tgl ? tgl.toLocaleDateString('id-ID') : '-'}</td>
                <td style="padding:15px; border:1px solid #eee; font-weight:bold;">${item.status}</td>
                <td style="padding:15px; border:1px solid #eee; color:#6CA651; font-weight:bold;">${item.jumlah} Butir</td>
                <td style="padding:15px; border:1px solid #eee;">${umur} Hari</td>
            </tr>`;
        }).join('');
      }
    });

    // EVENT HANDLERS
    document.querySelectorAll('.btn-start-process').forEach(btn => {
      btn.onclick = async (e) => {
        const status = e.currentTarget.dataset.status;
        const total = parseInt(document.getElementById(`val-${status}`).innerText);
        if (total <= 0) return alert("Mesin kosong!");
        if (confirm(`Konfirmasi: Mulai proses inkubasi 21 hari untuk ${status}?`)) {
          const res = await presenter.startProcess({
            kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
            status: status
          });
          if (res.status === 'success') {
              alert("Proses Berhasil Dimulai! 🚀");
              location.reload(); 
          }
        }
      };
    });

    document.querySelectorAll('.btn-move-trigger').forEach(btn => {
      btn.onclick = (e) => {
        const from = e.currentTarget.dataset.from;
        const total = parseInt(document.getElementById(`val-${from}`).innerText);
        currentAction = { from, to: 'SIAP_PANEN', total };
        document.getElementById('inputBerhasil').value = total;
        document.getElementById('inputGagal').value = 0;
        document.getElementById('modalSortir').style.display = 'flex';
      };
    });

    document.getElementById('btnConfirmSortir').onclick = async () => {
      const b = parseInt(document.getElementById('inputBerhasil').value) || 0;
      const g = parseInt(document.getElementById('inputGagal').value) || 0;
      if (b + g !== currentAction.total) return alert("Jumlah sortir tidak sinkron!");
      const res = await presenter.moveMesin({
        kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
        from_status: currentAction.from,
        to_status: currentAction.to,
        jumlah_berhasil: b,
        jumlah_gagal: g
      });
      if (res.status === 'success') location.reload();
    };

    document.getElementById('btnCancelSortir').onclick = () => { document.getElementById('modalSortir').style.display = 'none'; };

    let currentAction = {};
    await presenter.init();
  }
};

export default Tetas;