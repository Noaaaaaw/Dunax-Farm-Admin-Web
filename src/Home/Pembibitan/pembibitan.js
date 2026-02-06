import PembibitanPresenter from './pembibitan-presenter.js';

const Pembibitan = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04); text-align: center;">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">
            MASTER PEMBIBITAN & LIFECYCLE
          </h1>
        </div>

        <div class="dashboard-card" style="background: white; padding: 25px; border-radius: 24px; border: 1px solid #eef2ed;">
          <h3 style="font-weight: 1200; color: #41644A; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            🥚 ANTRIAN PANEN TELUR (DARI LAPORAN)
          </h3>
          <div id="antrianPanenContainer" style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;">
             </div>
        </div>

        <div class="main-content-card" style="background: white; padding: 30px; border-radius: 28px; border: 1px solid #e0eadd;">
          <h2 style="text-align: center; font-weight: 1200; margin-bottom: 25px; color: #1f3326; text-transform: uppercase;">STATUS LIFECYCLE BERJALAN</h2>
          
          <div style="overflow-x: auto; border-radius: 20px; border: 1px solid #eef2ed;">
            <table style="width: 100%; border-collapse: collapse; text-align: center;">
              <thead style="background: #6CA651; color: white;">
                <tr>
                  <th style="padding: 18px;">TANGGAL</th>
                  <th style="padding: 18px;">BATCH / HEWAN</th>
                  <th style="padding: 18px;">TAHAPAN</th>
                  <th style="padding: 18px;">JUMLAH</th>
                  <th style="padding: 18px;">STATUS</th>
                  <th style="padding: 18px;">KUALIFIKASI</th>
                </tr>
              </thead>
              <tbody id="pembibitanTableBody">
                <tr><td colspan="6" style="padding: 40px; color: #ccc;">Mencari data lifecycle...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div id="qualifyModal" class="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:10000; justify-content:center; align-items:center;">
          <div style="background:white; padding:40px; border-radius:35px; width:95%; max-width:450px; text-align:center;">
            <h2 id="modalTitle" style="font-weight:1200; color:#41644A; margin-bottom:10px;">KUALIFIKASI TAHAP</h2>
            <p id="modalDesc" style="color:#666; margin-bottom:25px; font-weight:600;"></p>
            <div style="display:flex; flex-direction:column; gap:15px;">
               <div style="background:#f9fbf9; padding:20px; border-radius:15px; border:1px solid #eef2ed;">
                  <label style="font-weight:900; font-size:0.75rem; color:#6CA651; display:block; margin-bottom:10px;">JUMLAH BAGUS / HIDUP (Lanjut Tahap)</label>
                  <input type="number" id="inputGood" style="width:100%; padding:12px; border-radius:10px; border:2px solid #ddd; text-align:center; font-weight:900; font-size:1.2rem;">
                  
                  <label style="font-weight:900; font-size:0.75rem; color:#c53030; display:block; margin:15px 0 10px;">JUMLAH MATI / AFKIR (Jual/Konsumsi)</label>
                  <input type="number" id="inputBad" style="width:100%; padding:12px; border-radius:10px; border:2px solid #ddd; text-align:center; font-weight:900; font-size:1.2rem;">
               </div>
               <button id="saveQualifyBtn" style="background:#6CA651; color:white; padding:18px; border:none; border-radius:15px; font-weight:1200; cursor:pointer; font-size:1rem;">PROSES LIFECYCLE 🚀</button>
               <button onclick="document.getElementById('qualifyModal').style.display='none'" style="background:none; border:none; color:#888; cursor:pointer; font-weight:700;">Batal</button>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const tableBody = document.getElementById('pembibitanTableBody');
    const antrianCont = document.getElementById('antrianPanenContainer');
    
    this._presenter = new PembibitanPresenter({
      onDataReady: (lifecycleData, antrianPanen) => {
        this._renderAntrian(antrianCont, antrianPanen);
        this._renderTable(tableBody, lifecycleData);
      }
    });
    await this._presenter.init();
  },

  _renderAntrian(container, panen) {
    if (panen.length === 0) {
      container.innerHTML = `<p style="padding:20px; color:#aaa; font-style:italic;">Belum ada laporan panen telur baru hari ini.</p>`;
      return;
    }
    container.innerHTML = panen.map(p => `
      <div style="min-width:220px; background:#f9fbf9; border:2px dashed #6CA651; padding:20px; border-radius:20px; text-align:center;">
        <div style="font-size:0.75rem; font-weight:900; color:#6CA651; margin-bottom:5px;">${p.hewan} - ${p.sesi}</div>
        <div style="font-size:1.5rem; font-weight:1200; color:#14280a;">${p.jumlah} <small>Butir</small></div>
        <button class="btn-start-fertil" data-info='${JSON.stringify(p)}' 
          style="margin-top:12px; background:#41644A; color:white; border:none; padding:8px 15px; border-radius:10px; cursor:pointer; font-weight:800; font-size:0.75rem;">
          MASUKAN KE FERTIL
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-start-fertil').forEach(btn => {
      btn.onclick = async () => {
        const info = JSON.parse(btn.dataset.info);
        if(confirm(`Masukan ${info.jumlah} telur ini ke tahap FERTIL?`)) {
          await this._presenter.moveReportToFertil({
            nama: `BATCH-${Date.now().toString().slice(-4)}`,
            hewan: info.hewan,
            jumlah: info.jumlah,
            tahapan: 'TELUR FERTIL',
            tanggal_mulai: new Date().toISOString(),
            pekerjaan: [{ name: "Cek Suhu Mesin", status: true, val: "38", unit: "C" }]
          });
          alert("Berhasil! Telur sudah masuk lifecycle pembibitan. 🥚");
        }
      };
    });
  },

  _renderTable(container, data) {
    if (data.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="padding:40px; color:#ccc;">Belum ada batch pembibitan yang berjalan.</td></tr>`;
      return;
    }

    container.innerHTML = data.map(item => {
      // Logic status kerja AMAN/PERIKSA
      const isAman = (item.pekerjaan || []).every(p => p.status === true);
      
      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding:15px; font-weight:700;">${new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</td>
          <td style="padding:15px;">
            <div style="font-weight:1200; color:#14280a;">${item.nama}</div>
            <div style="font-size:0.75rem; color:#666; font-weight:800;">${item.hewan}</div>
          </td>
          <td style="padding:15px;"><span style="background:#eef2ed; color:#41644A; padding:5px 12px; border-radius:10px; font-weight:900; font-size:0.7rem;">${item.tahapan}</span></td>
          <td style="padding:15px; font-weight:900; color:#41644A;">${item.jumlah} UNIT</td>
          <td style="padding:15px;">
            <button style="border:none; padding:6px 15px; border-radius:10px; color:white; font-weight:900; background:${isAman ? '#41644A' : '#e74c3c'}; cursor:default;">
              ${isAman ? 'AMAN' : 'PERIKSA'}
            </button>
          </td>
          <td style="padding:15px;">
            <button class="btn-qualify" data-item='${JSON.stringify(item)}'
              style="background:#f39c12; color:white; border:none; padding:10px 18px; border-radius:12px; font-weight:900; cursor:pointer; box-shadow: 0 4px 0 #b37400;">
              KUALIFIKASI
            </button>
          </td>
        </tr>
      `;
    }).join('');

    this._bindTableEvents(container);
  },

  _bindTableEvents(container) {
    container.querySelectorAll('.btn-qualify').forEach(btn => {
      btn.onclick = () => {
        const item = JSON.parse(btn.dataset.item);
        const modal = document.getElementById('qualifyModal');
        document.getElementById('modalTitle').innerText = `KUALIFIKASI: ${item.tahapan}`;
        document.getElementById('modalDesc').innerText = `Batch ${item.nama} (${item.jumlah} unit). Tentukan berapa yang hidup/bagus.`;
        modal.style.display = 'flex';
        
        document.getElementById('saveQualifyBtn').onclick = async () => {
          const good = document.getElementById('inputGood').value;
          const bad = document.getElementById('inputBad').value;
          
          if(Number(good) + Number(bad) > item.jumlah) return alert("Jumlah melebihi total unit batch!");
          
          // Logic Alur:
          // Fertil -> DOC (Hidup) | Fertil -> Konsumsi (Mati)
          // DOC -> Pullet (Hidup) | DOC -> Pedaging (Mati/Jual)
          alert(`Sistem: ${good} unit lanjut ke tahap berikutnya, ${bad} unit masuk ke stok Penjualan!`);
          
          await this._presenter.updateLifecycle({ id: item.id, good, bad });
          modal.style.display = 'none';
        };
      };
    });
  }
};

export default Pembibitan;