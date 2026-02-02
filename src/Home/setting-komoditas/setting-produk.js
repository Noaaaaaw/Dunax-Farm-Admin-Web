import SettingProdukPresenter from './setting-produk-presenter.js';

const SettingProdukPage = {
  async render() {
    // 1. CONTAINER UTAMA
    // Gue tambahin padding top biar gak mentok sama navbar Dunax Farm lo
    return `
      <div id="settingProdukContainer" class="page-content" style="padding: 20px; min-height: 100vh; background: #fcfdfc;">
        <div style="padding: 100px; text-align: center; color: #aaa;">
          <p>Menyiapkan halaman pengaturan...</p>
        </div>
      </div>
    `;
  },

  async afterRender() {
    // 2. LOGIKA AMBIL ID DARI URL (Dynamic Routing)
    // Contoh: #/setting-ayam-pedaging -> split ambil 'ayam-pedaging'
    const hash = window.location.hash.slice(1); 
    const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : null;

    const container = document.getElementById('settingProdukContainer');

    // 3. VALIDASI ID
    if (!categoryId) {
      container.innerHTML = `
        <div style="padding: 50px; text-align: center; color: #e74c3c;">
          <h2 style="font-weight: 800;">ID KATEGORI TIDAK DITEMUKAN</h2>
          <p>Waduh bro, kodenya gak kebaca. Balik ke Manajemen Komoditas dulu yuk.</p>
          <button onclick="location.hash='#/jual-komoditas'" style="margin-top: 20px; padding: 12px 25px; background: #41644A; color: white; border: none; border-radius: 12px; cursor: pointer;">
            Balik ke Menu
          </button>
        </div>
      `;
      return;
    }
    
    // 4. JALANKAN PRESENTER
    // Presenter sekarang otomatis nampilin Header duluan lewat init()
    const presenter = new SettingProdukPresenter({ container, categoryId });
    await presenter.init();
  }
};

export default SettingProdukPage;