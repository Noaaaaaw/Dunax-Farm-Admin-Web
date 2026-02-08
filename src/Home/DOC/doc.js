// Doc.js
import DocPresenter from './doc-presenter.js';

const Doc = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width: 1200px; margin: 0 auto;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">PANEN MESIN TETAS</h1>
          <h2 id="displayCategoryName" style="margin: 10px 0 0; color: #1f3326; font-weight: 900; text-transform: uppercase; font-size: 1.5rem;"></h2>
        </div>

        <div class="dashboard-card" style="background: #fff; padding: 40px; border-radius: 28px; border: 1px solid #eef2ed; text-align: center;">
            <h3 style="margin: 0 0 10px 0; font-weight: 900; color: #41644A; text-transform: uppercase;">ISI MESIN TETAS (ANTRIAN)</h3>
            <div id="stokDocTersedia" style="font-size: 3.5rem; font-weight: 1200; color: #6CA651;">0</div>
            <div style="font-weight: 900; color: #41644A;">BUTIR TELUR</div>
        </div>

        <div class="main-content-card" style="background: white; padding: 45px; border-radius: 35px; border: 1px solid #e0eadd; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
            <div style="display: flex; flex-direction: column; gap: 25px;">
                <p style="text-align:center; font-weight:700; color:#666;">Input hasil panen setelah 3 minggu pengeraman:</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f0f7f0; padding: 25px; border-radius: 20px; text-align: center; border: 2px solid #6CA651;">
                        <label style="display: block; font-weight: 900; color: #2d4a36; margin-bottom: 10px;">MENETAS (HIDUP)</label>
                        <input type="number" id="inputHidup" value="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #6CA651; font-weight: 900; font-size: 1.5rem; text-align: center;">
                    </div>
                    <div style="background: #fff5f5; padding: 25px; border-radius: 20px; text-align: center; border: 2px solid #e74c3c;">
                        <label style="display: block; font-weight: 900; color: #c53030; margin-bottom: 10px;">GAGAL/MATI</label>
                        <input type="number" id="inputMati" value="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #e74c3c; font-weight: 900; font-size: 1.5rem; text-align: center;">
                    </div>
                </div>
                <button id="btnKonfirmasiDoc" style="width: 100%; padding: 25px; background: #1f3326; color: white; border: none; border-radius: 22px; font-weight: 1200; font-size: 1.3rem; cursor: pointer;">PROSES JADI STOK DOC</button>
            </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const inputHidup = document.getElementById('inputHidup');
    const inputMati = document.getElementById('inputMati');
    const stokDocDisplay = document.getElementById('stokDocTersedia');
    const btnSubmit = document.getElementById('btnKonfirmasiDoc');
    let currentSourceStok = 0;

    const presenter = new DocPresenter({
      onDataReady: (cat) => { document.getElementById('displayCategoryName').innerText = cat.nama; },
      onDocReady: (item) => {
        currentSourceStok = item.stok;
        stokDocDisplay.innerText = Number(currentSourceStok).toLocaleString();
      }
    });

    btnSubmit.onclick = async () => {
      const hidup = Number(inputHidup.value) || 0;
      const mati = Number(inputMati.value) || 0;

      if ((hidup + mati) > currentSourceStok) return alert("Jumlah melebihi isi mesin tetas!");
      if ((hidup + mati) <= 0) return alert("Input data dulu!");

      const res = await presenter.submitDocProcess({
        kategori_id: window.location.hash.split('-').slice(1).join('-'),
        jumlah_hidup: hidup,
        jumlah_mati: mati
      });

      if (res.status === 'success') { alert("Berhasil! Telur sudah menetas jadi DOC. 🐥"); location.reload(); }
    };
    await presenter.init();
  }
};

export default Doc;