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
                <select id="noKandang" required style="width: 100%; padding: 16px; border-radius: 12px; border: 2px solid #eef2ed; background: #f9fbf9; font-weight: 800; text-align: center;"><option value="">-- PILIH --</option>${Array.from({length: 10}, (_, i) => `<option value="${i+1}">DERET KANDANG KE-${i+1}</option>`).join('')}</select>
              </div>
            </div>
          </div>

          <div id="stepSesi" class="dashboard-card" style="display: none; background: #fff; padding: 25px; border-radius: 20px; border: 1px solid #e0eadd; flex-direction: column; gap: 20px;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee; text-align: center;">
              <thead style="background: #6CA651; color: white;">
                <tr><th style="padding:15px; text-align:left;">PEKERJAAN HARIAN</th><th style="padding:15px; text-align:center;">DATA INPUT</th><th style="padding:15px; text-align:center;">STATUS</th></tr>
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
                  <div id="problemListContainer"></div> <button type="button" id="btnAddProblem" style="width:100%; padding:12px; border-radius:12px; background:#fff; color:#c53030; border:2px dashed #feb2b2; font-weight:900; cursor:pointer;">+ TAMBAH MASALAH KANDANG</button>
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
          <div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; text-align: center;"><thead style="background: #6CA651; color: white;"><thead style="background: #6CA651; color: white;">
  <tr>
    <th style="padding:15px; text-align: center; vertical-align: middle;">WAKTU</th>
    <th style="padding:15px; text-align: center; vertical-align: middle;">HEWAN</th>
    <th style="padding:15px; text-align: center; vertical-align: middle;">DERET</th>
    <th style="padding:15px; text-align: center; vertical-align: middle;">SESI</th>
    <th style="padding:15px; text-align: center; vertical-align: middle;">PANEN</th>
    <th style="padding:15px; text-align: center; vertical-align: middle;">KESEHATAN</th>
    <th style="padding:15px; text-align: center; vertical-align: middle;">KELAYAKAN</th>
    <th style="padding:15px; text-align: center; vertical-align: middle;">PETUGAS</th>
    <th style="padding:15px; text-align: center; vertical-align: middle;">DAFTAR KINERJA</th>
  </tr>
</thead><tbody id="reportTableBody"></tbody></table></div>
        </div>

        <div id="statusModal" class="modal-overlay"><div class="modal-box"><button class="close-modal-btn">&times;</button><div id="modalNote" style="padding: 25px;"></div></div></div>
        <div id="taskModal" class="modal-overlay"><div class="modal-box" style="max-width: 500px;"><button class="close-modal-btn">&times;</button><h3 style="padding: 25px 25px 0;">✅ Detail Pekerjaan</h3><div id="taskListContent" style="padding: 0 25px 25px;"></div></div></div>
        <div id="panenModal" class="modal-overlay">
            <div class="modal-box" style="max-width: 450px;">
                <button class="close-modal-btn">&times;</button>
                <div style="padding: 25px;">
                    <h3 style="font-family:'Luckiest Guy'; color:#6CA651; text-align:center; font-size:1.8rem; margin-bottom:20px;">INPUT PANEN TELUR</h3>
                    <div id="panenEntries" style="max-height: 250px; overflow-y: auto; margin-bottom: 15px;"></div>
                    <button type="button" id="btnAddPanenRow" style="width:100%; padding:10px; border-radius:10px; background:#f0f7f0; color:#2d4a36; border:2px dashed #6CA651; font-weight:800; cursor:pointer; margin-bottom:15px;">+ TAMBAH NOMOR KANDANG</button>
                    <button type="button" id="btnSavePanen" style="width:100%; padding:15px; border-radius:15px; background:#1f3326; color:white; border:none; font-weight:900; cursor:pointer;">SIMPAN DATA PANEN</button>
                </div>
            </div>
        </div>
      </div>

      <style>
        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 99999; align-items: center; justify-content: center; backdrop-filter: blur(5px); padding: 20px; }
        .modal-box { background: white; width: 100%; border-radius: 24px; position: relative; animation: modalPop 0.3s ease; overflow: hidden; max-width: 450px; }
        .close-modal-btn { position: absolute; top: 15px; right: 15px; background: #eee; border: none; font-size: 1.2rem; cursor: pointer; width: 30px; height: 30px; border-radius: 50%; z-index: 100; }
        @keyframes modalPop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      </style>
    `;
  },
  async afterRender() {
    const { default: LaporanPresenter } = await import('./laporan-presenter.js');
    const presenter = new LaporanPresenter();
    presenter.init();
  }
};

export default Laporan;