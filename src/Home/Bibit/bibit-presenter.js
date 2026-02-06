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

        // 1. FILTER DATA PANEN RYAN
        const dataPanen = resultLaporan.data.filter(item => {
          const d = new Date(item.tanggal_jam); d.setHours(0,0,0,0);
          return d.getTime() === targetDate.getTime() && item.petugas !== 'ADMIN' &&
                 item.pekerjaan_data.some(p => p.name.toLowerCase().includes('panen telur') && parseInt(p.val) > 0);
        }).map(item => {
          const panenTask = item.pekerjaan_data.find(p => p.name.toLowerCase().includes('panen telur'));
          return {
            id_laporan: item.id,
            hewan: item.hewan,
            deret: item.deret_kandang, // INI KUNCI NOMOR DERET
            jumlah: parseInt(panenTask.val),
            sesi: item.sesi,
            tanggal: item.tanggal_jam
          };
        });

        // 2. HITUNG TOTAL YANG SUDAH DIPROSES ADMIN
        const totalSudahDiproses = resultLaporan.data.filter(item => {
          const d = new Date(item.tanggal_jam); d.setHours(0,0,0,0);
          return d.getTime() === targetDate.getTime() && item.petugas === 'ADMIN';
        }).reduce((acc, curr) => {
          const p = curr.pekerjaan_data.find(task => task.name === "Realisasi Tetas");
          return acc + (p ? parseInt(p.val) : 0);
        }, 0);

        this.onEggsReady(dataPanen, totalSudahDiproses);
      }
    } catch (err) { console.error(err); }
  }

  async submitBibitProcess(payload) {
    const response = await fetch(`${this.baseUrl}/api/pembibitan/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  }
}
export default BibitPresenter;