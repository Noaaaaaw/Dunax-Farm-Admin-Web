import DocPresenter from './doc-presenter.js';

const Doc = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width: 1200px; margin: 0 auto;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">KELOLA STOK DOC</h1>
          <h2 id="displayCategoryName" style="margin: 10px 0 0; color: #1f3326; font-weight: 900; text-transform: uppercase; font-size: 1.5rem;"></h2>
        </div>

        <div class="dashboard-card" style="background: #fff; padding: 40px; border-radius: 28px; border: 1px solid #eef2ed; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <h3 style="margin: 0 0 10px 0; font-weight: 900; color: #41644A; letter-spacing: 1px; font-size: 1.2rem; text-transform: uppercase;">
                STOK DOC TERSEDIA
            </h3>
            <div id="stokDocTersedia" style="font-size: 3rem; font-weight: 1200; color: #6CA651; line-height: 1; margin: 10px 0;">0</div>
            <div style="font-size: 1.2rem; font-weight: 900; color: #41644A; text-transform: uppercase; letter-spacing: 2px;">EKOR</div>
        </div>

        <div class="main-content-card" style="background: white; padding: 45px; border-radius: 35px; border: 1px solid #e0eadd; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
            <div style="display: flex; flex-direction: column; gap: 25px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f0f7f0; padding: 25px; border-radius: 20px; text-align: center; border: 2px solid #6CA651;">
                        <label style="display: block; font-weight: 900; color: #2d4a36; margin-bottom: 10px;">HIDUP (MASUK JADI PULLET)</label>
                        <input type="number" id="inputHidup" value="0" min="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #6CA651; font-weight: 900; font-size: 1.5rem; text-align: center;">
                    </div>
                    <div style="background: #fff5f5; padding: 25px; border-radius: 20px; text-align: center; border: 2px solid #e74c3c;">
                        <label style="display: block; font-weight: 900; color: #c53030; margin-bottom: 10px;">MATI (DIBUANG DARI STOK)</label>
                        <input type="number" id="inputMati" value="0" min="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #e74c3c; font-weight: 900; font-size: 1.5rem; text-align: center;">
                    </div>
                </div>

                <div style="background: #f1f5f9; padding: 20px; border-radius: 18px; text-align: center; border: 1px dashed #475569;">
                    <span style="font-weight: 800; color: #475569;">SISA TETAP JADI DOC: <span id="autoSisaStay" style="color: #1f3326; font-size: 1.2rem;">0</span> EKOR</span>
                </div>

                <button id="btnKonfirmasiDoc" style="width: 100%; padding: 25px; background: #1f3326; color: white; border: none; border-radius: 22px; font-weight: 1200; font-size: 1.3rem; cursor: pointer; transition: 0.3s;">
                    PROSES DISTRIBUSI & PINDAH KE PULLET
                </button>
            </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const inputHidup = document.getElementById('inputHidup');
    const inputMati = document.getElementById('inputMati');
    const autoSisaStay = document.getElementById('autoSisaStay');
    const stokDocDisplay = document.getElementById('stokDocTersedia');
    const btnSubmit = document.getElementById('btnKonfirmasiDoc');
    let currentDocStok = 0;

    const refreshSisaUI = () => {
      const hidup = parseInt(inputHidup.value) || 0;
      const mati = parseInt(inputMati.value) || 0;
      const totalProses = hidup + mati;
      
      const sisa = Math.max(0, currentDocStok - totalProses);
      autoSisaStay.innerText = sisa.toLocaleString();

      if (totalProses > currentDocStok) {
        autoSisaStay.innerText = "MELEBIHI STOK!";
        autoSisaStay.style.color = "#e74c3c";
        btnSubmit.disabled = true;
        btnSubmit.style.opacity = '0.5';
        btnSubmit.style.cursor = 'not-allowed';
      } else {
        autoSisaStay.style.color = "#1f3326";
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = '1';
        btnSubmit.style.cursor = 'pointer';
      }
    };

    const presenter = new DocPresenter({
      onDataReady: (cat) => {
        document.getElementById('displayCategoryName').innerText = cat.nama;
      },
      onDocReady: (docItem) => {
        currentDocStok = docItem.stok || 0;
        stokDocDisplay.innerText = currentDocStok.toLocaleString();
        refreshSisaUI();
      }
    });

    inputHidup.oninput = refreshSisaUI;
    inputMati.oninput = refreshSisaUI;

    btnSubmit.onclick = async () => {
      const hidup = parseInt(inputHidup.value) || 0;
      const mati = parseInt(inputMati.value) || 0;

      if ((hidup + mati) <= 0) return alert("Input jumlah hidup atau mati dulu!");

      // LOGIKA CLEANUP: #doc-ayam-kampung -> ayam-kampung
      const rawCategory = window.location.hash.split('-').slice(1).join('-');
      const cleanCategory = rawCategory.replace('doc-', '').toLowerCase();

      try {
        const res = await presenter.submitDocProcess({
            kategori_id: cleanCategory,
            jumlah_hidup: hidup,
            jumlah_mati: mati
        });

        if (res.status === 'success') {
            alert(`Distribusi Berhasil!\n- ${hidup} ekor masuk ke stok Pullet\n- ${mati} ekor mati/dibuang`);
            location.reload();
        } else {
            alert("Gagal: " + (res.message || "Kesalahan di server"));
        }
      } catch (error) {
        console.error("Error submitting process:", error);
        alert("Terjadi kesalahan jaringan atau server 500!");
      }
    };

    await presenter.init();
  }
};

export default Doc;