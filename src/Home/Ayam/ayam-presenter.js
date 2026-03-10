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
        // Pastikan elemen displayCategoryName ada sebelum set text
        const displayCat = document.getElementById('displayCategoryName');
        if (displayCat) displayCat.innerText = resultCat.data.nama;
        
        if (this.onDataReady) this.onDataReady(resultCat.data);

        // 1. LOGIKA SALDO MENTERENG (STOK AKTIF DARI TRANSAKSI)
        const filterCat = (arr) => (arr || []).filter((m) => m.kategori_id === categoryId);
        
        const masukInternalJantan = filterCat(resultMaturity.data).reduce((sum, m) => sum + (parseInt(m.hasil_pejantan) || 0), 0);
        const masukInternalBetina = filterCat(resultMaturity.data).reduce((sum, m) => sum + (parseInt(m.hasil_petelur) || 0), 0);

        const masukEksternalJantan = (resultAsset.data || [])
          .filter((a) => a.kategori_id.includes(categoryId) && a.produk === 'AYAM PEJANTAN')
          .reduce((sum, a) => sum + (parseInt(a.jumlah) || 0), 0);

        const masukEksternalBetina = (resultAsset.data || [])
          .filter((a) => a.kategori_id.includes(categoryId) && a.produk === 'AYAM BETINA')
          .reduce((sum, a) => sum + (parseInt(a.jumlah) || 0), 0);

        const totalKeluarJantan = filterCat(resultProduction.data).reduce((sum, p) => sum + (parseInt(p.pejantan_dijual) || 0), 0);
        const totalKeluarBetina = filterCat(resultProduction.data).reduce((sum, p) => sum + (parseInt(p.petelur_dijual) || 0), 0);

        const saldoJantan = (masukInternalJantan + masukEksternalJantan) - totalKeluarJantan;
        const saldoBetina = (masukInternalBetina + masukEksternalBetina) - totalKeluarBetina;

        if (this.onStockReady) {
            this.onStockReady({
              pejantan: Math.max(0, saldoJantan),
              petelur: Math.max(0, saldoBetina),
            });
        }

        // 2. LOGIKA KESEHATAN (DATA DARI LAPORAN OPERASIONAL HARIAN)
        let totalAyamDiLaporan = 0;
        let sickDetails = [];

        (resultLap.data || []).forEach(lap => {
            if (lap.hewan && lap.hewan.toLowerCase().includes(categoryId.split('-')[0])) {
                // Ambil jumlah ayam aktif dari pekerjaan Panen
                (lap.pekerjaan_data || []).forEach(job => {
                    if (job.name.toLowerCase().includes('panen telur')) {
                        (job.detailPanen || []).forEach(d => { 
                            totalAyamDiLaporan += (parseInt(d.ayam) || 0); 
                        });
                    }
                });

                // Ambil Data Sakit
                const health = lap.kesehatan_data || {};
                if (health.detail && Array.isArray(health.detail)) {
                    sickDetails = [...sickDetails, ...health.detail];
                }
            }
        });

        const jumlahSakitEkor = sickDetails.length;

        if (this.onHealthReady) {
            this.onHealthReady({
                totalPopulasi: totalAyamDiLaporan,
                sakit: jumlahSakitEkor,
                sehat: Math.max(0, totalAyamDiLaporan - jumlahSakitEkor),
                sickDetails: sickDetails
            });
        }
      }
    } catch (err) {
      console.error("Presenter Init Error:", err);
    }
  }

  async submitAyamProcess(payload) {
    const response = await fetch(`${this.baseUrl}/api/production/process`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    return await response.json();
  }

  async updateManualStock(payload) {
    const response = await fetch(`${this.baseUrl}/api/production/manual-update`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    return await response.json();
  }
}
export default AyamPresenter;