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

      <div class="page-header-card" style="background: white !important; margin-bottom: 30px !important; padding: 40px 20px; border-radius: 24px; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
        <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; font-weight: normal; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">
          SETTING PRODUK ${displayTitle}
        </h1>
      </div>

      <div id="productGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; align-items: stretch; padding: 10px 0;">
         <div style="padding: 100px; text-align: center; grid-column: 1/-1; color: #6CA651; font-weight: 800;">
            <p>⏳ Menghubungkan ke database...</p>
         </div>
      </div>
    `;

    try {
      const response = await fetch(`${this.baseUrl}/commodities/${this.categoryId}`);
      const result = await response.json();
      
      if (result.status === 'success' && result.data.details.length > 0) {
        this._renderProducts(result.data.details);
      } else {
        this._renderEmptyState();
      }
    } catch (err) {
      console.error("Gagal load produk:", err);
      document.getElementById('productGrid').innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #e74c3c; font-weight: 800;">⚠️ Gagal konek ke Server!</div>`;
    }
  }

  _renderProducts(products) {
    const grid = document.getElementById('productGrid');
    
    grid.innerHTML = products.map((p) => `
      <div class="setting-card" id="card-${p.id}" style="background: white; padding: 40px 30px; border-radius: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #e0eadd; position: relative; display: flex; flex-direction: column;">
        
        <button class="delete-prod-btn" data-id="${p.id}" data-nama="${p.nama}" 
                style="position: absolute; top: 20px; right: 20px; background: #fee2e2; border: none; width: 35px; height: 35px; border-radius: 50%; color: #dc2626; font-weight: 900; cursor: pointer;">
          &times;
        </button>

        <h3 style="font-size: 1.6rem; margin-bottom: 25px; color: #1f3326; font-weight: 900;">${p.nama}</h3>
        
        <div style="display: flex; gap: 15px; margin-bottom: 25px;">
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.65rem; font-weight: 900; color: #4a5a4d; margin-bottom: 8px; text-transform: uppercase;">Harga (Rp)</label>
            <input type="number" class="prod-harga" value="${p.harga}" disabled style="width: 100%; padding: 14px; border: 2px solid #f4f6f4; background: #f9fbf9; border-radius: 12px; font-weight: 800; text-align: center; transition: 0.3s;">
          </div>
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.65rem; font-weight: 900; color: #4a5a4d; margin-bottom: 8px; text-transform: uppercase;">Stok (Sistem)</label>
            <input type="number" class="prod-stok" value="${p.stok}" disabled style="width: 100%; padding: 14px; border: 2px solid #f4f6f4; background: #f1f3f1; border-radius: 12px; font-weight: 800; text-align: center; color: #888; cursor: not-allowed;">
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: center; background: #f1f8f1; padding: 12px; border-radius: 15px; margin-bottom: 25px; gap: 10px; border: 1px solid #eef2ed;">
            <span style="font-size: 0.85rem; font-weight: 800; color: #6CA651;">Status Jual</span>
            <input type="checkbox" class="prod-aktif" ${p.aktif ? 'checked' : ''} disabled style="width: 18px; height: 18px; accent-color: #6CA651;">
        </div>

        <button class="edit-btn" data-id="${p.id}" 
                style="width: 100%; padding: 16px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer; transition: 0.3s;">Edit Data</button>
      </div>
    `).join('');

    this._addBackButton(grid);
    this._bindEvents();
  }

  _bindEvents() {
    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.dataset.id;
        const card = this.container.querySelector(`#card-${id}`);
        const inputHarga = card.querySelector('.prod-harga');
        const inputAktif = card.querySelector('.prod-aktif');
        const inputStok = card.querySelector('.prod-stok'); //
        
        if (e.target.innerText !== 'SIMPAN') {
          // Buka akses input kecuali STOK
          inputHarga.disabled = false;
          inputAktif.disabled = false;
          inputStok.disabled = true; // Tetap kunci stok
          
          inputHarga.style.background = '#fff';
          inputHarga.style.borderColor = '#6CA651';
          
          e.target.innerText = 'SIMPAN'; 
          e.target.style.background = '#f39c12';
        } else {
          this._handleSave(card, id);
        }
      };
    });

    this.container.querySelectorAll('.delete-prod-btn').forEach(btn => {
      btn.onclick = async (e) => {
        const { id, nama } = e.currentTarget.dataset;
        if (confirm(`Hapus "${nama}" permanen?`)) await this._deleteProduct(id);
      };
    });
  }

  async _handleSave(card, id) {
    const payload = {
      id: id,
      harga: Number(card.querySelector('.prod-harga').value),
      stok: Number(card.querySelector('.prod-stok').value), // Mengirim nilai stok lama
      aktif: card.querySelector('.prod-aktif').checked
    };

    try {
      const res = await fetch(`${this.baseUrl}/api/commodities/update-product`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      if ((await res.json()).status === 'success') {
        alert('Data Terupdate! ✨');
        this.init(); 
      }
    } catch (err) { alert('Gagal simpan!'); }
  }

  async _deleteProduct(productId) {
    try {
      const res = await fetch(`${this.baseUrl}/api/commodities/delete-product/${productId}`, { method: 'DELETE' });
      if ((await res.json()).status === 'success') { alert("Terhapus! 🗑️"); await this.init(); }
    } catch (err) { alert('Gagal hapus.'); }
  }

  _renderEmptyState() {
    document.getElementById('productGrid').innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 80px; background: white; border-radius: 30px; border: 2px dashed #eef2ed;"><p style="color: #666; font-weight: bold; font-size: 1.2rem;">Kosong, bro! 📦</p></div>`;
  }

  _addBackButton(grid) {
    const backBtn = document.createElement('div');
    backBtn.style.cssText = 'text-align: center; margin-top: 50px; grid-column: 1/-1;';
    grid.after(backBtn);
  }
}

export default SettingProdukPresenter;