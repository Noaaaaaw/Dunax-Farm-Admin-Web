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
                    <div id="val-MESIN_${i}" style="font-size:2.8rem; font-weight:1200; color:${i === 1 ? '#6CA651' : i === 2 ? '#d68910' : '#e74c3c'}; margin: 5px 0;">0</div>
                    
                    <div id="status-container-MESIN_${i}" style="margin-bottom:15px;">
                        <div id="timer-MESIN_${i}" style="font-size:0.75rem; color:#888; font-weight:900; margin-bottom:5px; text-transform:uppercase;">IDLE</div>
                        <div style="width:100%; height:8px; background:#eee; border-radius:10px; overflow:hidden;">
                            <div id="progress-MESIN_${i}" style="width:0%; height:100%; background:#6CA651; transition: width 0.5s ease;"></div>
                        </div>
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
      </section>
    `;
  },

  async afterRender() {
    const presenter = new TetasPresenter({
      onDataReady: (cat) => { document.getElementById('catName').innerText = cat.nama; },
      onUpdateUI: (data) => {
        const colors = { MESIN_1: '#6CA651', MESIN_2: '#d68910', MESIN_3: '#e74c3c' };
        const totals = { MESIN_1: 0, MESIN_2: 0, MESIN_3: 0, SIAP_PANEN: 0 };
        
        // RESET UI KARTU
        [1,2,3].forEach(i => {
            const s = `MESIN_${i}`;
            const valEl = document.getElementById(`val-${s}`);
            if (valEl) valEl.innerText = "0";
            const tEl = document.getElementById(`timer-${s}`);
            if (tEl) {
                tEl.innerText = "IDLE";
                tEl.style.color = "#888";
            }
            const prog = document.getElementById(`progress-${s}`);
            if (prog) prog.style.width = "0%";
            const bs = document.getElementById(`btnStart-${s}`);
            if (bs) {
                bs.style.display = "block";
                bs.disabled = false;
                bs.innerText = "🚀 Simpan & Mulai";
                bs.style.background = "#4A90E2";
            }
            const bm = document.getElementById(`btnMove-${s}`);
            if (bm) {
                bm.disabled = true;
                bm.style.background = "#ccc";
            }
        });

        data.forEach(item => {
            if (totals[item.status] !== undefined) {
                totals[item.status] += parseInt(item.jumlah);

                if (item.status.startsWith('MESIN_')) {
                    const btnMove = document.getElementById(`btnMove-${item.status}`);
                    const btnStart = document.getElementById(`btnStart-${item.status}`);
                    const timerLabel = document.getElementById(`timer-${item.status}`);
                    const progress = document.getElementById(`progress-${item.status}`);
                    const valEl = document.getElementById(`val-${item.status}`);

                    if (valEl) valEl.innerText = item.jumlah;

                    // LOGIKA HITUNG HARI (KARENA TIPE DATA DATABASE SEKARANG DATE YYYY-MM-DD)
                    if (item.mulai_proses_tgl && item.mulai_proses_tgl !== 'BATAL' && item.mulai_proses_tgl !== 'null') {
                        
                        // Parse tanggal dari database (Force local time agar tidak geser sehari)
                        const parts = item.mulai_proses_tgl.split('-');
                        const tglMulai = new Date(parts[0], parts[1] - 1, parts[2]);
                        tglMulai.setHours(0,0,0,0);
                        
                        const hariIni = new Date();
                        hariIni.setHours(0,0,0,0);
                        
                        const selisihMs = hariIni.getTime() - tglMulai.getTime();
                        const umurHari = Math.floor(selisihMs / (1000 * 60 * 60 * 24));
                        const persen = Math.min(Math.round((umurHari / 21) * 100), 100);

                        if (umurHari < 21) {
                            // STATUS INKUBASI: MONITORING SISA HARI
                            if (timerLabel) {
                                timerLabel.innerHTML = `⏳ HARI KE-${umurHari} <span style="color:#aaa; font-weight:400;">(SISA ${21 - umurHari} HARI)</span>`;
                            }
                            if (progress) {
                                progress.style.width = `${persen}%`;
                                progress.style.background = "#f59e0b";
                            }
                            if (btnStart) {
                                btnStart.innerText = "SEDANG PROSES";
                                btnStart.disabled = true;
                                btnStart.style.background = "#aaa";
                            }
                        } else {
                            // SIAP PANEN
                            if (timerLabel) timerLabel.innerText = `✅ TARGET TERCAPAI!`;
                            if (progress) {
                                progress.style.width = `100%`;
                                progress.style.background = "#16a34a";
                            }
                            if (btnStart) btnStart.style.display = 'none';
                            if (btnMove) {
                                btnMove.disabled = false;
                                btnMove.style.background = colors[item.status];
                                btnMove.style.cursor = "pointer";
                            }
                        }
                    }
                }
            }
        });

        const siapPanenEl = document.getElementById('val-SIAP_PANEN');
        if (siapPanenEl) siapPanenEl.innerText = totals['SIAP_PANEN'];

        const tableBody = document.getElementById('umurTableBody');
        if (tableBody) {
            tableBody.innerHTML = data.map(item => {
                const tglStr = (item.mulai_proses_tgl && item.mulai_proses_tgl !== 'BATAL') ? item.mulai_proses_tgl : item.mesi_1_tgl;
                const tgl = new Date(tglStr);
                const diffMs = new Date().getTime() - tgl.getTime();
                const umur = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                return `<tr style="background:#f8f9fa;">
                    <td style="padding:15px; border:1px solid #eee;">${tgl.toLocaleDateString('id-ID')}</td>
                    <td style="padding:15px; border:1px solid #eee; font-weight:bold;">${item.status}</td>
                    <td style="padding:15px; border:1px solid #eee; color:#6CA651; font-weight:bold;">${item.jumlah} Butir</td>
                    <td style="padding:15px; border:1px solid #eee;">${umur >= 0 ? umur : 0} Hari</td>
                </tr>`;
            }).join('');
        }
      }
    });

    document.querySelectorAll('.btn-start-process').forEach(btn => {
      btn.onclick = async (e) => {
        const status = e.currentTarget.dataset.status;
        const total = parseInt(document.getElementById(`val-${status}`).innerText);
        if (total <= 0) return alert("Mesin kosong!");
        if (confirm(`Simpan dan mulai proses 21 hari?`)) {
          const res = await presenter.startProcess({
            kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
            status: status
          });
          if (res.status === 'success') location.reload();
        }
      };
    });

    await presenter.init();
  }
};

export default Tetas;