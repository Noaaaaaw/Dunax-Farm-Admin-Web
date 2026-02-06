import SettingProdukPresenter from './setting-produk-presenter.js';

const SettingProdukPage = {
  async render() {
    return `
      <div id="settingProdukContainer" class="page-content" style="padding: 20px; min-height: 100vh; background: #fcfdfc;">
        <div style="padding: 100px; text-align: center; color: #aaa;">
          <p>Menyiapkan halaman...</p>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const hash = window.location.hash.slice(1); 
    const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : null;
    const container = document.getElementById('settingProdukContainer');

    if (!categoryId) {
      container.innerHTML = `<div style="padding: 50px; text-align: center;"><button onclick="location.hash='#/jual-komoditas'">Balik ke Menu</button></div>`;
      return;
    }
    
    const presenter = new SettingProdukPresenter({ container, categoryId });
    await presenter.init();
  }
};

export default SettingProdukPage;