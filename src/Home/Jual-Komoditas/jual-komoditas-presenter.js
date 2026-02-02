import { CONFIG } from '../../config.js';

class JualKomoditasPresenter {
  constructor({ onDataReady }) {
    this.onDataReady = onDataReady;
    // GANTI: Gunakan BASE_URL dari Railway
    this.baseUrl = CONFIG.BASE_URL; 
    this._lastData = []; 
  }

  async init() {
    try {
      // 1. BERSIHKAN LOKAL STORAGE (Maintenance kunci lama)
      const oldKeys = ['STATUS_KATEGORI_AYAM', 'STATUS_KATEGORI_BEBEK', 'STATUS_KATEGORI_IKAN', 'STATUS_KATEGORI_KAMBING', 'STATUS_KATEGORI_SAPI', 'STATUS_KATEGORI_SAYUR'];
      oldKeys.forEach(key => localStorage.removeItem(key));

      // 2. AMBIL DATA DARI CLOUD (Sudah mendukung Foto & Keterangan)
      const response = await fetch(`${this.baseUrl}/commodities`);
      const result = await response.json();
      
      if (result.status !== 'success') throw new Error('Data gagal ditarik');

      const categories = result.data;
      const commoditiesStatus = {};

      const realData = categories.map(cat => {
        const details = cat.details || [];
        
        // Kalkulasi Stok Otomatis dari Supabase
        const totalStokKategori = details.reduce((acc, curr) => acc + (Number(curr.stok) || 0), 0);
        
        // Cek status aktif berdasarkan produk di dalamnya
        const statusOtomatis = details.some(item => item.aktif === true);
        
        commoditiesStatus[cat.id.toLowerCase()] = statusOtomatis;

        return { 
          id: cat.id, 
          nama: cat.nama, 
          totalStok: totalStokKategori, 
          aktif: statusOtomatis,
          foto: cat.foto, // URL Public Storage
          keterangan: cat.keterangan 
        };
      });

      this._lastData = realData; 
      localStorage.setItem('COMMODITIES_STATUS', JSON.stringify(commoditiesStatus));
      
      if (this.onDataReady) this.onDataReady(realData);
    } catch (err) {
      console.error("Gagal load data kategori dari cloud:", err);
      if (this.onDataReady) this.onDataReady([]);
    }
  }

  // UPDATE KATEGORI: Kirim perubahan ke API Railway
  async updateCategory(payload) {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      await this.init(); // Refresh UI otomatis
      return result;
    } catch (err) { 
      return { status: 'error', message: 'Gagal update kategori ke cloud server' }; 
    }
  }

  // TAMBAH KATEGORI BARU KE SUPABASE VIA RAILWAY
  async addCategory(payload) {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      await this.init(); 
      return result;
    } catch (err) { 
      return { status: 'error', message: 'Gagal tambah kategori ke cloud server' }; 
    }
  }

  // TAMBAH PRODUK BARU (Misal: Nambah 'Ayam Broiler' ke kategori 'Ayam')
  async addProduct(payload) {
    try {
      const response = await fetch(`${this.baseUrl}/api/commodities/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      await this.init(); 
      return result;
    } catch (err) { 
      return { status: 'error', message: 'Koneksi cloud bermasalah' }; 
    }
  }

  // HAPUS KATEGORI SECARA PERMANEN
  async deleteCategory(id) {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories/delete/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      await this.init(); 
      return result;
    } catch (err) { 
      return { status: 'error', message: 'Gagal hapus kategori' }; 
    }
  }
}

export default JualKomoditasPresenter;