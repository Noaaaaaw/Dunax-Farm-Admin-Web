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
                    <div style="font-size:0.7rem; color:#aaa; font-weight:800;">BUTIR TELUR</div>
                </div>
                <button class="btn-move-trigger" data-from="MESIN_${i}" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:${i === 1 ? '#6CA651' : i === 2 ? '#d68910' : '#e74c3c'}; color:#fff; border:none; cursor:pointer; font-weight:900;">KONFIRMASI PANEN</button>
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
                        <th style="padding:15px; color:white; font-size:0.85rem; text-align: center; border: 2px solid #fff;">TANGGAL MASUK</th>
                        <th style="padding:15px; color:white; font-size:0.85rem; text-align: center; border: 2px solid #fff;">POSISI</th>
                        <th style="padding:15px; color:white; font-size:0.85rem; text-align: center; border: 2px solid #fff;">JUMLAH</th>
                        <th style="padding:15px; color:white; font-size:0.85rem; text-align: center; border: 2px solid #fff;">UMUR</th>
                    </tr>
                </thead>
                <tbody id="umurTableBody">
                    <tr><td colspan="4" style="text-align:center; padding:20px; color:#ccc;">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>

        <div id="modalSortir" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center;">
            <div style="background:white; padding:30px; border-radius:24px; width:90%; max-width:400px; text-align:center; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
                <div style="font-size: 3rem; margin-bottom: 10px;">🐣</div>
                <h2 style="color:#6CA651; font-family:'Luckiest Guy'; margin-bottom:5px; letter-spacing:1px;">SORTIR HASIL</h2>
                <p id="modalSourceText" style="font-weight:800; color:#aaa; text-transform:uppercase; font-size:0.8rem; margin-bottom:15px;"></p>
                
                <div style="background:#f8f9fa; padding:15px; border-radius:15px; border:1px dashed #ccc; margin-bottom:20px;">
                    <span style="color:#666; font-size:0.9rem;">Total Telur:</span>
                    <span id="modalTotalQty" style="font-weight:900; color:#333; font-size:1.2rem; margin-left:5px;">0</span>
                </div>

                <div style="text-align:left; gap:15px; display:flex; flex-direction:column;">
                    <div>
                        <label style="display:block; font-weight:800; margin-bottom:5px; color:#16a34a; font-size:0.8rem;">BERHASIL (HIDUP):</label>
                        <input type="number" id="inputBerhasil" style="width:100%; padding:15px; border-radius:12px; border:2px solid #eee; font-size:1.2rem; font-weight:900; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; font-weight:800; margin-bottom:5px; color:#e74c3c; font-size:0.8rem;">GAGAL (MATI/ZONK):</label>
                        <input type="number" id="inputGagal" style="width:100%; padding:15px; border-radius:12px; border:2px solid #eee; font-size:1.2rem; font-weight:900; outline:none;">
                    </div>
                </div>

                <div style="display:flex; gap:12px; margin-top:25px;">
                    <button id="btnCancelSortir" style="flex:1; padding:18px; border-radius:15px; background:#f3f4f6; border:none; cursor:pointer; font-weight:800; color:#6b7280;">BATAL</button>
                    <button id="btnConfirmSortir" style="flex:1; padding:18px; border-radius:15px; background:#6CA651; color:white; border:none; cursor:pointer; font-weight:800;">KONFIRMASI</button>
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
        statusList.forEach(status => {
            const el = document.getElementById(`val-${status}`);
            if (el) el.innerText = "0";
        });

        const totals = { MESIN_1: 0, MESIN_2: 0, MESIN_3: 0, SIAP_PANEN: 0 };
        data.forEach(item => {
            if (totals[item.status] !== undefined) {
                totals[item.status] += parseInt(item.jumlah);
            }
        });

        Object.keys(totals).forEach(status => {
            const el = document.getElementById(`val-${status}`);
            if (el) el.innerText = totals[status].toLocaleString();
        });

        const tableBody = document.getElementById('umurTableBody');
        tableBody.innerHTML = data.length === 0 
            ? `<tr><td colspan="4" style="text-align:center; padding:40px; color:#aaa; font-weight:700;">BELUM ADA DATA.</td></tr>`
            : data.map(item => {
                const tglMasuk = new Date(item.mesi_1_tgl);
                const diffDays = Math.floor(Math.abs(new Date() - tglMasuk) / (1000 * 60 * 60 * 24));
                return `
                    <tr style="background:#f8f9fa;">
                        <td style="padding:15px; font-weight:700; border: 3px solid #fff;">${tglMasuk.toLocaleDateString('id-ID')}</td>
                        <td style="padding:15px; font-weight:800; border: 3px solid #fff; text-transform:uppercase;">${item.status.replace('_', ' ')}</td>
                        <td style="padding:15px; font-weight:800; border: 3px solid #fff; color:#6CA651;">${item.jumlah} Butir</td>
                        <td style="padding:15px; font-weight:700; border: 3px solid #fff;">${diffDays} Hari</td>
                    </tr>
                `;
            }).join('');
      }
    });

    const modal = document.getElementById('modalSortir');
    const inputBerhasil = document.getElementById('inputBerhasil');
    const inputGagal = document.getElementById('inputGagal');
    let currentAction = { from: '', to: '', total: 0 };

    const syncInputs = (trigger) => {
        const total = currentAction.total;
        if (trigger === 'berhasil') {
            let val = parseInt(inputBerhasil.value) || 0;
            if (val > total) { val = total; inputBerhasil.value = total; }
            if (val < 0) { val = 0; inputBerhasil.value = 0; }
            inputGagal.value = total - val;
        } else {
            let val = parseInt(inputGagal.value) || 0;
            if (val > total) { val = total; inputGagal.value = total; }
            if (val < 0) { val = 0; inputGagal.value = 0; }
            inputBerhasil.value = total - val;
        }
    };

    inputBerhasil.addEventListener('input', () => syncInputs('berhasil'));
    inputGagal.addEventListener('input', () => syncInputs('gagal'));

    const openSortirModal = (from, to, total) => {
      currentAction = { from, to, total };
      document.getElementById('modalSourceText').innerText = `DARI: ${from.replace('_', ' ')}`;
      document.getElementById('modalTotalQty').innerText = `${total} BUTIR`;
      inputBerhasil.value = total; 
      inputGagal.value = 0;
      modal.style.display = 'flex';
    };

    document.querySelectorAll('.btn-move-trigger').forEach(btn => {
      btn.onclick = (e) => {
        const from = e.currentTarget.dataset.from;
        const total = parseInt(document.getElementById(`val-${from}`).innerText.replace(/,/g, ''));
        if (total <= 0) return alert("Mesin kosong!");
        openSortirModal(from, 'SIAP_PANEN', total);
      };
    });

    document.getElementById('btnFinalHatch').onclick = () => {
      const total = parseInt(document.getElementById('val-SIAP_PANEN').innerText.replace(/,/g, ''));
      if (total <= 0) return alert("Kotak Panen kosong!");
      openSortirModal('SIAP_PANEN', 'SELESAI', total);
    };

    document.getElementById('btnConfirmSortir').onclick = async () => {
      const berhasil = parseInt(inputBerhasil.value) || 0;
      const gagal = parseInt(inputGagal.value) || 0;

      if (berhasil + gagal !== currentAction.total) {
        return alert(`Jumlah tidak sinkron! Total (${berhasil+gagal}) harus sesuai dengan total telur (${currentAction.total}).`);
      }

      // 🔥 PASTIKAN VARIABEL INI TERKIRIM SEMUA! 🔥
      const res = await presenter.moveMesin({
        kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
        from_status: currentAction.from,
        to_status: currentAction.to,
        jumlah_berhasil: berhasil,
        jumlah_gagal: gagal // <--- INI YANG TADI KAMU HAPUS!
      });

      if (res.status === 'success') {
        modal.style.display = 'none';
        location.reload();
      }
    };

    document.getElementById('btnCancelSortir').onclick = () => { modal.style.display = 'none'; };

    document.querySelectorAll('.btn-cheat').forEach(btn => {
        btn.onclick = async (e) => {
            const { from } = e.currentTarget.dataset;
            if (!confirm(`⚡ CHEAT: Pindahkan paksa SEMUA telur dari ${from} ke Kotak Panen?`)) return;
            const res = await presenter.moveMesin({
                kategori_id: window.location.hash.split('-').slice(1).join('-').toLowerCase(),
                from_status: from, to_status: 'SIAP_PANEN',
                jumlah_berhasil: parseInt(document.getElementById(`val-${from}`).innerText.replace(/,/g, '')),
                jumlah_gagal: 0 // <--- INI JUGA WAJIB ADA
            });
            if (res.status === 'success') location.reload();
        };
    });

    await presenter.init();
  }
};

export default Tetas;