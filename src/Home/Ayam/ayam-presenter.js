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

      // 1. Ambil Info Kategori
      const resCat = await fetch(`${this.baseUrl}/commodities/${categoryId}`);
      const resultCat = await resCat.json();

      // 2. AMBIL DATA HISTORI PULLET (AUDIT TRAIL)
      // Kita butuh data dari maturity_process buat nampilin hasil seleksi terakhir
      const resHistory = await fetch(`${this.baseUrl}/api/pullet/history`); // Pastikan route ini ada di server lu
      const resultHistory = await resHistory.json();

      if (resultCat.status === 'success') {
        this.onDataReady(resultCat.data);

        // Cari data terbaru untuk kategori ini di tabel maturity_process
        const latestProcess = resultHistory.data
          .filter(h => h.kategori_id === categoryId)
          .sort((a, b) => new Date(b.tanggal_proses) - new Date(a.tanggal_proses))[0];

        // Tampilkan angka 20 sesuai di database lu
        const stokJantan = latestProcess ? latestProcess.hasil_pejantan : 0;
        const stokBetina = latestProcess ? latestProcess.hasil_petelur : 0;

        this.onStockReady({ 
          pejantan: stokJantan, 
          petelur: stokBetina 
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