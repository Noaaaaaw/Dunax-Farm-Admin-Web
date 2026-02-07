import { CONFIG } from "../../config.js";

class AyamPresenter {
  constructor({ onDataReady, onStockReady }) {
    this.onDataReady = onDataReady;
    this.onStockReady = onStockReady;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init() {
    try {
      const hash = window.location.hash.slice(1);
      const categoryId = hash.includes("-") ? hash.split("-").slice(1).join("-") : "";

      // Tarik semua data histori sekaligus
      const [resCat, resMaturity, resProduction] = await Promise.all([
        fetch(`${this.baseUrl}/commodities/${categoryId}`),
        fetch(`${this.baseUrl}/api/pullet/history`),
        fetch(`${this.baseUrl}/api/production/history`)
      ]);

      const resultCat = await resCat.json();
      const resultMaturity = await resMaturity.json();
      const resultProduction = await resProduction.json();

      if (resultCat.status === "success") {
        this.onDataReady(resultCat.data);

        // 1. HITUNG TOTAL MASUK (Semua hasil pejantan/petelur dari proses Pullet)
        const totalMasukJantan = resultMaturity.data
          .filter((m) => m.kategori_id === categoryId)
          .reduce((sum, m) => sum + (parseInt(m.hasil_pejantan) || 0), 0);

        const totalMasukBetina = resultMaturity.data
          .filter((m) => m.kategori_id === categoryId)
          .reduce((sum, m) => sum + (parseInt(m.hasil_petelur) || 0), 0);

        // 2. HITUNG TOTAL KELUAR (Semua ayam yang sudah dijual/jadi pedaging)
        const totalJualJantan = resultProduction.data
          .filter((p) => p.kategori_id === categoryId)
          .reduce((sum, p) => sum + (parseInt(p.pejantan_dijual) || 0), 0);

        const totalJualBetina = resultProduction.data
          .filter((p) => p.kategori_id === categoryId)
          .reduce((sum, p) => sum + (parseInt(p.petelur_dijual) || 0), 0);

        // 3. STOK AKHIR = TOTAL MASUK - TOTAL JUAL
        const stokJantanSekarang = Math.max(0, totalMasukJantan - totalJualJantan);
        const stokBetinaSekarang = Math.max(0, totalMasukBetina - totalJualBetina);

        this.onStockReady({
          pejantan: stokJantanSekarang,
          petelur: stokBetinaSekarang,
        });
      }
    } catch (err) {
      console.error("Ayam Presenter Error:", err);
    }
  }

  async submitAyamProcess(payload) {
    const response = await fetch(`${this.baseUrl}/api/production/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  }
}
export default AyamPresenter;