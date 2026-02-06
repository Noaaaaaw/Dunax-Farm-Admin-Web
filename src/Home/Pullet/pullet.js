import PulletPresenter from './pullet-presenter.js';

const Pullet = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width: 1200px; margin: 0 auto;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">KELOLA STOK PULLET</h1>
          <h2 id="displayCategoryName" style="margin: 10px 0 0; color: #1f3326; font-weight: 900; text-transform: uppercase; font-size: 1.5rem;"></h2>
        </div>

        <div class="dashboard-card" style="background: #fff; padding: 40px; border-radius: 28px; border: 1px solid #eef2ed; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
    <h3 style="margin: 0 0 10px 0; font-weight: 900; color: #41644A; letter-spacing: 1px; font-size: 1.2rem; text-transform: uppercase;">
        STOK PULLET TERSEDIA
    </h3>
    
    <div id="stokPulletTersedia" style="font-size: 3rem; font-weight: 1200; color: #6CA651; line-height: 1; margin: 10px 0;">
        0
    </div>
    
    <div style="font-size: 1.2rem; font-weight: 900; color: #41644A; text-transform: uppercase; letter-spacing: 2px;">
        EKOR
    </div>
</div>

        <div class="main-content-card" style="background: white; padding: 40px; border-radius: 35px; border: 1px solid #e0eadd; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 25px;">
                <div style="background: #f0f7f0; padding: 20px; border-radius: 20px; text-align: center;">
                    <label style="display: block; font-weight: 900; font-size: 0.8rem; margin-bottom: 10px;">JADI PEJANTAN</label>
                    <input type="number" id="inputPejantan" value="0" style="width: 100%; padding: 10px; border-radius: 10px; border: 2px solid #6CA651; text-align: center; font-weight: 900;">
                </div>
                <div style="background: #f0f7f0; padding: 20px; border-radius: 20px; text-align: center;">
                    <label style="display: block; font-weight: 900; font-size: 0.8rem; margin-bottom: 10px;">JADI PETELUR</label>
                    <input type="number" id="inputPetelur" value="0" style="width: 100%; padding: 10px; border-radius: 10px; border: 2px solid #6CA651; text-align: center; font-weight: 900;">
                </div>
                <div style="background: #fdfaf0; padding: 20px; border-radius: 20px; text-align: center;">
                    <label style="display: block; font-weight: 900; font-size: 0.8rem; margin-bottom: 10px;">TETAP JADI PULLET</label>
                    <input type="number" id="inputStay" value="0" style="width: 100%; padding: 10px; border-radius: 10px; border: 2px solid #f39c12; text-align: center; font-weight: 900;">
                </div>
            </div>

            <div style="background: #f1f5f9; padding: 20px; border-radius: 18px; text-align: center; border: 1px dashed #475569; margin-bottom: 25px;">
                <span style="font-weight: 800; color: #475569;">SISA KE AYAM PEDAGING KONSUMSI: <span id="autoKonsumsi" style="color: #1f3326; font-size: 1.2rem;">0</span> EKOR</span>
            </div>

            <button id="btnKonfirmasiPullet" style="width: 100%; padding: 22px; background: #1f3326; color: white; border: none; border-radius: 20px; font-weight: 1200; font-size: 1.1rem; cursor: pointer;">
                KONFIRMASI DISTRIBUSI MATANG
            </button>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const inputs = ['inputPejantan', 'inputPetelur', 'inputStay'];
    const autoKonsumsi = document.getElementById('autoKonsumsi');
    const stokDisplay = document.getElementById('stokPulletTersedia');
    const btnSubmit = document.getElementById('btnKonfirmasiPullet');
    let currentPulletStok = 0;

    const refreshUI = () => {
        const totalInput = inputs.reduce((sum, id) => sum + (parseInt(document.getElementById(id).value) || 0), 0);
        const sisaKonsumsi = Math.max(0, currentPulletStok - totalInput);
        autoKonsumsi.innerText = sisaKonsumsi.toLocaleString();

        if (totalInput > currentPulletStok) {
            btnSubmit.disabled = true;
            btnSubmit.style.opacity = '0.5';
            autoKonsumsi.innerText = "OVER!";
        } else {
            btnSubmit.disabled = false;
            btnSubmit.style.opacity = '1';
        }
    };

    const presenter = new PulletPresenter({
      onDataReady: (cat) => document.getElementById('displayCategoryName').innerText = cat.nama,
      onPulletReady: (pullet) => {
        currentPulletStok = pullet.stok;
        stokDisplay.innerText = currentPulletStok.toLocaleString();
        refreshUI();
      }
    });

    inputs.forEach(id => document.getElementById(id).oninput = refreshUI);

    btnSubmit.onclick = async () => {
        const payload = {
            kategori_id: window.location.hash.split('-').slice(1).join('-'),
            pejantan: parseInt(document.getElementById('inputPejantan').value) || 0,
            petelur: parseInt(document.getElementById('inputPetelur').value) || 0,
            stay: parseInt(document.getElementById('inputStay').value) || 0,
            pedaging: parseInt(autoKonsumsi.innerText) || 0
        };

        const res = await presenter.submitPulletProcess(payload);
        if (res.status === 'success') {
            alert("Distribusi Pullet Berhasil! ✨");
            location.hash = '#/pembibitan';
        }
    };

    await presenter.init();
  }
};
export default Pullet;