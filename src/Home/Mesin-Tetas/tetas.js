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
            <div class="mesin-card" id="card-${id}" style="background:#fff; padding:20px; border-radius:20px; text-align:center; border:2px solid #eee; display:flex; flex-direction:column; justify-content:space-between; position:relative; min-height:250px;">
                <button class="btn-cheat" data-mesin="${id}" style="position:absolute; top:10px; right:10px; border:none; background:none; cursor:pointer; font-size:1.2rem; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.1));">⚡</button>
                <div>
                    <h3 style="margin-bottom:5px; color:#555;">MESIN ${index + 1}</h3>
                    <div id="val-${id}" style="font-size:2.8rem; font-weight:1200; color:#6CA651; margin: 10px 0;">0</div>
                    <div id="days-${id}" style="font-size:0.8rem; color:#aaa; font-weight:800; margin-bottom:15px; text-transform:uppercase;">IDLE</div>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button class="btn-main-action" id="btn-start-${id}" data-mesin="${id}" style="width:100%; padding:12px; border-radius:12px; border:none; color:#fff; font-weight:900; cursor:pointer; transition: 0.3s;"></button>
                    <button class="btn-panen" id="btn-panen-${id}" data-mesin="${id}" style="display:none; width:100%; padding:12px; border-radius:12px; background:#6CA651; color:#fff; border:none; cursor:pointer; font-weight:900;">KONFIRMASI PANEN</button>
                </div>
            </div>
            `).join('')}

            <div class="mesin-card" style="background:#f0fdf4; padding:20px; border-radius:20px; text-align:center; border:2px solid #16a34a; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="color:#16a34a;">KOTAK PANEN (DOC)</h3>
                    <div id="val-SIAP_PANEN" style="font-size:2.8rem; font-weight:1200; color:#1f3326; margin: 10px 0;">0</div>
                </div>
                <button id="btnFinalHatch" style="margin-top:20px; width:100%; padding:15px; border-radius:12px; background:#16a34a; color:#fff; border:none; cursor:pointer; font-weight:900; text-transform:uppercase;">Kirim ke Kelola DOC 🚀</button>
            </div>
        </div>

        <div class="table-container" style="background:white; border-radius:20px; padding:25px; border:1px solid #eee;">
            <h3 style="margin-bottom:20px; text-align:center;">Monitoring Antrian Inkubasi</h3>
            <table style="width:100%; border-collapse:collapse; text-align:center;">
                <thead>
                    <tr style="background:#6CA651;">
                        <th style="padding:15px; color:white;">TANGGAL MULAI</th>
                        <th style="padding:15px; color:white;">MESIN</th>
                        <th style="padding:15px; color:white;">JUMLAH</th>
                        <th style="padding:15px; color:white;">UMUR</th>
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
      onDataReady: (cat) => {
        document.getElementById('catName').innerText = cat.nama;
      },

      onUpdateUI: (data) => {
        const mesinList = ['MESIN_1', 'MESIN_2', 'MESIN_3'];
        const grouped = {};
        data.forEach(item => { grouped[item.status] = item; });

        let totalSiapPanen = 0;
        const tableBody = document.getElementById('umurTableBody');
        tableBody.innerHTML = "";

        mesinList.forEach(id => {
          const item = grouped[id];
          const valEl = document.getElementById(`val-${id}`);
          const daysEl = document.getElementById(`days-${id}`);
          const btnMain = document.getElementById(`btn-start-${id}`);
          const btnP = document.getElementById(`btn-panen-${id}`);

          // Reset UI Awal
          btnMain.style.display = "block";
          btnP.style.display = "none";

          if (!item) {
            valEl.innerText = "0";
            daysEl.innerText = "IDLE";
            btnMain.innerText = "KOSONG";
            btnMain.disabled = true;
            btnMain.style.background = "#ccc";
            btnMain.style.cursor = "not-allowed";
          } else {
            valEl.innerText = item.jumlah.toLocaleString();

            if (!item.mesi_1_tgl) {
              // STATUS: TAMPUNG (BELUM MULAI)
              daysEl.innerText = "MENUNGGU";
              btnMain.innerText = "MULAI PROSES 🚀";
              btnMain.disabled = false;
              btnMain.style.background = "#f39c12"; // Oranye
              btnMain.style.cursor = "pointer";
              btnMain.onclick = async () => {
                if(confirm(`Mulai proses inkubasi ${item.jumlah} butir di ${id}?`)) {
                    const res = await presenter.startTimer(categoryId, id);
                    if (res.status === 'success') location.reload();
                }
              };
            } else {
              // STATUS: SEDANG INKUBASI
              const tglMulai = new Date(item.mesi_1_tgl);
              const diffDays = Math.floor((Date.now() - tglMulai) / (1000 * 60 * 60 * 24));
              daysEl.innerText = `${diffDays} / 21 HARI`;

              if (diffDays >= 21) {
                // SIAP PANEN
                btnMain.style.display = "none";
                btnP.style.display = "block";
                btnP.onclick = async () => {
                    const netas = prompt("Jumlah berhasil menetas?", item.jumlah);
                    if (netas === null) return;
                    const res = await presenter.moveMesin({
                        kategori_id: categoryId,
                        from_status: id,
                        to_status: 'SIAP_PANEN',
                        jumlah_berhasil: parseInt(netas)
                    });
                    if (res.status === 'success') location.reload();
                };
              } else {
                // LAGI PROSES
                btnMain.innerText = "SEDANG PROSES";
                btnMain.disabled = true;
                btnMain.style.background = "#3498db"; // Biru
                btnMain.style.cursor = "not-allowed";
              }

              // Tambah ke Tabel Monitoring
              tableBody.innerHTML += `
                <tr>
                    <td style="padding:15px; border-bottom:1px solid #eee;">${tglMulai.toLocaleDateString('id-ID')}</td>
                    <td style="padding:15px; border-bottom:1px solid #eee;">${id.replace('_', ' ')}</td>
                    <td style="padding:15px; border-bottom:1px solid #eee;">${item.jumlah} Butir</td>
                    <td style="padding:15px; border-bottom:1px solid #eee;">${diffDays} Hari</td>
                </tr>
              `;
            }
          }
        });

        // Update Kotak Panen
        const siapPanenData = data.find(i => i.status === 'SIAP_PANEN');
        document.getElementById("val-SIAP_PANEN").innerText = siapPanenData ? siapPanenData.jumlah : "0";

        if (tableBody.innerHTML === "") {
          tableBody.innerHTML = `<tr><td colspan="4" style="padding:30px; color:#999;">Belum ada proses inkubasi berjalan.</td></tr>`;
        }
      }
    });

    // EVENT CHEAT (PETIR)
    document.querySelectorAll('.btn-cheat').forEach(btn => {
      btn.onclick = async (e) => {
        const mId = e.currentTarget.dataset.mesin;
        const res = await presenter.cheatDB(categoryId, mId);
        if (res.status === 'success') location.reload();
      };
    });

    // KIRIM KE DOC
    document.getElementById('btnFinalHatch').onclick = async () => {
      const val = parseInt(document.getElementById('val-SIAP_PANEN').innerText) || 0;
      if (val <= 0) return alert("Kotak Panen kosong!");
      const res = await presenter.moveMesin({
        kategori_id: categoryId,
        from_status: 'SIAP_PANEN',
        to_status: 'SELESAI'
      });
      if (res.status === 'success') location.reload();
    };

    await presenter.init();
  }
};

export default Tetas;