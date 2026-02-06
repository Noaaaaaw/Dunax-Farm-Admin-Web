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

      const [resCat, resMaturity, resProduction] = await Promise.all([
        fetch(`${this.baseUrl}/commodities/${categoryId}`),
        fetch(`${this.baseUrl}/api/pullet/history`),
        fetch(`${this.baseUrl}/api/production/history`) // WAJIB BUAT ROUTE INI DI SERVER
      ]);

      const resultCat = await resCat.json();
      const resultMaturity = await resMaturity.json();
      const resultProduction = await resProduction.json();

      if (resultCat.status === "success") {
        this.onDataReady(resultCat.data);

        // 1. Cari data TERAKHIR dari proses produksi (Penjualan)
        const latestProduction = resultProduction.data
          .filter((p) => p.kategori_id === categoryId)
          .sort((a, b) => new Date(b.tanggal_proses) - new Date(a.tanggal_proses))[0];

        // 2. Cari data TERAKHIR dari proses maturity (Seleksi Pullet)
        const latestMaturity = resultMaturity.data
          .filter((m) => m.kategori_id === categoryId)
          .sort((a, b) => new Date(b.tanggal_proses) - new Date(a.tanggal_proses))[0];

        let stokJantan = 0;
        let stokBetina = 0;

        // LOGIKA SAKTI: Cek apakah sudah pernah ada penjualan?
        if (latestProduction) {
          // Kalau sudah pernah jual, pake angka sisa terakhir (15 ekor)
          stokJantan = latestProduction.sisa_pejantan_simpan;
          stokBetina = latestProduction.sisa_petelur_simpan;
        } else if (latestMaturity) {
          // Kalau belum pernah jual, pake angka awal (20 ekor)
          stokJantan = latestMaturity.hasil_pejantan;
          stokBetina = latestMaturity.hasil_petelur;
        }

        this.onStockReady({
          pejantan: stokJantan,
          petelur: stokBetina,
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