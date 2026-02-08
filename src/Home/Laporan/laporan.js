const Laporan = {
  async render() {
    return `
      <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">

      <div class="page" style="display: flex; flex-direction: column; gap: 20px; padding: 0 20px;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04); text-align: center;">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; letter-spacing: 3px; text-transform: uppercase;">LAPORAN OPERASIONAL</h1>
        </div>

        <form id="laporanForm" style="display: flex; flex-direction: column; gap: 20px;">
          <div class="dashboard-card" style="background: #fff; padding: 30px; border-radius: 24px; border: 1px solid #e0eadd; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; width: 100%;">
              <div class="form-group">
                <label style="font-size: 0.85rem; font-weight: 1200; text-transform: uppercase; color: #14280a; display: block; margin-bottom: 8px; text-align: center;">KATEGORI HEWAN</label>
                <select id="hewanType" required style="width: 100%; padding: 16px; border-radius: 12px; border: 2px solid #eef2ed; background: #f9fbf9; font-weight: 800; text-align: center;"><option value="">-- PILIH --</option></select>
              </div>
              <div class="form-group">
                <label style="font-size: 0.85rem; font-weight: 1200; text-transform: uppercase; color: #14280a; display: block; margin-bottom: 8px; text-align: center;">PILIH SESI</label>
                <select id="sessionType" required style="width: 100%; padding: 16px; border-radius: 12px; border: 2px solid #eef2ed; background: #f9fbf9; font-weight: 800; text-align: center;">
                    <option value="">-- PILIH --</option>
                    <option value="PAGI">SESI PAGI</option>
                    <option value="SORE">SESI SORE</option>
                </select>
              </div>
              <div class="form-group">
                <label style="font-size: 0.85rem; font-weight: 1200; text-transform: uppercase; color: #14280a; display: block; margin-bottom: 8px; text-align: center;">DERET KANDANG</label>
                <select id="noKandang" required style="width: 100%; padding: 16px; border-radius: 12px; border: 2px solid #eef2ed; background: #f9fbf9; font-weight: 800; text-align: center;">
                    <option value="">-- PILIH --</option>
                    ${Array.from({length: 10}, (_, i) => `<option value="${i+1}">DERET KANDANG KE-${i+1}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <div id="stepSesi" class="dashboard-card" style="display: none; background: #fff; padding: 25px; border-radius: 20px; border: 1px solid #e0eadd; flex-direction: column; gap: 20px;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee; text-align: center;">
              <thead style="background: #6CA651; color: white;">
                <tr>
                  <th style="padding:15px; text-align:left;">PEKERJAAN HARIAN</th>
                  <th style="padding:15px; text-align:center;">DATA INPUT</th>
                  <th style="padding:15px; text-align:center;">STATUS</th>
                </tr>
              </thead>
              <tbody id="taskContainer"></tbody>
            </table>

            <div style="background: #f9fbf9; padding: 20px; border-radius: 18px; border: 1px solid #eef2ed;">
               <h3 style="font-size: 1rem; font-weight: 900; margin: 0 0 15px; text-align: left;">KELAYAKAN KANDANG</h3>
               <select class="status-kandang-select" style="width: 100%; padding: 12px; border-radius: 12px; font-weight: 800; border: 2px solid #eef2ed; text-align: left;">
                  <option value="STANDAR">✅ STANDAR (AMAN)</option>
                  <option value="TIDAK_STANDAR">⚠️ TIDAK STANDAR (BERMASALAH)</option>
               </select>
               
               <div class="alert-row" style="display: none; margin-top: 15px; background: #fff5f5; padding: 20px; border-radius: 15px; border: 1px solid #feb2b2;">
                  <div id="problemListContainer"></div> 
                  <button type="button" id="btnAddProblem" style="width:100%; padding:12px; border-radius:12px; background:#fff; color:#c53030; border:2px dashed #feb2b2; font-weight:900; cursor:pointer;">+ TAMBAH MASALAH KANDANG</button>
               </div>
            </div>

            <button type="submit" id="btnSubmit" style="background: #6CA651; color: white; padding: 22px; border-radius: 20px; font-weight: 900; border: none; cursor: pointer; font-size: 1.1rem; text-transform: uppercase;">SIMPAN LAPORAN KANDANG</button>
          </div>
        </form>

        <div class="dashboard-card" style="background: #fff; padding: 25px; border-radius: 20px; border: 1px solid #e0eadd; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 20px; background: #f9fbf9; padding: 15px; border-radius: 15px;">
            <button type="button" id="prevDate" style="background: #6CA651; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer;">&laquo; PREV</button>
            <span id="currentDateDisplay" style="font-weight: 1200; font-size: 1rem;">-</span>
            <button type="button" id="nextDate" style="background: #6CA651; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer;">NEXT &raquo;</button>
          </div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; text-align: center;">
              <thead style="background: #6CA651; color: white;">
                <tr>
                  <th style="padding:15px;">WAKTU</th>
                  <th style="padding:15px;">HEWAN</th>
                  <th style="padding:15px;">DERET</th>
                  <th style="padding:15px;">SESI</th>
                  <th style="padding:15px;">PANEN</th>
                  <th style="padding:15px;">KESEHATAN</th>
                  <th style="padding:15px;">KELAYAKAN</th>
                  <th style="padding:15px;">PETUGAS</th>
                  <th style="padding:15px;">KINERJA</th>
                </tr>
              </thead>
              <tbody id="reportTableBody"></tbody>
            </table>
          </div>
        </div>

        <div id="statusModal" class="modal-overlay">
          <div class="modal-box" style="max-width: 380px;">
            <div style="background: #6CA651; padding: 15px; text-align: center; position: relative; border-bottom: 2px solid #000;">
               <h3 id="statusModalTitle" style="margin: 0; color: white; font-family: 'Luckiest Guy', cursive; font-weight: normal; font-size: 1.2rem; letter-spacing: 1px;">DETAIL</h3>
               <button class="close-modal-btn" style="position: absolute; top: 12px; right: 15px; background: white; border: 2px solid #000; font-size: 0.8rem; cursor: pointer; width: 25px; height: 25px; border-radius: 50%; font-weight: 900; color: #6CA651;">✕</button>
            </div>
            <div id="modalNote" style="padding: 15px; max-height: 350px; overflow-y: auto;"></div>
          </div>
        </div>

        <div id="taskModal" class="modal-overlay">
          <div class="modal-box" style="max-width: 380px;">
            <div style="background: #6CA651; padding: 15px; text-align: center; position: relative; border-bottom: 2px solid #000;">
               <h3 style="margin: 0; color: white; font-family: 'Luckiest Guy', cursive; font-weight: normal; font-size: 1.2rem; letter-spacing: 1px;">DAFTAR KINERJA</h3>
               <button class="close-modal-btn" style="position: absolute; top: 12px; right: 15px; background: white; border: 2px solid #000; font-size: 0.8rem; cursor: pointer; width: 25px; height: 25px; border-radius: 50%; font-weight: 900; color: #6CA651;">✕</button>
            </div>
            <div id="taskListContent" style="padding: 15px; max-height: 350px; overflow-y: auto;"></div>
          </div>
        </div>

        <div id="panenModal" class="modal-overlay">
          <div class="modal-box" style="max-width: 420px;">
            <button class="close-modal-btn" style="position: absolute; top: 15px; right: 15px; background: #eee; border: 2px solid #000; font-size: 1rem; cursor: pointer; width: 30px; height: 30px; border-radius: 50%; z-index: 100;">&times;</button>
            <div style="padding: 20px;">
              <h3 style="font-family:'Luckiest Guy'; color:#6CA651; text-align:center; font-size:1.8rem; margin-bottom:5px;">PANEN TELUR</h3>
              <p style="text-align:center; font-size:0.7rem; color:#888; margin-bottom:20px;">Maksimal 5 butir per hari.</p>
              <div id="panenEntries" style="max-height: 300px; overflow-y: auto; margin-bottom: 15px; padding-right: 5px;"></div>
              <button type="button" id="btnSavePanen" style="width:100%; padding:15px; border-radius:15px; background:#1f3326; color:white; border:none; font-weight:900; cursor:pointer; font-size:1rem;">SIMPAN DATA PANEN</button>
            </div>
          </div>
        </div>
      </div>

      <style>
        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 99999; align-items: center; justify-content: center; backdrop-filter: blur(5px); padding: 20px; }
        .modal-box { background: white; width: 100%; border-radius: 24px; position: relative; animation: modalPop 0.3s ease; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); border: 2px solid #000; }
        @keyframes modalPop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        /* SCROLLBAR MINIMALIS SLIM */
        #modalNote::-webkit-scrollbar, #taskListContent::-webkit-scrollbar, #panenEntries::-webkit-scrollbar { width: 5px; }
        #modalNote::-webkit-scrollbar-thumb, #taskListContent::-webkit-scrollbar-thumb, #panenEntries::-webkit-scrollbar-thumb { background: #6CA651; border-radius: 10px; }
        
        /* TABEL DALAM POPUP - BOLD BLACK BORDER (EXCEL STYLE) */
        .pop-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; border: 2.5px solid #000000; }
        .pop-table th { background: #6CA651; padding: 12px 8px; border: 2.5px solid #000000; text-align: center; color: #FFFFFF; font-weight: 900; text-transform: uppercase; font-size: 0.75rem; }
        .pop-table td { padding: 12px 8px; border: 2.5px solid #000000; text-align: center; vertical-align: middle; color: #000000; font-weight: 700; background: #fff; }
      </style>
    `;
  },

  async afterRender() {
    const { default: LaporanPresenter } = await import('./laporan-presenter.js');
    const presenter = new LaporanPresenter();

    presenter._bindTableButtons = (row) => {
      const modalTitle = document.getElementById('statusModalTitle');
      const modalNote = document.getElementById('modalNote');
      const statusModal = document.getElementById('statusModal');

      // 1. POPUP PANEN
      row.querySelector('.btn-panen-pop').onclick = (e) => {
        const detail = JSON.parse(e.currentTarget.dataset.detail);
        modalTitle.innerText = "RINCIAN PANEN TELUR 🥚";
        modalNote.innerHTML = `
          <table class="pop-table">
            <thead><tr><th>NOMOR KANDANG</th><th>HASIL PANEN</th></tr></thead>
            <tbody>${detail.map(p => `<tr><td>Kandang ${p.noKandang}</td><td>${p.jumlah} Butir</td></tr>`).join('')}</tbody>
          </table>`;
        statusModal.style.display = 'flex';
      };

      // 2. POPUP KESEHATAN
      row.querySelector('.btn-health-pop').onclick = (e) => {
        const d = e.currentTarget.dataset;
        if (d.status === 'SEHAT') return alert("Hewan Sehat Semua! ✅");
        const detail = JSON.parse(d.detail);
        modalTitle.innerText = "DETAIL HEWAN SAKIT ⚠️";
        modalNote.innerHTML = `
          <table class="pop-table">
            <thead><tr><th>NO. KDG</th><th>AYAM</th><th>GEJALA/INDIKASI</th></tr></thead>
            <tbody>${detail.map(x => `<tr><td>${x.kandang}</td><td>${x.ayam}</td><td>${x.penyakit}</td></tr>`).join('')}</tbody>
          </table>`;
        statusModal.style.display = 'flex';
      };

      // 3. POPUP KELAYAKAN (DETAIL MASALAH KANDANG)
      row.querySelector('.btn-layak-pop').onclick = (e) => {
        const d = e.currentTarget.dataset;
        const problems = JSON.parse(d.problems || '[]');
        modalTitle.innerText = `KELAYAKAN: ${d.status}`;
        
        if (d.status === 'LAYAK') {
          modalNote.innerHTML = `<div style="text-align:center; padding:20px; color:#000; font-weight:900;">Kandang dalam kondisi standar/aman ✅</div>`;
        } else {
          modalNote.innerHTML = `
            <table class="pop-table">
              <thead><tr><th>NO. KDG</th><th>RINCIAN MASALAH & BUKTI</th></tr></thead>
              <tbody>
                ${problems.map(p => `
                  <tr>
                    <td style="font-weight:bold;">${p.kandang}</td>
                    <td style="text-align:left;">
                      <div style="margin-bottom:10px; font-weight:800; color:#000;">${p.note}</div>
                      ${p.photo ? `<img src="${p.photo}" style="width:100%; border-radius:8px; border:2.5px solid #000; box-shadow:0 4px 10px rgba(0,0,0,0.1);">` : ''}
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>`;
        }
        statusModal.style.display = 'flex';
      };

      // 4. POPUP KINERJA
      row.querySelector('.btn-task-pop').onclick = (e) => {
        const tasks = JSON.parse(e.currentTarget.dataset.tasks).filter(t => !t.name.includes('Panen'));
        document.getElementById('taskListContent').innerHTML = `
          <table class="pop-table">
            <thead><tr><th>NAMA TUGAS</th><th>HASIL INPUT</th></tr></thead>
            <tbody>${tasks.map(t => `<tr><td style="text-align:left;">${t.status ? '✅' : '❌'} ${t.name}</td><td style="font-weight:900; color:#000;">${t.val || '-'} ${t.unit || ''}</td></tr>`).join('')}</tbody>
          </table>`;
        document.getElementById('taskModal').style.display = 'flex';
      };
    };

    presenter.init();
  }
};

export default Laporan;