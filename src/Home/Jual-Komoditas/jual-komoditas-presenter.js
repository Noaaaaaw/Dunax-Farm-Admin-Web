class JualKomoditasPresenter {
  constructor({ onDataReady }) {
    this.onDataReady = onDataReady;
    this.baseUrl = 'http://localhost:5000';
    this._lastData = []; // State untuk menyimpan data kategori terakhir guna keperluan Edit
  }

  async init() {
    try {
      // 1. BERSIHIN SAMPAH LOKAL (Key lama yang sudah tidak terpakai)
      const oldKeys = ['STATUS_KATEGORI_AYAM', 'STATUS_KATEGORI_BEBEK', 'STATUS_KATEGORI_IKAN', 'STATUS_KATEGORI_KAMBING', 'STATUS_KATEGORI_SAPI', 'STATUS_KATEGORI_SAYUR'];
      oldKeys.forEach(key => localStorage.removeItem(key));

      // 2. AMBIL DATA REAL DARI SERVER (Sekarang berisi URL Foto & Keterangan)
      const response = await fetch(`${this.baseUrl}/commodities`);
      const result = await response.json();
      const categories = result.data;
      const commoditiesStatus = {};

      const realData = categories.map(cat => {
        const details = cat.details || [];
        
        // Kalkulasi Total Stok dari semua produk di dalam kategori ini
        const totalStokKategori = details.reduce((acc, curr) => acc + (curr.stok || 0), 0);
        
        // Kategori dianggap aktif dijual jika minimal ada satu produk di dalamnya yang aktif
        const statusOtomatis = details.some(item => item.aktif === true);
        
        commoditiesStatus[cat.id.toLowerCase()] = statusOtomatis;

        return { 
          id: cat.id, 
          nama: cat.nama, 
          totalStok: totalStokKategori, 
          aktif: statusOtomatis,
          foto: cat.foto, // Sekarang berisi URL Public (Teks pendek)
          keterangan: cat.keterangan // Deskripsi lengkap kategori
        };
      });

      this._lastData = realData; // Simpan ke state internal untuk modal Edit
      localStorage.setItem('COMMODITIES_STATUS', JSON.stringify(commoditiesStatus));
      
      if (this.onDataReady) this.onDataReady(realData);
    } catch (err) {
      console.error("Gagal load data kategori dari cloud:", err);
      if (this.onDataReady) this.onDataReady([]);
    }
  }

  // UPDATE KATEGORI LENGKAP: Nama, Foto URL, & Keterangan
  async updateCategory(payload) {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) // Payload berisi ID dan link URL storage
      });
      const result = await response.json();
      
      await this.init(); // Auto-refresh tampilan Card di UI
      return result;
    } catch (err) { 
      return { status: 'error', message: 'Gagal update kategori ke cloud server' }; 
    }
  }

  // TAMBAH KATEGORI BARU
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