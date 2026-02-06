import DocPresenter from './doc-presenter.js';

const Doc = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width: 1200px; margin: 0 auto;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">KELOLA STOK DOC</h1>
          <h2 id="displayCategoryName" style="margin: 10px 0 0; color: #1f3326; font-weight: 900; text-transform: uppercase; font-size: 1.5rem;"></h2>
        </div>

        <div class="dashboard-card" style="background: #fff; padding: 40px; border-radius: 28px; border: 1px solid #eef2ed; text-align: center;">
            <h3 style="font-weight: 900; color: #41644A; margin-bottom: 10px;">STOK DOC TERSEDIA</h3>
            <span id="stokDocTersedia" style="font-size: 3.5rem; font-weight: 1200; color: #6CA651;">0</span>
            <small style="display: block; color: #888; font-weight: 700;">EKOR</small>
        </div>

        <div class="main-content-card" style="background: white; padding: 45px; border-radius: 35px; border: 1px solid #e0eadd; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
            <div style="display: flex; flex-direction: column; gap: 25px;">
                <div style="background: #f0f7f0; padding: 30px; border-radius: 24px; text-align: center; border: 2px solid #6CA651;">
                    <label style="display: block; font-weight: 900; color: #2d4a36; margin-bottom: 15px; text-transform: uppercase;">Jumlah DOC Hidup (Jadi Pullet)</label>
                    <input type="number" id="inputHidup" value="0" min="0" 
                           style="width: 100%; max-width: 300px; padding: 20px; border-radius: 15px; border: 3px solid #6CA651; font-size: 2rem; font-weight: 900; text-align: center;">
                </div>

                <div style="background: #fff5f5; padding: 20px; border-radius: 18px; text-align: center; border: 1px dashed #e74c3c;">
                    <span style="font-weight: 800; color: #c53030;">DOC MATI (OTOMATIS): <span id="autoMati">0</span> EKOR</span>
                </div>

                <button id="btnKonfirmasiDoc" style="width: 100%; padding: 25px; background: #1f3326; color: white; border: none; border-radius: 22px; font-weight: 1200; font-size: 1.3rem; cursor: pointer; transition: 0.3s;">
                    SIMPAN KE STOK PULLET
                </button>
            </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const inputHidup = document.getElementById('inputHidup');
    const autoMati = document.getElementById('autoMati');
    const stokDocDisplay = document.getElementById('stokDocTersedia');
    let currentDocStok = 0;

    const presenter = new DocPresenter({
      onDataReady: (cat) => {
        document.getElementById('displayCategoryName').innerText = cat.nama;
      },
      onDocReady: (docItem) => {
        currentDocStok = docItem.stok;
        stokDocDisplay.innerText = currentDocStok.toLocaleString();
      }
    });

    inputHidup.oninput = () => {
      const valHidup = parseInt(inputHidup.value) || 0;
      // Logika: Sisa otomatis mati
      const valMati = Math.max(0, currentDocStok - valHidup);
      autoMati.innerText = valMati.toLocaleString();
      
      if (valHidup > currentDocStok) {
        inputHidup.style.borderColor = '#e74c3c';
      } else {
        inputHidup.style.borderColor = '#6CA651';
      }
    };

    document.getElementById('btnKonfirmasiDoc').onclick = async () => {
      const valHidup = parseInt(inputHidup.value) || 0;
      
      if (valHidup > currentDocStok) return alert("Jumlah hidup melebihi stok DOC!");
      if (valHidup <= 0) return alert("Input jumlah hidup dulu!");

      const res = await presenter.submitDocProcess({
        kategori_id: window.location.hash.split('-').slice(1).join('-'),
        jumlah_hidup: valHidup, // Akan nambah ke Pullet
        jumlah_mati: currentDocStok - valHidup // Akan memotong stok DOC sampai habis
      });

      if (res.status === 'success') {
        alert("DOC Berhasil Diproses Jadi Pullet! 🚀");
        location.hash = '#/pembibitan';
      }
    };

    await presenter.init();
  }
};

export default Doc;