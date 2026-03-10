import AyamPresenter from './ayam-presenter.js';

const Ayam = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width: 1200px; margin: 0 auto;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">KELOLA STOK AYAM</h1>
          <h2 id="displayCategoryName" style="margin: 10px 0 0; color: #1f3326; font-weight: 900; text-transform: uppercase; font-size: 1.5rem;"></h2>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
            <div class="dashboard-card" style="background: #fff; padding: 25px; border-radius: 24px; border: 1px solid #eef2ed; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                <h3 style="margin:0; font-weight:900; color:#41644A; font-size:0.9rem;">POPULASI (DARI LAPORAN)</h3>
                <div id="totalPopulasiLap" style="font-size:3rem; font-weight:1200; color:#2c3e50;">0</div>
                <div style="font-weight:900; color:#41644A; font-size:0.8rem;">EKOR TERDATA</div>
            </div>
            <div class="dashboard-card" style="background: #ebfaf0; padding: 25px; border-radius: 24px; border: 1px solid #c3e6cb; text-align: center;">
                <h3 style="margin:0; font-weight:900; color:#2d572c; font-size:0.9rem;">KONDISI SEHAT</h3>
                <div id="totalSehat" style="font-size:3rem; font-weight:1200; color:#27ae60;">0</div>
                <div style="font-weight:900; color:#2d572c; font-size:0.8rem;">EKOR</div>
            </div>
            <div class="dashboard-card" style="background: #fff5f5; padding: 25px; border-radius: 24px; border: 1px solid #feb2b2; text-align: center;">
                <h3 style="margin:0; font-weight:900; color:#c53030; font-size:0.9rem;">KONDISI SAKIT</h3>
                <div id="totalSakit" style="font-size:3rem; font-weight:1200; color:#e74c3c;">0</div>
                <div style="font-weight:900; color:#c53030; font-size:0.8rem;">EKOR</div>
            </div>
        </div>

        <div class="main-content-card" style="background: white; padding: 40px; border-radius: 35px; border: 1px solid #e0eadd; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
            <h3 style="text-align:center; font-weight:1200; color:#41644A; margin-bottom:25px; text-transform:uppercase;">UPDATE PEMBAGIAN STOK MANUAL</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; background:#f9fbf9; padding:25px; border-radius:24px; border:1px solid #eef2ed;">
                <div class="form-group">
                    <label style="display: block; font-weight: 900; color: #41644A; margin-bottom: 10px; text-align: center; font-size: 0.8rem;">SET STOK JANTAN AKTIF</label>
                    <input type="number" id="manualJantan" value="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #ddd; text-align: center; font-weight: 900; font-size: 1.5rem;">
                </div>
                <div class="form-group">
                    <label style="display: block; font-weight: 900; color: #41644A; margin-bottom: 10px; text-align: center; font-size: 0.8rem;">SET STOK PETELUR AKTIF</label>
                    <input type="number" id="manualPetelur" value="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #ddd; text-align: center; font-weight: 900; font-size: 1.5rem;">
                </div>
            </div>
            <button id="btnConfirmManual" style="width: 100%; margin-top:20px; padding: 25px; background: #6CA651; color: white; border: none; border-radius: 24px; font-weight: 1200; cursor: pointer; font-size: 1.2rem; text-transform: uppercase;">
                UPDATE STOK MANUAL DARI TOTAL LAPORAN
            </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="dashboard-card" style="background: #fff; padding: 25px; border-radius: 24px; border: 1px solid #eef2ed; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                <h3 style="margin:0; font-weight:900; color:#41644A; font-size:1.1rem; text-transform: uppercase;">STOK PEJANTAN AKTIF</h3>
                <div id="stokPejantan" style="font-size:3.5rem; font-weight:1200; color:#6CA651; line-height: 1.2;">0</div>
                <div style="font-weight:900; color:#41644A; font-size:0.9rem;">EKOR</div>
            </div>
            <div class="dashboard-card" style="background: #fff; padding: 25px; border-radius: 24px; border: 1px solid #eef2ed; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                <h3 style="margin:0; font-weight:900; color:#41644A; font-size:1.1rem; text-transform: uppercase;">STOK PETELUR AKTIF</h3>
                <div id="stokPetelur" style="font-size:3.5rem; font-weight:1200; color:#6CA651; line-height: 1.2;">0</div>
                <div style="font-weight:900; color:#41644A; font-size:0.9rem;">EKOR</div>
            </div>
        </div>

        <div class="main-content-card" style="background: white; padding: 40px; border-radius: 35px; border: 1px solid #e0eadd; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                <div style="background: #fff5f5; padding: 25px; border-radius: 20px; border: 2px solid #feb2b2;">
                    <label style="display: block; font-weight: 900; color: #c53030; margin-bottom: 15px; text-align: center; text-transform: uppercase; font-size: 0.8rem;">PEJANTAN DIJUAL (PEDAGING)</label>
                    <input type="number" id="sellPejantan" value="0" min="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #fc8181; text-align: center; font-weight: 900; font-size: 1.5rem; color: #1f3326;">
                    <small style="display:block; text-align:center; margin-top:10px; font-weight:800; color: #4a5568;">SISA TETAP SIMPAN: <span id="sisaPejantan" style="color: #6CA651;">0</span></small>
                </div>
                <div style="background: #fff5f5; padding: 25px; border-radius: 20px; border: 2px solid #feb2b2;">
                    <label style="display: block; font-weight: 900; color: #c53030; margin-bottom: 15px; text-align: center; text-transform: uppercase; font-size: 0.8rem;">PETELUR DIJUAL (PEDAGING)</label>
                    <input type="number" id="sellPetelur" value="0" min="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #fc8181; text-align: center; font-weight: 900; font-size: 1.5rem; color: #1f3326;">
                    <small style="display:block; text-align:center; margin-top:10px; font-weight:800; color: #4a5568;">SISA TETAP SIMPAN: <span id="sisaPetelur" style="color: #6CA651;">0</span></small>
                </div>
            </div>
            <button id="btnConfirmAyam" style="width: 100%; padding: 25px; background: #1f3326; color: white; border: none; border-radius: 24px; font-weight: 1200; font-size: 1.3rem; cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 1px;">
                KONFIRMASI PENJUALAN AYAM
            </button>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const sellPejantan = document.getElementById('sellPejantan');
    const sellPetelur = document.getElementById('sellPetelur');
    const sisaPejantanDisp = document.getElementById('sisaPejantan');
    const sisaPetelurDisp = document.getElementById('sisaPetelur');
    const btnConfirm = document.getElementById('btnConfirmAyam');
    
    const btnConfirmManual = document.getElementById('btnConfirmManual');
    const inputManualJantan = document.getElementById('manualJantan');
    const inputManualPetelur = document.getElementById('manualPetelur');
    
    let stocks = { pejantan: 0, petelur: 0 };

    const refreshLogic = () => {
      const jantanOut = parseInt(sellPejantan.value) || 0;
      const betinaOut = parseInt(sellPetelur.value) || 0;
      const remJantan = stocks.pejantan - jantanOut;
      const remBetina = stocks.petelur - betinaOut;

      sisaPejantanDisp.innerText = remJantan.toLocaleString();
      sisaPetelurDisp.innerText = remBetina.toLocaleString();

      if (remJantan < 0 || remBetina < 0) {
        btnConfirm.disabled = true;
        btnConfirm.style.opacity = '0.5';
        if(remJantan < 0) sisaPejantanDisp.style.color = '#e74c3c';
        if(remBetina < 0) sisaPetelurDisp.style.color = '#e74c3c';
      } else {
        btnConfirm.disabled = false;
        btnConfirm.style.opacity = '1';
        sisaPejantanDisp.style.color = '#6CA651';
        sisaPetelurDisp.style.color = '#6CA651';
      }
    };

    const presenter = new AyamPresenter({
      onDataReady: (cat) => document.getElementById('displayCategoryName').innerText = cat.nama,
      onStockReady: (s) => {
        stocks = s;
        document.getElementById('stokPejantan').innerText = s.pejantan.toLocaleString();
        document.getElementById('stokPetelur').innerText = s.petelur.toLocaleString();
        refreshLogic();
      },
      onHealthReady: (h) => {
          document.getElementById('totalPopulasiLap').innerText = h.totalPopulasi.toLocaleString();
          document.getElementById('totalSehat').innerText = h.sehat.toLocaleString();
          document.getElementById('totalSakit').innerText = h.sakit.toLocaleString();
      }
    });

    sellPejantan.oninput = refreshLogic;
    sellPetelur.oninput = refreshLogic;

    btnConfirm.onclick = async () => {
      const payload = {
        kategori_id: window.location.hash.split('-').slice(1).join('-'),
        sell_pejantan: parseInt(sellPejantan.value) || 0,
        sell_petelur: parseInt(sellPetelur.value) || 0,
        awal_pejantan: stocks.pejantan,
        awal_petelur: stocks.petelur
      };
      const res = await presenter.submitAyamProcess(payload);
      if (res.status === 'success') {
        alert("Penjualan Berhasil!");
        location.reload();
      }
    };

    btnConfirmManual.onclick = async () => {
        const payload = {
            kategori_id: window.location.hash.split('-').slice(1).join('-'),
            jantan: parseInt(inputManualJantan.value) || 0,
            petelur: parseInt(inputManualPetelur.value) || 0
        };
        const res = await presenter.updateManualStock(payload);
        if(res.status === 'success') {
            alert("Update Stok Aktif Berhasil!");
            location.reload();
        }
    };

    await presenter.init();
  }
};
export default Ayam;