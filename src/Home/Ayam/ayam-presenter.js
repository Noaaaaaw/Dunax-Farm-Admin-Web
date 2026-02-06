import { CONFIG } from '../../config.js';

class AyamPresenter {
  constructor({ onDataReady, onStockReady }) {
    this.onDataReady = onDataReady;
    this.onStockReady = onStockReady;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init() {
    try {
      const hash = window.location.hash.slice(1);
      const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : '';

      // Narik data kategori & detail produk
      const response = await fetch(`${this.baseUrl}/commodities/${categoryId}`);
      const result = await response.json();

      if (result.status === 'success') {
        this.onDataReady(result.data);
        
        // Cari produk Pejantan & Petelur dengan logic kebal huruf besar/kecil
        const pejantan = result.data.details.find(p => 
          p.nama.toUpperCase().includes('PEJANTAN')
        ) || { stok: 0 };
        
        const petelur = result.data.details.find(p => 
          p.nama.toUpperCase().includes('PETELUR')
        ) || { stok: 0 };
        
        this.onStockReady({ 
          pejantan: pejantan.stok, 
          petelur: petelur.stok 
        });
      }
    } catch (err) {
      console.error("Ayam Presenter Error:", err);
    }
  }

  async submitAyamProcess(payload) {
    const response = await fetch(`${this.baseUrl}/api/production/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  }
}
export default AyamPresenter;