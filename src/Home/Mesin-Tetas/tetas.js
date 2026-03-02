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
                <button id="btn-cheat-MESIN_${i}" class="btn-cheat" data-from="MESIN_${i}" title="Cheat: Langsung Panen" style="position:absolute; top:10px; right:10px; background:#fef3c7; border:1px solid #f59e0b; border-radius:50%; width:35px; height:35px; cursor:pointer; font-size:1.2rem; display:none; align-items:center; justify-content:center; transition:0.2s;">⚡</button>
                
                <div>
                    <h3 style="color:#666; font-size:0.9rem; font-weight:900;">MESIN ${i}</h3>
                    <div id="val-MESIN_${i}" style="font-size:2.8rem; font-weight:1200; color:${i === 1 ? '#6CA651' : i === 2 ? '#d68910' : '#e74c3c'}; margin: 10px 0;">0</div>
                    <div style="font-size:0.7rem; color:#aaa; font-weight:800;">BUTIR TELUR</div>
                </div>
                
                <div id="action-container-MESIN_${i}" style="margin-top:20px;">
                    <button disabled style="width:100%; padding:15px; border-radius:12px; background:#eee; color:#ccc; border:none; font-weight:900;">MEMUAT...</button>
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

        <div class="table-container" style="background:white; border-radius:20px; padding:25px; border:1px solid #eee;">
            <h3 style="margin-bottom:20px; color:#41644A; font-weight:900; text-align: center; text-transform:uppercase;">Monitoring Antrian Inkubasi</h3>
            <table style="width:100%; border-collapse:collapse; text-align:center;">
                <thead>
                    <tr style="background:#6CA651;">
                        <th style="padding:15px; color:white; border: 2px solid #fff;">TGL MASUK</th>
                        <th style="padding:15px; color:white; border: 2px solid #fff;">STATUS</th>
                        <th style="padding:15px; color:white; border: 2px solid #fff;">JUMLAH</th>
                        <th style="padding:15px; color:white; border: 2px solid #fff;">UMUR</th>
                    </tr>
                </thead>
                <tbody id="umurTableBody">
                    <tr><td colspan="4" style="padding:20px; color:#ccc;">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>

        <div id="modalSortir" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center;">
            <div style="background:white; padding:30px; border-radius:24px; width:90%; max-width:400px; text-align:center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🐣</div>
                <h2 style="color:#6CA651; font-family:'Luckiest Guy';">SORTIR HASIL</h2>
                <p id="modalSourceText" style="font-weight:800; color:#aaa; font-size:0.8rem;"></p>
                <div style="background:#f8f9fa; padding:15px; border-radius:15px; margin-bottom:20px;">
                    <span id="modalTotalQty" style="font-weight:900; font-size:1.2rem;">0</span>
                </div>
                <div style="text-align:left; gap:15px; display:flex; flex-direction:column;">
                    <label style="font-weight:bold; font-size:0.8rem;">BERHASIL (HIDUP):</label>
                    <input type="number" id="inputBerhasil" style="width:100%; padding:15px; border-radius:12px; border:2px solid #eee; font-weight:900;">
                    <label style="font-weight:bold; font-size:0.8rem;">GAGAL (MATI):</label>
                    <input type="number" id="inputGagal" style="width:100%; padding:15px; border-radius:12px; border:2px solid #eee; font-weight:900;">
                </div>
                <div style="display:flex; gap:12px; margin-top:25px;">
                    <button id="btnCancelSortir" style="flex:1; padding:15px; border-radius:12px; background:#eee; border:none; font-weight:800;">BATAL</button>
                    <button id="btnConfirmSortir" style="flex:1; padding:15px; border-radius:12px; background:#6CA651; color:white; border:none; font-weight:800;">KONFIRMASI</button>
                </div>
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
        const totals = { MESIN_1: 0, MESIN_2: 0, MESIN_3: 0, SIAP_PANEN: 0 };
        const mesinMap = {};

        data.forEach(item => {
          if (totals[item.status] !== undefined) totals[item.status] += parseInt(item.jumlah);
          mesinMap[item.status] = item;
        });

        statusList.forEach(s => {
          const valEl = document.getElementById(`val-${s}`);
          if (valEl) valEl.innerText = totals[s].toLocaleString();

          const container = document.getElementById(`action-container-${s}`);
          const cheatBtn = document.getElementById(`btn-cheat-${s}`);
          
          if (container) {
            const item = mesinMap[s];
            
            // Sembunyikan petir secara default
            if(cheatBtn) cheatBtn.style.display = 'none';

            if (!item || parseInt(item.jumlah) === 0) {
              container.innerHTML = `<button disabled style="width:100%; padding:15px; border-radius:12px; background:#f3f4f6; color:#94a3b8; border:none; font-weight:900;">MESIN KOSONG</button>`;
            } else if (!item.mulai_inkubasi_tgl) {
              container.innerHTML = `<button id="btn-lock-${s}" style="width:100%; padding:15px; border-radius:12px; background:#3b82f6; color:#fff; border:none; cursor:pointer; font-weight:900;">🔒 MULAI INKUBASI</button>`;
              document.getElementById(`btn-lock-${s}`).onclick = () => handleLock(item.id, s);
            } else {
              const umur = Math.floor((new Date() - new Date(item.mulai_inkubasi_tgl)) / (1000 * 60 * 60 * 24));
              
              if (umur < 21) {
                // TAMPILKAN LOGO PETIR JIKA LAGI PROSES
                if(cheatBtn) {
                    cheatBtn.style.display = 'flex';
                    cheatBtn.onclick = () => {
                        if(confirm("⚡ Gunakan Cheat? Lewati masa inkubasi dan langsung sortir sekarang?")) {
                            openSortirModal(s, 'SIAP_PANEN', item.jumlah);
                        }
                    };
                }
                container.innerHTML = `<button disabled style="width:100%; padding:15px; border-radius:12px; background:#fbbf24; color:#fff; border:none; font-weight:900;">⏳ PROSES (${21 - umur} HARI)</button>`;
              } else {
                container.innerHTML = `<button id="btn-move-${s}" style="width:100%; padding:15px; border-radius:12px; background:#6CA651; color:#fff; border:none; cursor:pointer; font-weight:900;">🐣 KONFIRMASI PANEN</button>`;
                document.getElementById(`btn-move-${s}`).onclick = () => openSortirModal(s, 'SIAP_PANEN', item.jumlah);
              }
            }
          }
        });

        // Update Tabel Antrian
        document.getElementById('umurTableBody').innerHTML = data.length === 0 
          ? `<tr><td colspan="4" style="padding:40px; color:#aaa;">BELUM ADA DATA.</td></tr>`
          : data.map(item => {
              const umur = item.mulai_inkubasi_tgl ? `${Math.floor((new Date() - new Date(item.mulai_inkubasi_tgl))/(1000*60*60*24))} Hari` : 'Waiting Lock';
              return `<tr style="background:#f8f9fa;">
                <td style="padding:15px; font-weight:700; border: 2px solid #fff;">${new Date(item.mesi_1_tgl).toLocaleDateString('id-ID')}</td>
                <td style="padding:15px; font-weight:800; border: 2px solid #fff;">${item.mulai_inkubasi_tgl ? '🔒 LOCKED' : '🔓 OPEN'}</td>
                <td style="padding:15px; font-weight:800; border: 2px solid #fff; color:#6CA651;">${item.jumlah} Butir</td>
                <td style="padding:15px; font-weight:700; border: 2px solid #fff;">${umur}</td>
              </tr>`;
          }).join('');
      }
    });

    const handleLock = async (id, name) => {
      if (!confirm(`Mulai inkubasi ${name.replace('_',' ')}? Mesin akan dikunci selama 21 hari.`)) return;
      const res = await presenter.lockMesin(id);
      if (res.status === 'success') location.reload();
    };

    const modal = document.getElementById('modalSortir');
    const inputBerhasil = document.getElementById('inputBerhasil');
    const inputGagal = document.getElementById('inputGagal');
    let currentAction = { from: '', to: '', total: 0 };

    const openSortirModal = (from, to, total) => {
      currentAction = { from, to, total };
      document.getElementById('modalSourceText').innerText = `DARI: ${from.replace('_', ' ')}`;
      document.getElementById('modalTotalQty').innerText = `${total} BUTIR`;
      inputBerhasil.value = total; 
      inputGagal.value = 0;
      modal.style.display = 'flex';
    };

    document.getElementById('btnConfirmSortir').onclick = async () => {
      const b = parseInt(inputBerhasil.value) || 0;
      const g = parseInt(inputGagal.value) || 0;
      if (b + g !== currentAction.total) return alert("Jumlah total tidak sinkron!");
      
      const res = await presenter.moveMesin({
        kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
        from_status: currentAction.from, to_status: currentAction.to,
        jumlah_berhasil: b, jumlah_gagal: g
      });
      if (res.status === 'success') location.reload();
    };

    document.getElementById('btnCancelSortir').onclick = () => { modal.style.display = 'none'; };
    
    document.getElementById('btnFinalHatch').onclick = () => {
      const total = parseInt(document.getElementById('val-SIAP_PANEN').innerText.replace(/,/g, ''));
      if (total > 0) openSortirModal('SIAP_PANEN', 'SELESAI', total);
    };

    await presenter.init();
  }
};

export default Tetas;