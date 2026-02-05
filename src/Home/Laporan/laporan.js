const Laporan = {
  async render() {
    return `
      <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">

      <div class="page" style="display: flex; flex-direction: column; gap: 20px; padding: 0 20px;">
        
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04); position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; font-weight: normal; letter-spacing: 3px; text-transform: uppercase;">
            LAPORAN OPERASIONAL
          </h1>
        </div>

        <form id="laporanForm" style="display: flex; flex-direction: column; gap: 20px;">
          <div class="dashboard-card" style="background: #fff; padding: 30px; border-radius: 24px; border: 1px solid #e0eadd; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; width: 100%;">
              <div class="form-group">
                <label style="font-size: 0.95rem; font-weight: 1200; text-transform: uppercase; color: #14280a; display: block; margin-bottom: 8px; text-align: center;">KATEGORI HEWAN</label>
                <select id="hewanType" required style="width: 100%; padding: 16px; border-radius: 12px; border: 2px solid #eef2ed; background: #f9fbf9; font-weight: 800; text-align: center;">
                  <option value="">-- PILIH --</option>
                </select>
              </div>
              <div class="form-group">
                <label style="font-size: 0.95rem; font-weight: 1200; text-transform: uppercase; color: #14280a; display: block; margin-bottom: 8px; text-align: center;">PILIH SESI</label>
                <select id="sessionType" required style="width: 100%; padding: 16px; border-radius: 12px; border: 2px solid #eef2ed; background: #f9fbf9; font-weight: 800; text-align: center;">
                  <option value="">-- PILIH --</option>
                  <option value="PAGI">SESI PAGI</option>
                  <option value="SORE">SESI SORE</option>
                </select>
              </div>
              <div class="form-group">
                <label style="font-size: 0.95rem; font-weight: 1200; text-transform: uppercase; color: #14280a; display: block; margin-bottom: 8px; text-align: center;">DERET KANDANG</label>
                <select id="noKandang" required style="width: 100%; padding: 16px; border-radius: 12px; border: 2px solid #eef2ed; background: #f9fbf9; font-weight: 800; text-align: center;">
                  <option value="">-- PILIH --</option>
                  ${Array.from({length: 10}, (_, i) => `<option value="${i+1}">DERET KANDANG KE-${i+1}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <div id="stepSesi" class="dashboard-card" style="display: none; background: #fff; padding: 25px; border-radius: 20px; border: 1px solid #e0eadd; flex-direction: column; gap: 20px;">
            <div style="overflow: hidden; border-radius: 18px; border: 1px solid #eef2ed;">
              <table style="width: 100%; border-collapse: collapse; background: #fff;">
                <thead style="background: #6CA651; color: white;">
                  <tr>
                    <th style="padding: 15px; text-align: left; font-size: 0.8rem; width: 45%;">PEKERJAAN HARIAN</th>
                    <th style="padding: 15px; text-align: center; font-size: 0.8rem;">INPUT DATA</th>
                    <th style="padding: 15px; text-align: center; font-size: 0.8rem; width: 100px;">STATUS</th>
                  </tr>
                </thead>
                <tbody id="taskContainer"></tbody>
              </table>
            </div>

            <div style="background: #f9fbf9; padding: 20px; border-radius: 18px; border: 1px solid #eef2ed;">
               <h3 style="font-size: 1rem; font-weight: 900; color: #14280a; margin: 0 0 15px;">Kelayakan Kandang</h3>
               <select class="status-kandang-select" style="width: 100%; padding: 12px; border-radius: 12px; font-weight: 800; border: 2px solid #eef2ed;">
                  <option value="STANDAR">✅ STANDAR (AMAN)</option>
                  <option value="TIDAK_STANDAR">⚠️ TIDAK STANDAR (BERMASALAH)</option>
               </select>
               <div class="alert-row" style="display: none; margin-top: 15px; background: #fff5f5; padding: 20px; border-radius: 15px; border: 1px solid #feb2b2;">
                  <textarea class="kandang-note" placeholder="Rincian masalah kandang..." style="width: 100%; padding: 12px; border-radius: 10px; min-height: 80px;"></textarea>
                  <input type="file" class="kandang-photo" accept="image/*" style="margin-top: 10px;">
               </div>
            </div>

            <button type="submit" id="btnSubmit" class="auth-btn" style="background: #6CA651; color: white; padding: 22px; border-radius: 20px; font-weight: 900; border: none; cursor: pointer; font-size: 1.1rem; letter-spacing: 1px;">
              SIMPAN LAPORAN KANDANG
            </button>
          </div>
        </form>

        <div class="dashboard-card" style="background: #fff; padding: 25px; border-radius: 20px; border: 1px solid #e0eadd; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h3 style="font-size: 1.1rem; font-weight: 900; text-align: center; margin-bottom: 20px; color: #14280a;">LEMBAR OPERASIONAL HARIAN</h3>
          
          <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 20px; background: #f9fbf9; padding: 15px; border-radius: 15px; border: 1px solid #eef2ed;">
            <button type="button" id="prevDate" style="background: #6CA651; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 900;">&laquo; PREV</button>
            <div style="text-align: center; min-width: 180px;">
                <span id="currentDateDisplay" style="font-weight: 1200; color: #14280a; font-size: 1rem; display: block;">-</span>
            </div>
            <button type="button" id="nextDate" style="background: #6CA651; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 900;">NEXT &raquo;</button>
          </div>

          <div style="overflow-x: auto; border-radius: 15px; border: 1px solid #eef2ed;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
              <thead style="background: #6CA651; color: #ffffff;">
                <tr>
                  <th style="padding: 15px; text-align: left;">WAKTU</th>
                  <th style="padding: 15px; text-align: left;">HEWAN</th>
                  <th style="padding: 15px; text-align: left;">DERET</th>
                  <th style="padding: 15px; text-align: left;">SESI</th>
                  <th style="padding: 15px; text-align: left;">KESEHATAN</th>
                  <th style="padding: 15px; text-align: left;">KELAYAKAN</th>
                  <th style="padding: 15px; text-align: left;">PETUGAS</th>
                  <th style="padding: 15px; text-align: center;">AKSI</th>
                </tr>
              </thead>
              <tbody id="reportTableBody"></tbody>
            </table>
          </div>
        </div>

        <div id="statusModal" class="modal-overlay"><div class="modal-box"><button class="close-modal-btn">&times;</button><div id="modalNote" style="padding: 25px;"></div></div></div>
        <div id="taskModal" class="modal-overlay"><div class="modal-box checklist-modal"><button class="close-modal-btn">&times;</button><h3 style="font-size:1.1rem; color: #1f3326; padding: 25px 25px 0;">✅ Detail Pekerjaan</h3><div id="taskListContent" style="display:flex; flex-direction:column; padding: 0 25px 25px;"></div></div></div>
      </div>
      
      <style>
        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 99999; align-items: center; justify-content: center; backdrop-filter: blur(5px); padding: 20px; }
        .modal-box { background: white; width: 100%; border-radius: 24px; position: relative; animation: modalPop 0.3s ease; overflow: hidden; max-width: 450px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);}
        .close-modal-btn { position: absolute; top: 15px; right: 15px; background: white; border: none; font-size: 1.5rem; cursor: pointer; width: 35px; height: 35px; border-radius: 50%; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
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