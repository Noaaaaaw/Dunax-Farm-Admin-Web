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
                    <div id="timer-MESIN_${i}" style="font-size:0.75rem; color:#f59e0b; font-weight:800; margin-bottom:10px; background:#fff8e1; padding:5px; border-radius:8px;">STANDBY</div>
                </div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <button class="btn-start-process" id="btnStart-MESIN_${i}" data-status="MESIN_${i}" style="width:100%; padding:10px; border-radius:10px; background:#1f3326; color:#fff; border:none; cursor:pointer; font-weight:700; font-size:0.8rem;">🚀 MULAI PROSES</button>
                    <button class="btn-move-trigger" id="btnMove-MESIN_${i}" data-from="MESIN_${i}" style="width:100%; padding:15px; border-radius:12px; background:#ccc; color:#fff; border:none; cursor:not-allowed; font-weight:900;" disabled>KONFIRMASI PANEN</button>
                </div>
            </div>
            `).join('')}

            <div class="mesin-card" style="background:#f0fdf4; padding:20px; border-radius:20px; text-align:center; border:2px solid #16a34a; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="color:#16a34a; font-size:0.9rem; font-weight:900;">KOTAK PANEN</h3>
                    <div id="val-SIAP_PANEN" style="font-size:2.8rem; font-weight:1200; color:#1f3326; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#16a34a; font-weight:800;">TOTAL SIAP PINDAH</div>
                </div>
                <button id="btnFinalHatch" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#16a34a; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Kirim ke Kelola DOC 🚀</button>
            </div>
        </div>

        <div class="table-container" style="background:white; border-radius:20px; padding:25px; border:1px solid #eee; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <h3 style="margin-bottom:20px; color:#41644A; font-weight:900; text-align: center; text-transform:uppercase;">Monitoring Antrian</h3>
            <table style="width:100%; border-collapse:collapse; text-align:center;">
                <thead>
                    <tr style="background:#6CA651;">
                        <th style="padding:15px; color:white; font-size:0.85rem; border: 2px solid #fff;">TANGGAL MASUK</th>
                        <th style="padding:15px; color:white; font-size:0.85rem; border: 2px solid #fff;">POSISI</th>
                        <th style="padding:15px; color:white; font-size:0.85rem; border: 2px solid #fff;">JUMLAH</th>
                        <th style="padding:15px; color:white; font-size:0.85rem; border: 2px solid #fff;">UMUR</th>
                    </tr>
                </thead>
                <tbody id="umurTableBody"></tbody>
            </table>
        </div>

        <div id="modalSortir" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center;">
            <div style="background:white; padding:30px; border-radius:24px; width:90%; max-width:400px; text-align:center;">
                <h2 style="color:#6CA651; font-family:'Luckiest Guy';">SORTIR HASIL</h2>
                <p id="modalSourceText" style="font-weight:800; color:#aaa;"></p>
                <div style="margin: 20px 0; text-align:left;">
                    <label>BERHASIL (HIDUP):</label>
                    <input type="number" id="inputBerhasil" style="width:100%; padding:10px; margin-bottom:15px;">
                    <label>GAGAL (MATI/ZONK):</label>
                    <input type="number" id="inputGagal" style="width:100%; padding:10px;">
                </div>
                <button id="btnConfirmSortir" style="width:100%; padding:15px; background:#6CA651; color:white; border:none; border-radius:10px; font-weight:800;">KONFIRMASI</button>
                <button id="btnCancelSortir" style="margin-top:10px; background:none; border:none; color:red; cursor:pointer;">Batal</button>
            </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const presenter = new TetasPresenter({
      onDataReady: (cat) => { document.getElementById('catName').innerText = cat.nama; },
      onUpdateUI: (data) => {
        const statusList = ['MESIN_1', 'MESIN_2', 'MESIN_3', 'SIAP_PANEN'];
        const colors = { MESIN_1: '#6CA651', MESIN_2: '#d68910', MESIN_3: '#e74c3c' };
        
        // Reset 
        statusList.forEach(s => {
          const el = document.getElementById(`val-${s}`);
          if (el) el.innerText = "0";
          const timer = document.getElementById(`timer-${s}`);
          if (timer) { timer.innerText = "STANDBY"; timer.style.color = "#aaa"; }
          const btnS = document.getElementById(`btnStart-${s}`);
          if (btnS) btnS.style.display = "block";
          const btnM = document.getElementById(`btnMove-${s}`);
          if (btnM) { btnM.disabled = true; btnM.style.background = "#ccc"; }
        });

        const totals = { MESIN_1: 0, MESIN_2: 0, MESIN_3: 0, SIAP_PANEN: 0 };
        
        data.forEach(item => {
          if (totals[item.status] !== undefined) {
            totals[item.status] += parseInt(item.jumlah);

            if (item.status.startsWith('MESIN_')) {
              const btnMove = document.getElementById(`btnMove-${item.status}`);
              const btnStart = document.getElementById(`btnStart-${item.status}`);
              const timerLabel = document.getElementById(`timer-${item.status}`);

              if (item.mulai_proses_tgl) {
                const tglMulai = new Date(item.mulai_proses_tgl);
                const tglPanen = new Date(tglMulai.getTime() + (21 * 24 * 60 * 60 * 1000));
                const sisaHari = Math.ceil((tglPanen - new Date()) / (1000 * 60 * 60 * 24));

                btnStart.style.display = 'none';
                
                if (sisaHari > 0) {
                  timerLabel.innerText = `⏳ SISA ${sisaHari} HARI`;
                  timerLabel.style.color = "#f59e0b";
                  btnMove.disabled = true;
                  btnMove.style.background = "#ccc";
                  btnMove.style.cursor = "not-allowed";
                } else {
                  timerLabel.innerText = `✅ SIAP PANEN!`;
                  timerLabel.style.color = "#16a34a";
                  btnMove.disabled = false;
                  btnMove.style.background = colors[item.status];
                  btnMove.style.cursor = "pointer";
                }
              }
            }
          }
        });

        Object.keys(totals).forEach(s => {
          const el = document.getElementById(`val-${s}`);
          if (el) el.innerText = totals[s].toLocaleString();
        });

        const tableBody = document.getElementById('umurTableBody');
        tableBody.innerHTML = data.map(item => {
            const tglMasuk = new Date(item.mesi_1_tgl);
            const diffDays = Math.floor(Math.abs(new Date() - tglMasuk) / (1000 * 60 * 60 * 24));
            return `<tr><td style="padding:10px;">${tglMasuk.toLocaleDateString()}</td><td>${item.status}</td><td>${item.jumlah}</td><td>${diffDays} Hari</td></tr>`;
        }).join('');
      }
    });

    // Event Listener MULAI PROSES
    document.querySelectorAll('.btn-start-process').forEach(btn => {
      btn.onclick = async (e) => {
        const status = e.currentTarget.dataset.status;
        const total = parseInt(document.getElementById(`val-${status}`).innerText);
        if (total <= 0) return alert("Kosong!");
        if (confirm(`Mulai proses 21 hari?`)) {
          const res = await presenter.startProcess({
            kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
            status: status
          });
          if (res.status === 'success') location.reload();
        }
      };
    });

    // Event Listener KONFIRMASI PANEN
    document.querySelectorAll('.btn-move-trigger').forEach(btn => {
      btn.onclick = (e) => {
        const from = e.currentTarget.dataset.from;
        const total = parseInt(document.getElementById(`val-${from}`).innerText);
        // Buka Modal
        currentAction = { from, to: 'SIAP_PANEN', total };
        document.getElementById('modalSourceText').innerText = `DARI: ${from}`;
        document.getElementById('inputBerhasil').value = total;
        document.getElementById('inputGagal').value = 0;
        document.getElementById('modalSortir').style.display = 'flex';
      };
    });

    document.getElementById('btnConfirmSortir').onclick = async () => {
      const b = parseInt(document.getElementById('inputBerhasil').value) || 0;
      const g = parseInt(document.getElementById('inputGagal').value) || 0;
      
      const res = await presenter.moveMesin({
        kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
        from_status: currentAction.from,
        to_status: currentAction.to,
        jumlah_berhasil: b,
        jumlah_gagal: g
      });

      if (res.status === 'success') {
        // Matikan tombol agar tidak dipencet lagi sebelum reload
        document.getElementById(`btnMove-${currentAction.from}`).disabled = true;
        location.reload();
      }
    };

    document.getElementById('btnCancelSortir').onclick = () => { document.getElementById('modalSortir').style.display = 'none'; };
    
    let currentAction = {};
    await presenter.init();
  }
};

export default Tetas;