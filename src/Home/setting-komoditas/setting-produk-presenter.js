import { CONFIG } from '../../config.js'; 

class SettingProdukPresenter {
  constructor({ container, categoryId }) {
    this.container = container;
    this.categoryId = categoryId;
    this.baseUrl = 'http://localhost:5000';
  }

  async init() {
    const displayTitle = this.categoryId.replace(/-/g, ' ').toUpperCase();

    this.container.style.background = 'transparent';
    this.container.style.padding = '0';
    this.container.style.boxShadow = 'none';
    this.container.style.border = 'none';

    this.container.innerHTML = `
      <div class="page-header-card" style="background: white !important; margin-bottom: 30px !important;">
        <h1>SETTING PRODUK ${displayTitle}</h1>
        <p>Atur stok persediaan dan harga produk kategori ${displayTitle} secara real-time melalui sistem Cloud.</p>
      </div>

      <div id="productGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; align-items: stretch; padding: 10px 0; background: transparent !important;">
         <div style="padding: 100px; text-align: center; grid-column: 1/-1; color: #888; font-weight: 600;">
            Menghubungkan ke database cloud...
         </div>
      </div>
    `;

    try {
      const response = await fetch(`${this.baseUrl}/commodities/${this.categoryId}`);
      const result = await response.json();
      
      if (result.status === 'success' && result.data.details.length > 0) {
        this._renderProducts(result.data.details);
      } else {

        document.getElementById('productGrid').innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 80px; background: white; border-radius: 30px; border: 2px dashed #eef2ed;">
            <p style="color: #666; font-weight: bold; font-size: 1.2rem;">Belum ada produk di kategori ini, bro! 📦</p>
            <button onclick="location.hash='#/jual-komoditas'" style="margin-top: 20px; padding: 15px 30px; background: #41644A; color: white; border: none; border-radius: 15px; cursor: pointer; font-weight: 800;">Tambah Produk Baru</button>
          </div>`;
      }
    } catch (err) {
      document.getElementById('productGrid').innerHTML = `<p style="text-align: center; color: red; grid-column: 1/-1; padding: 40px;">⚠️ Gagal konek ke server!</p>`;
    }
  }

  _renderProducts(products) {
    const grid = document.getElementById('productGrid')
    
    grid.innerHTML = products.map((p, index) => `
      <div class="setting-card" id="card-${index}" style="background: white !important; padding: 40px 30px !important; border-radius: 32px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.04) !important; border: 1px solid #e0eadd !important; position: relative; display: flex; flex-direction: column; transition: 0.3s;">
        
        <button class="delete-prod-btn" data-id="${p.id}" data-nama="${p.nama}" 
                style="position: absolute; top: 20px; right: 20px; background: #fee2e2; border: none; width: 35px; height: 35px; border-radius: 50%; color: #dc2626; font-weight: 900; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          &times;
        </button>

        <h3 style="font-size: 1.8rem; margin-bottom: 30px; color: #1f3326; font-weight: 900; letter-spacing: -0.5px;">${p.nama}</h3>
        
        <div style="display: flex; gap: 15px; margin-bottom: 25px;">
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.7rem; font-weight: 950; color: #4a5a4d; margin-bottom: 10px; text-transform: uppercase;">Harga (Rp)</label>
            <input type="number" class="prod-harga" value="${p.harga}" disabled style="width: 100%; padding: 16px; border: 2px solid #f4f6f4; background: #f9fbf9; border-radius: 15px; font-weight: 800; text-align: center; color: #1f3326;">
          </div>
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.7rem; font-weight: 950; color: #4a5a4d; margin-bottom: 10px; text-transform: uppercase;">Stok</label>
            <input type="number" class="prod-stok" value="${p.stok}" disabled style="width: 100%; padding: 16px; border: 2px solid #f4f6f4; background: #f9fbf9; border-radius: 15px; font-weight: 800; text-align: center; color: #1f3326;">
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: center; background: #f1f5f2; padding: 14px; border-radius: 18px; margin-bottom: 30px; gap: 12px;">
            <span style="font-size: 0.9rem; font-weight: 800; color: #41644A;">Status Aktif</span>
            <input type="checkbox" class="prod-aktif" ${p.aktif ? 'checked' : ''} disabled style="width: 18px; height: 18px; accent-color: #41644A;">
        </div>

        <button class="edit-btn" data-id="${p.id}" data-index="${index}" 
                style="width: 100%; padding: 18px; background: #41644A; color: white; border: none; border-radius: 18px; font-weight: 900; font-size: 1rem; cursor: pointer; transition: 0.3s; letter-spacing: 0.5px;">Edit Stok & Harga</button>
      </div>
    `).join('');

    const backBtnContainer = document.createElement('div');
    backBtnContainer.style.cssText = 'text-align: center; margin-top: 60px; grid-column: 1/-1; background: transparent !important;';
    backBtnContainer.innerHTML = `
      <button onclick="location.hash='#/jual-komoditas'" style="padding: 18px 40px; background: #1f3326; color: white; border: none; border-radius: 20px; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 12px; transition: 0.3s;">
        <span>&larr;</span> Kembali ke Menu Manajemen
      </button>
    `;
    grid.after(backBtnContainer);

    this._bindEvents();
  }

  _bindEvents() {
    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = (e) => {
        const index = e.target.dataset.index;
        const card = this.container.querySelector(`#card-${index}`);
        const inputs = card.querySelectorAll('input');
        
        if (e.target.innerText !== 'SIMPAN PERUBAHAN') {
          inputs.forEach(i => { 
            i.disabled = false; 
            i.style.background = '#fff'; 
            i.style.borderColor = '#41644A'; 
          });
          e.target.innerText = 'SIMPAN PERUBAHAN'; 
          e.target.style.background = '#f39c12';
        } else {
          const hVal = card.querySelector('.prod-harga').value;
          const sVal = card.querySelector('.prod-stok').value;
          if (!hVal || !sVal) return alert("Waduh, data gak boleh kosong!");

          this._saveToServer({ 
            id: e.target.dataset.id, 
            harga: Number(hVal), 
            stok: Number(sVal), 
            aktif: card.querySelector('.prod-aktif').checked 
          });
        }
      };
    });

    this.container.querySelectorAll('.delete-prod-btn').forEach(btn => {
      btn.onclick = async (e) => {
        const { id, nama } = e.currentTarget.dataset;
        if (confirm(`Yakin hapus produk "${nama}"? Data bakal hilang permanen.`)) {
            await this._deleteProduct(id);
        }
      };
    });
  }

  async _saveToServer(payload) {
    try {
      const res = await fetch(`${this.baseUrl}/api/commodities/update-product`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      const result = await res.json();
      if (result.status === 'success') { 
        alert('Mantap! Data cloud sudah terupdate 🚀');
        this.init(); 
      }
    } catch (err) { alert('Gagal simpan! Cek koneksi backend.'); }
  }

  async _deleteProduct(productId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/commodities/delete-product/${productId}`, { 
        method: 'DELETE' 
      });
      const result = await response.json();
      if (result.status === 'success') { 
        alert("Produk Berhasil Dihapus! 🗑️"); 
        await this.init(); 
      }
    } catch (err) { alert('Gagal hapus! Masalah koneksi.'); }
  }
}

export default SettingProdukPresenter;