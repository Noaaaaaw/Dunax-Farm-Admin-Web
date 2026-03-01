import { CONFIG } from '../../config.js';

class TetasPresenter {
  constructor({ onDataReady, onUpdateUI }) {
    this.onDataReady = onDataReady;
    this.onUpdateUI = onUpdateUI;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init() {
    const hash = window.location.hash.slice(1);
    const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : '';
    
    try {
      // Pastikan URL API sudah benar dan mendukung kategori
      const [resCat, resMesin] = await Promise.all([
        fetch(`${this.baseUrl}/commodities/${categoryId}`),
        fetch(`${this.baseUrl}/api/mesin-tetas/status/${categoryId}`)
      ]);
      
      const cat = await resCat.json();
      const mesin = await resMesin.json();
      
      if (cat.status === 'success') this.onDataReady(cat.data);
      
      // Mengirimkan data mesin ke UI untuk proses reset dan render ulang
      if (mesin.status === 'success') this.onUpdateUI(mesin.data);
      
    } catch (err) { 
      console.error("Tetas Presenter Error:", err); 
    }
  }
  
  // Fungsi ini dipanggil saat tombol "SIMPAN & MULAI" diklik
  // Bertujuan untuk mengisi 'mulai_proses_tgl' di DB
  async startProcess(payload) {
    try {
      const res = await fetch(`${this.baseUrl}/api/mesin-tetas/start-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }

  // Fungsi untuk konfirmasi panen atau pindah antar slot
  async moveMesin(payload) {
    try {
      const res = await fetch(`${this.baseUrl}/api/mesin-tetas/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }
}

export default TetasPresenter;