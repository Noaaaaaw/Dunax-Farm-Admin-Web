import { CONFIG } from '../../config.js';

class DocPresenter {
  constructor({ onDataReady, onDocReady }) {
    this.onDataReady = onDataReady;
    this.onDocReady = onDocReady;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init() {
    try {
      const hash = window.location.hash.slice(1);
      const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : '';

      // Narik detail kategori buat dapet stok produk di dalamnya
      const response = await fetch(`${this.baseUrl}/commodities/${categoryId}`);
      const result = await response.json();

      if (result.status === 'success') {
        this.onDataReady(result.data);
        
        // Cari item DOC/DOD di dalam kategori ini
        const docItem = result.data.details.find(p => 
          p.nama.toUpperCase().includes('DOC') || p.nama.toUpperCase().includes('DOD')
        );
        this.onDocReady(docItem || { stok: 0 });
      }
    } catch (err) {
      console.error("Doc Presenter Error:", err);
    }
  }

  async submitDocProcess(payload) {
    // Ngirim payload: kategori_id, jumlah_hidup, jumlah_mati
    const response = await fetch(`${this.baseUrl}/api/doc/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  }
}

export default DocPresenter;