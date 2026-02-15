import { CONFIG } from '../../config.js';

class PembibitanPresenter {
  constructor({ onDataReady }) {
    this.onDataReady = onDataReady;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init() {
    try {
      const response = await fetch(`${this.baseUrl}/commodities`);
      const result = await response.json();
      
      if (result.status !== 'success') throw new Error('Gagal memuat data API');

      let categories = result.data;

      // URUTKAN: YANG AKTIF (TRUE) DULUAN
      categories.sort((a, b) => {
        if (a.aktif === b.aktif) return 0;
        return a.aktif ? -1 : 1; 
      });

      if (this.onDataReady) this.onDataReady(categories);
    } catch (err) {
      console.error("Error Presenter Pembibitan:", err);
      if (this.onDataReady) this.onDataReady([]);
    }
  }
}

export default PembibitanPresenter;