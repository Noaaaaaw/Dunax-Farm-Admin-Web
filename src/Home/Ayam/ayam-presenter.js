import { CONFIG } from "../../config.js";

class AyamPresenter {
  constructor({ onDataReady, onStockReady, onHealthReady }) {
    this.onDataReady = onDataReady;
    this.onStockReady = onStockReady;
    this.onHealthReady = onHealthReady;
    this.baseUrl = CONFIG.BASE_URL;
    this.totalPopulasiValid = 0; // Simpan state populasi untuk kalkulasi otomatis
  }

  async init() {
    try {
      const hash = window.location.hash.slice(1);
      const categoryId = hash.includes("-") ? hash.split("-").slice(1).join("-") : "";

      const [resCat, resMaturity, resAssetBaru, resProduction, resLaporan, resManual] = await Promise.all([
        fetch(`${this.baseUrl}/commodities/${categoryId}`),
        fetch(`${this.baseUrl}/api/pullet/history`),
        fetch(`${this.baseUrl}/api/asset-baru/history`),
        fetch(`${this.baseUrl}/api/production/history`),
        fetch(`${this.baseUrl}/api/laporan`),
        fetch(`${this.baseUrl}/api/manual-stock-logs/${categoryId}`) // Fetch data manual terbaru
      ]);

      const resultCat = await resCat.json();
      const resultMaturity = await resMaturity.json();
      const resultAsset = await resAssetBaru.json();
      const resultProduction = await resProduction.json();
      const resultLap = await resLaporan.json();
      const resultManual = await resManual.json();

      if (resultCat.status === "success") {
        if (this.onDataReady) this.onDataReady(resultCat.data);

        // --- 1. LOGIKA POPULASI (Sama seperti sebelumnya untuk dapat angka 135) ---
        let latestReportsMap = {}; 
        let sickDetails = [];
        const allReports = (resultLap.data || []).sort((a, b) => new Date(a.tanggal_jam) - new Date(b.tanggal_jam));

        allReports.forEach(lap => {
            const animalKeyword = categoryId.split('-')[0].toLowerCase();
            if (lap.hewan && lap.hewan.toLowerCase().includes(animalKeyword)) {
                latestReportsMap[lap.deret_kandang] = lap;
            }
        });

        this.totalPopulasiValid = 0;
        Object.values(latestReportsMap).forEach(lap => {
            const jobPanen = (lap.pekerjaan_data || []).find(job => job.name.toLowerCase().includes('panen telur'));
            this.totalPopulasiValid += (jobPanen?.detailPanen?.[0]?.ayam ? parseInt(jobPanen.detailPanen[0].ayam) : 15);
            if (lap.kesehatan_data?.detail) sickDetails = [...sickDetails, ...lap.kesehatan_data.detail];
        });

        // Kirim data kesehatan ke UI
        if (this.onHealthReady) {
            this.onHealthReady({
                totalPopulasi: this.totalPopulasiValid, 
                sakit: sickDetails.length,
                sehat: Math.max(0, this.totalPopulasiValid - sickDetails.length),
                sickDetails: sickDetails
            });
        }

        // --- 2. LOGIKA STOK AKTIF (DENGAN PRIORITAS MANUAL) ---
        let finalStok = { pejantan: 0, petelur: 0 };

        if (resultManual.status === "success" && resultManual.data) {
            // JIKA ADA DATA MANUAL: Langsung pakai data dari tabel manual_stock_logs
            finalStok.pejantan = parseInt(resultManual.data.jantan_set) || 0;
            finalStok.petelur = parseInt(resultManual.data.petelur_set) || 0;
        } else {
            // JIKA TIDAK ADA DATA MANUAL: Pakai hitungan transaksi (Maturity + Asset - Production)
            const filterCat = (arr) => (arr || []).filter((m) => m.kategori_id === categoryId);
            const masukJ = filterCat(resultMaturity.data).reduce((s, m) => s + (parseInt(m.hasil_pejantan) || 0), 0) +
                         (resultAsset.data || []).filter(a => a.kategori_id.includes(categoryId) && a.produk === 'AYAM PEJANTAN').reduce((s, a) => s + (parseInt(a.jumlah) || 0), 0);
            const masukB = filterCat(resultMaturity.data).reduce((s, m) => s + (parseInt(m.hasil_petelur) || 0), 0) +
                         (resultAsset.data || []).filter(a => a.kategori_id.includes(categoryId) && a.produk === 'AYAM BETINA').reduce((s, a) => s + (parseInt(a.jumlah) || 0), 0);
            const keluarJ = filterCat(resultProduction.data).reduce((s, p) => s + (parseInt(p.pejantan_dijual) || 0), 0);
            const keluarB = filterCat(resultProduction.data).reduce((s, p) => s + (parseInt(p.petelur_dijual) || 0), 0);

            finalStok.pejantan = Math.max(0, masukJ - keluarJ);
            finalStok.petelur = Math.max(0, masukB - keluarB);
        }

        if (this.onStockReady) this.onStockReady(finalStok);
        
        // --- 3. BINDING INPUT OTOMATIS (SISA DARI POPULASI) ---
        this._setupAutoCalculate();
      }
    } catch (err) {
      console.error("Ayam Presenter Error:", err);
    }
  }

  _setupAutoCalculate() {
    const inputJantan = document.getElementById('manualJantan');
    const inputPetelur = document.getElementById('manualPetelur');

    if (inputJantan && inputPetelur) {
        inputJantan.addEventListener('input', () => {
            const val = parseInt(inputJantan.value) || 0;
            // Jika isi Jantan 20 dari total 135, maka Petelur otomatis 115
            inputPetelur.value = Math.max(0, this.totalPopulasiValid - val);
        });

        inputPetelur.addEventListener('input', () => {
            const val = parseInt(inputPetelur.value) || 0;
            inputJantan.value = Math.max(0, this.totalPopulasiValid - val);
        });
    }
  }

  async updateManualStock(payload) {
    const response = await fetch(`${this.baseUrl}/api/production/manual-update`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    return await response.json();
  }
}

export default AyamPresenter;