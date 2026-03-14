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
      const categoryId = hash.includes("-") ? hash.split("-").pop() : "";

      const [resCat, resLaporan, resManual] = await Promise.all([
        fetch(`${this.baseUrl}/commodities/${categoryId}`),
        fetch(`${this.baseUrl}/api/laporan`),
        fetch(`${this.baseUrl}/api/manual-stock-logs/${categoryId}`)
      ]);

      const resultCat = await resCat.json();
      const resultLap = await resLaporan.json();
      const resultManual = await resManual.json();

      if (resultCat.status === "success") {
        if (this.onDataReady) this.onDataReady(resultCat.data);

        let latestReportsMap = {}; 
        let sickDetails = [];
        let totalDead = 0;
        let totalMaxCapacity = 0;

        const allReports = (resultLap.data || []).sort((a, b) => new Date(a.tanggal_jam) - new Date(b.tanggal_jam));

        // Ambil laporan terbaru per kandang
        allReports.forEach(lap => {
            const animalKeyword = categoryId.toLowerCase();
            if (lap.hewan && lap.hewan.toLowerCase().includes(animalKeyword)) {
                latestReportsMap[lap.deret_kandang] = lap;
            }
        });

        this.totalPopulasiValid = 0;
        
        Object.values(latestReportsMap).forEach(lap => {
            // Asumsi tiap kandang awalnya 75 ekor
            const kapasitasKandang = 75;
            totalMaxCapacity += kapasitasKandang;
            
            let deadInThisCage = 0;

            if (lap.kesehatan_data?.detail) {
                lap.kesehatan_data.detail.forEach((d, idx) => {
                    if (d.penyakit.toLowerCase().includes('mati')) {
                        deadInThisCage++;
                        totalDead++;
                    } else {
                        sickDetails.push({
                            ...d,
                            reportId: lap.id,
                            originalIndex: idx,
                            kandang: lap.deret_kandang
                        });
                    }
                });
            }
            // Populasi hidup = Kapasitas - Yang Mati
            this.totalPopulasiValid += (kapasitasKandang - deadInThisCage);
        });

        if (this.onHealthReady) {
            this.onHealthReady({
                totalPopulasi: this.totalPopulasiValid, 
                sakit: sickDetails.length,
                mati: totalDead,
                // Sehat adalah yang hidup dikurangi yang sedang sakit
                sehat: Math.max(0, this.totalPopulasiValid - sickDetails.length),
                sickDetails: sickDetails
            });
        }

        if (resultManual.status === "success" && resultManual.data) {
            if (this.onStockReady) this.onStockReady({
                pejantan: resultManual.data.jantan_set,
                petelur: resultManual.data.petelur_set
            });
            const inJ = document.getElementById('manualJantan');
            const inB = document.getElementById('manualPetelur');
            if (inJ) inJ.value = resultManual.data.jantan_set;
            if (inB) inB.value = resultManual.data.petelur_set;
        }
        this._setupAutoCalculate();
      }
    } catch (err) { console.error("Error Init Presenter:", err); }
  }

  async updateStatusAyam(reportId, detailIndex, statusBaru) {
    // statusBaru bernilai 'PULIH' atau 'MATI'
    const response = await fetch(`${this.baseUrl}/api/laporan/update-ayam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: reportId, 
            index: detailIndex, 
            status: statusBaru 
        })
    });
    return await response.json();
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
}

export default AyamPresenter;