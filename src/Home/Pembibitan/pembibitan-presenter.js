import { CONFIG } from '../../config.js';

class PembibitanPresenter {
  constructor({ onDataReady }) {
    this.onDataReady = onDataReady;
    this.baseUrl = CONFIG.BASE_URL;
    this._lastData = [];
  }

  async init() {
    try {
      // 1. AMBIL DAFTAR KATEGORI DARI API
      const response = await fetch(`${this.baseUrl}/commodities`);
      const result = await response.json();
      
      if (result.status !== 'success') throw new Error('Data gagal ditarik');

      // Ambil datanya buat dikirim ke UI
      const categories = result.data;
      this._lastData = categories; 
      
      if (this.onDataReady) this.onDataReady(categories);
    } catch (err) {
      console.error("Gagal load kategori pembibitan:", err);
      if (this.onDataReady) this.onDataReady([]);
    }
  }
}

export default PembibitanPresenter;