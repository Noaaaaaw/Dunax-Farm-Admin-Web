import { CONFIG } from "../../config.js";

class AyamPresenter {
  constructor({ onDataReady, onStockReady, onHealthReady }) {
    this.onDataReady = onDataReady;
    this.onStockReady = onStockReady;
    this.onHealthReady = onHealthReady;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init() {
    try {
      const hash = window.location.hash.slice(1);
      const categoryId = hash.includes("-") ? hash.split("-").slice(1).join("-") : "";

      const [resCat, resMaturity, resAssetBaru, resProduction, resLaporan] = await Promise.all([
        fetch(`${this.baseUrl}/commodities/${categoryId}`),
        fetch(`${this.baseUrl}/api/pullet/history`),
        fetch(`${this.baseUrl}/api/asset-baru/history`),
        fetch(`${this.baseUrl}/api/production/history`),
        fetch(`${this.baseUrl}/api/laporan`)
      ]);

      const resultCat = await resCat.json();
      const resultMaturity = await resMaturity.json();
      const resultAsset = await resAssetBaru.json();
      const resultProduction = await resProduction.json();
      const resultLap = await resLaporan.json();

      if (resultCat.status === "success") {
        this.onDataReady(resultCat.data);

        // 1. LOGIKA SALDO MENTERENG (STOK AKTIF SAAT INI)
        const masukInternalJantan = resultMaturity.data
          .filter((m) => m.kategori_id === categoryId)
          .reduce((sum, m) => sum + (parseInt(m.hasil_pejantan) || 0), 0);

        const masukInternalBetina = resultMaturity.data
          .filter((m) => m.kategori_id === categoryId)
          .reduce((sum, m) => sum + (parseInt(m.hasil_petelur) || 0), 0);

        const masukEksternalJantan = resultAsset.data
          .filter((a) => a.kategori_id.includes(categoryId) && a.produk === 'AYAM PEJANTAN')
          .reduce((sum, a) => sum + (parseInt(a.jumlah) || 0), 0);

        const masukEksternalBetina = resultAsset.data
          .filter((a) => a.kategori_id.includes(categoryId) && a.produk === 'AYAM BETINA')
          .reduce((sum, a) => sum + (parseInt(a.jumlah) || 0), 0);

        const totalKeluarJantan = resultProduction.data
          .filter((p) => p.kategori_id === categoryId)
          .reduce((sum, p) => sum + (parseInt(p.pejantan_dijual) || 0), 0);

        const totalKeluarBetina = resultProduction.data
          .filter((p) => p.kategori_id === categoryId)
          .reduce((sum, p) => sum + (parseInt(p.petelur_dijual) || 0), 0);

        const saldoJantan = (masukInternalJantan + masukEksternalJantan) - totalKeluarJantan;
        const saldoBetina = (masukInternalBetina + masukEksternalBetina) - totalKeluarBetina;

        this.onStockReady({
          pejantan: Math.max(0, saldoJantan),
          petelur: Math.max(0, saldoBetina),
        });

        // 2. LOGIKA DASHBOARD KESEHATAN DARI LAPORAN PANEN
        let totalPopulasi = 0;
        let totalSakit = 0;

        resultLap.data.forEach(lap => {
            if (lap.hewan.toLowerCase().includes(categoryId.split('-')[0])) {
                const jobs = lap.pekerjaan_data || [];
                jobs.forEach(job => {
                    if (job.name.toLowerCase().includes('panen telur')) {
                        (job.detailPanen || []).forEach(d => {
                            totalPopulasi += (parseInt(d.ayam) || 0);
                        });
                    }
                });

                const health = lap.kesehatan_data || {};
                if (health.status === 'SAKIT') {
                    totalSakit += (health.detail || []).length;
                }
            }
        });

        if (this.onHealthReady) {
            this.onHealthReady({
                totalPopulasi,
                sakit: totalSakit,
                sehat: Math.max(0, totalPopulasi - totalSakit)
            });
        }
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

  async updateManualStock(payload) {
    const response = await fetch(`${this.baseUrl}/api/production/manual-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  }
}
export default AyamPresenter;