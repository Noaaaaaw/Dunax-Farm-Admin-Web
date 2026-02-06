import { CONFIG } from '../../config.js';

class BibitPresenter {
  constructor({ onDataReady, onEggsReady }) {
    this.onDataReady = onDataReady;
    this.onEggsReady = onEggsReady;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init(selectedDate = new Date()) {
    try {
      const resCat = await fetch(`${this.baseUrl}/commodities`);
      const resultCat = await resCat.json();
      const resLaporan = await fetch(`${this.baseUrl}/api/laporan`);
      const resultLaporan = await resLaporan.json();

      if (resultCat.status === 'success') this.onDataReady(resultCat.data);

      if (resultLaporan.status === 'success') {
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);
        
        const eggData = resultLaporan.data.filter(item => {
          const reportDate = new Date(item.tanggal_jam);
          reportDate.setHours(0, 0, 0, 0);
          return reportDate.getTime() === targetDate.getTime() && 
                 item.pekerjaan_data.some(p => p.name.toLowerCase().includes('panen telur') && p.val !== "" && parseInt(p.val) > 0);
        }).map(item => {
          const panenTask = item.pekerjaan_data.find(p => p.name.toLowerCase().includes('panen telur'));
          return {
            id_laporan: item.id,
            hewan: item.hewan,
            deret: item.deret_kandang,
            jumlah: parseInt(panenTask.val),
            sesi: item.sesi,
            tanggal: item.tanggal_jam
          };
        });
        this.onEggsReady(eggData);
      }
    } catch (err) { console.error("Gagal sinkron data:", err); }
  }

  async submitBibitProcess(payload) {
    try {
      // PAYLOAD SEKARANG TERMASUK PENGURANG STOK UTAMA
      const response = await fetch(`${this.baseUrl}/api/pembibitan/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          total_potong_stok: payload.berhasil + payload.gagal, // Instruksi potong stok fertil
          timestamp: new Date().toISOString(),
          tipe: 'BERANTAI'
        })
      });
      return await response.json();
    } catch (err) { return { status: 'error' }; }
  }
}

export default BibitPresenter;