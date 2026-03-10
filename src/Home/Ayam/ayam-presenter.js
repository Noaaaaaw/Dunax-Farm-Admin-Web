import { CONFIG } from "../../config.js";

class AyamPresenter {
  constructor({ onDataReady, onStockReady, onHealthReady }) {
    this.onDataReady = onDataReady;
    this.onStockReady = onStockReady;
    this.onHealthReady = onHealthReady;
    this.baseUrl = CONFIG.BASE_URL;
    this.totalPopulasiValid = 0;
  }

  async init() {
    try {
      const hash = window.location.hash.slice(1);
      const categoryId = hash.includes("-") ? hash.split("-").slice(1).join("-") : "";

      const [resCat, resLaporan, resManual] = await Promise.all([
        fetch(`${this.baseUrl}/commodities/${categoryId}`),
        fetch(`${this.baseUrl}/api/laporan`),
        fetch(`${this.baseUrl}/api/manual-stock-logs/${categoryId}`)
      ]);

      const resultCat = await resCat.json();
      const resultLap = await resLaporan.json(); // FIX: Sebelumnya resLap (salah ketik)
      const resultManual = await resManual.json();

      if (resultCat.status === "success") {
        if (this.onDataReady) this.onDataReady(resultCat.data);

        // 1. HITUNG POPULASI DARI LAPORAN (MAX 135)
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

        if (this.onHealthReady) {
            this.onHealthReady({
                totalPopulasi: this.totalPopulasiValid, 
                sakit: sickDetails.length,
                sehat: Math.max(0, this.totalPopulasiValid - sickDetails.length),
                sickDetails: sickDetails
            });
        }

        // 2. SET STOK AKTIF (DARI DATABASE) & ISI INPUT MANUAL
        let finalStok = { pejantan: 0, petelur: 0 };
        if (resultManual.status === "success" && resultManual.data) {
            finalStok.pejantan = resultManual.data.jantan_set;
            finalStok.petelur = resultManual.data.petelur_set;
            
            // Isi otomatis kotak input manual biar gak 0 terus
            const inJ = document.getElementById('manualJantan');
            const inB = document.getElementById('manualPetelur');
            if (inJ) inJ.value = finalStok.pejantan;
            if (inB) inB.value = finalStok.petelur;
        }

        if (this.onStockReady) this.onStockReady(finalStok);
        
        // 3. AKTIFKAN KALKULASI OTOMATIS (JANTAN + PETELUR = POPULASI)
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
        inputJantan.oninput = () => {
            const val = parseInt(inputJantan.value) || 0;
            inputPetelur.value = Math.max(0, this.totalPopulasiValid - val);
        };
        inputPetelur.oninput = () => {
            const val = parseInt(inputPetelur.value) || 0;
            inputJantan.value = Math.max(0, this.totalPopulasiValid - val);
        };
    }
  }

  async updateManualStock(payload) {
    const response = await fetch(`${this.baseUrl}/api/production/manual-update`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    return await response.json();
  }

  async submitAyamProcess(payload) {
    const response = await fetch(`${this.baseUrl}/api/production/process`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    return await response.json();
  }
}

export default AyamPresenter;