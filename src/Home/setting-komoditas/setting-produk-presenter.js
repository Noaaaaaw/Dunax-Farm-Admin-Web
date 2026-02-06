import { CONFIG } from '../../config.js';

class SettingProdukPresenter {
  constructor({ container, categoryId }) {
    this.container = container;
    this.categoryId = categoryId;
    this.baseUrl = CONFIG.BASE_URL; 
  }

  async init() {
    const displayTitle = this.categoryId.replace(/-/g, ' ').toUpperCase();
    this.container.style.cssText = 'background: transparent; padding: 0; boxShadow: none; border: none;';

    this.container.innerHTML = `
      <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">
      <div class="page-header-card" style="background: white !important; margin-bottom: 30px !important; padding: 40px 20px; border-radius: 24px; text-align: center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
        <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">
          SETTING PRODUK ${displayTitle}
        </h1>
      </div>
      <div id="productGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; padding: 10px 0;">
         <div style="padding: 100px; text-align: center; grid-column: 1/-1; color: #6CA651; font-weight: 800;">
            <p>⏳ Menghubungkan ke database...</p>
         </div>
      </div>
    `;

    try {
      // 1. Tarik Data Produk & Histori Hatchery Sekaligus
      const [resProd, resHistory] = await Promise.all([
        fetch(`${this.baseUrl}/commodities/${this.categoryId}`),
        fetch(`${this.baseUrl}/api/pembibitan/history`)
      ]);

      const resultProd = await resProd.json();
      const resultHistory = await resHistory.json();

      if (resultProd.status === 'success') {
        // Hitung total hasil_fertil_jual dari histori
        const totalFertilHistori = resultHistory.data
          .filter(h => h.kategori_id === this.categoryId)
          .reduce((sum, h) => sum + (parseInt(h.hasil_fertil_jual) || 0), 0);

        this._renderProducts(resultProd.data.details, totalFertilHistori);
      }
    } catch (err) {
      console.error("Gagal load:", err);
      document.getElementById('productGrid').innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #e74c3c;">⚠️ Server Error!</div>`;
    }
  }

  _renderProducts(products, totalFertilHistori) {
    const grid = document.getElementById('productGrid');
    
    grid.innerHTML = products.map((p) => {
      // LOGIKA SAKTI: Jika Telur Fertil minus, pakai data histori (70 butir)
      const isFertil = p.nama.toLowerCase().includes('fertil');
      const stokTampilan = (isFertil && p.stok < 0) ? totalFertilHistori : p.stok;
      const warningStyle = p.stok < 0 ? 'color: #e74c3c; border-color: #e74c3c;' : '';

      return `
      <div class="setting-card" id="card-${p.id}" style="background: white; padding: 40px 30px; border-radius: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #e0eadd; position: relative;">
        <h3 style="font-size: 1.6rem; margin-bottom: 25px; color: #1f3326; font-weight: 900;">${p.nama}</h3>
        
        <div style="display: flex; gap: 15px; margin-bottom: 25px;">
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.65rem; font-weight: 900; color: #4a5a4d; margin-bottom: 8px;">HARGA (RP)</label>
            <input type="number" class="prod-harga" value="${p.harga}" disabled style="width: 100%; padding: 14px; border: 2px solid #f4f6f4; background: #f9fbf9; border-radius: 12px; font-weight: 800; text-align: center;">
          </div>
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.65rem; font-weight: 900; color: #4a5a4d; margin-bottom: 8px;">STOK (SISTEM)</label>
            <input type="number" class="prod-stok" value="${stokTampilan}" disabled style="width: 100%; padding: 14px; border: 2px solid #f4f6f4; background: #f1f3f1; border-radius: 12px; font-weight: 800; text-align: center; ${warningStyle}">
            ${isFertil && p.stok < 0 ? `<small style="color: #e74c3c; font-size: 0.6rem; font-weight: 700;">*Direstorasi dari Histori</small>` : ''}
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: center; background: #f1f8f1; padding: 12px; border-radius: 15px; margin-bottom: 25px; gap: 10px; border: 1px solid #eef2ed;">
            <span style="font-size: 0.85rem; font-weight: 800; color: #6CA651;">Status Jual</span>
            <input type="checkbox" class="prod-aktif" ${p.aktif ? 'checked' : ''} disabled style="width: 18px; height: 18px; accent-color: #6CA651;">
        </div>

        <button class="edit-btn" data-id="${p.id}" 
                style="width: 100%; padding: 16px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer;">Edit Data</button>
      </div>`;
    }).join('');

    this._bindEvents();
  }

  _bindEvents() {
    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.dataset.id;
        const card = this.container.querySelector(`#card-${id}`);
        const inputs = card.querySelectorAll('input');
        
        if (e.target.innerText !== 'SIMPAN') {
          inputs.forEach(i => {
            i.disabled = false;
            i.style.background = '#fff';
            i.style.borderColor = '#6CA651';
          });
          e.target.innerText = 'SIMPAN'; 
          e.target.style.background = '#f39c12';
        } else {
          this._handleSave(card, id);
        }
      };
    });
  }

  async _handleSave(card, id) {
    const payload = {
      id: id,
      harga: Number(card.querySelector('.prod-harga').value),
      stok: Number(card.querySelector('.prod-stok').value), // Sekarang stok bisa diedit/diperbaiki
      aktif: card.querySelector('.prod-aktif').checked
    };

    try {
      const res = await fetch(`${this.baseUrl}/api/commodities/update-product`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      if ((await res.json()).status === 'success') {
        alert('Stok Berhasil Direstorasi! ✨');
        this.init(); 
      }
    } catch (err) { alert('Gagal simpan!'); }
  }
}
export default SettingProdukPresenter;