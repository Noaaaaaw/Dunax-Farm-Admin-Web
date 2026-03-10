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
        const displayCat = document.getElementById('displayCategoryName');
        if (displayCat) displayCat.innerText = resultCat.data.nama;
        if (this.onDataReady) this.onDataReady(resultCat.data);

        // 1. LOGIKA SALDO STOK AKTIF (TRANSAKSI JUAL/BELI)
        const filterCat = (arr) => (arr || []).filter((m) => m.kategori_id === categoryId);
        const masukIntJ = filterCat(resultMaturity.data).reduce((s, m) => s + (parseInt(m.hasil_pejantan) || 0), 0);
        const masukIntB = filterCat(resultMaturity.data).reduce((s, m) => s + (parseInt(m.hasil_petelur) || 0), 0);
        const masukEksJ = (resultAsset.data || []).filter(a => a.kategori_id.includes(categoryId) && a.produk === 'AYAM PEJANTAN').reduce((s, a) => s + (parseInt(a.jumlah) || 0), 0);
        const masukEksB = (resultAsset.data || []).filter(a => a.kategori_id.includes(categoryId) && a.produk === 'AYAM BETINA').reduce((s, a) => s + (parseInt(a.jumlah) || 0), 0);
        const keluarJ = filterCat(resultProduction.data).reduce((s, p) => s + (parseInt(p.pejantan_dijual) || 0), 0);
        const keluarB = filterCat(resultProduction.data).reduce((s, p) => s + (parseInt(p.petelur_dijual) || 0), 0);

        if (this.onStockReady) {
            this.onStockReady({
              pejantan: Math.max(0, (masukIntJ + masukEksJ) - keluarJ),
              petelur: Math.max(0, (masukIntB + masukEksB) - keluarB),
            });
        }

        // 2. LOGIKA POPULASI (PAS 135: 9 DERET X 15 EKOR)
        let latestReportsPerDeret = {}; 
        let sickDetails = [];
        
        // Sort data laporan agar data terbaru menimpa data lama di objek per deret
        const reports = resultLap.data || [];
        reports.sort((a, b) => new Date(a.tanggal_jam) - new Date(b.tanggal_jam));

        reports.forEach(lap => {
            if (lap.hewan && lap.hewan.toLowerCase().includes(categoryId.split('-')[0])) {
                // Key berdasarkan nomor deret, value adalah data laporan terbaru
                latestReportsPerDeret[lap.deret_kandang] = lap;
            }
        });

        let totalPopulasiValid = 0;
        // Hanya jumlahkan populasi dari 1 laporan terakhir untuk setiap deret yang aktif
        Object.values(latestReportsPerDeret).forEach(lap => {
            (lap.pekerjaan_data || []).forEach(job => {
                if (job.name.toLowerCase().includes('panen telur')) {
                    (job.detailPanen || []).forEach(d => { 
                        // Ambil angka 15 dari database (bukan akumulasi seluruh histori)
                        totalPopulasiValid += (parseInt(d.ayam) || 15); 
                    });
                }
            });

            // Ambil detail ayam sakit dari kondisi terbaru setiap deret
            if (lap.kesehatan_data?.detail) {
                sickDetails = [...sickDetails, ...lap.kesehatan_data.detail];
            }
        });

        if (this.onHealthReady) {
            this.onHealthReady({
                totalPopulasi: totalPopulasiValid, 
                sakit: sickDetails.length,
                sehat: Math.max(0, totalPopulasiValid - sickDetails.length),
                sickDetails: sickDetails
            });
        }
      }
    } catch (err) { console.error("Ayam Presenter Error:", err); }
  }

  async submitAyamProcess(payload) {
    const res = await fetch(`${this.baseUrl}/api/production/process`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    return await res.json();
  }

  async updateManualStock(payload) {
    const res = await fetch(`${this.baseUrl}/api/production/manual-update`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    return await res.json();
  }
}

export default AyamPresenter;