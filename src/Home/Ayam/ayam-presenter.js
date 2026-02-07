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

      // Tarik 3 Data Sekaligus: Kategori, Sortir Pullet, Asset Baru, dan Penjualan
      const [resCat, resMaturity, resAssetBaru, resProduction] = await Promise.all([
        fetch(`${this.baseUrl}/commodities/${categoryId}`),
        fetch(`${this.baseUrl}/api/pullet/history`),      // Hasil sortir internal
        fetch(`${this.baseUrl}/api/asset-baru/history`),  // Pembelian asset luar
        fetch(`${this.baseUrl}/api/production/history`)   // Pengurangan karena jual
      ]);

      const resultCat = await resCat.json();
      const resultMaturity = await resMaturity.json();
      const resultAsset = await resAssetBaru.json();
      const resultProduction = await resProduction.json();

      if (resultCat.status === "success") {
        this.onDataReady(resultCat.data);

        // 1. HITUNG MASUK DARI SORTIR PULLET (INTERNAL)
        const masukInternalJantan = resultMaturity.data
          .filter((m) => m.kategori_id === categoryId)
          .reduce((sum, m) => sum + (parseInt(m.hasil_pejantan) || 0), 0);

        const masukInternalBetina = resultMaturity.data
          .filter((m) => m.kategori_id === categoryId)
          .reduce((sum, m) => sum + (parseInt(m.hasil_petelur) || 0), 0);

        // 2. HITUNG MASUK DARI ASSET BARU (EKSTERNAL)
        // Filter ID kategori (waspadai 'asset-ayam' vs 'ayam')
        const masukEksternalJantan = resultAsset.data
          .filter((a) => a.kategori_id.includes(categoryId) && a.produk === 'AYAM PEJANTAN')
          .reduce((sum, a) => sum + (parseInt(a.jumlah) || 0), 0);

        const masukEksternalBetina = resultAsset.data
          .filter((a) => a.kategori_id.includes(categoryId) && a.produk === 'AYAM BETINA')
          .reduce((sum, a) => sum + (parseInt(a.jumlah) || 0), 0);

        // 3. HITUNG KELUAR (PENJUALAN/DIPOTONG)
        const totalKeluarJantan = resultProduction.data
          .filter((p) => p.kategori_id === categoryId)
          .reduce((sum, p) => sum + (parseInt(p.pejantan_dijual) || 0), 0);

        const totalKeluarBetina = resultProduction.data
          .filter((p) => p.kategori_id === categoryId)
          .reduce((sum, p) => sum + (parseInt(p.petelur_dijual) || 0), 0);

        // 4. LOGIKA SALDO AKHIR MENTERENG
        // (Internal + Eksternal) - Keluar
        const saldoJantan = (masukInternalJantan + masukEksternalJantan) - totalKeluarJantan;
        const saldoBetina = (masukInternalBetina + masukEksternalBetina) - totalKeluarBetina;

        this.onStockReady({
          pejantan: Math.max(0, saldoJantan),
          petelur: Math.max(0, saldoBetina),
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