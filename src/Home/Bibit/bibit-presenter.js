import { CONFIG } from '../../config.js';

class BibitPresenter {
  constructor({ onDataReady, onEggsReady }) {
    this.onDataReady = onDataReady;
    this.onEggsReady = onEggsReady;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init(selectedDate = new Date()) {
    try {
      const hash = window.location.hash.slice(1);
      const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : '';

      const [resCat, resLaporan, resHistory] = await Promise.all([
        fetch(`${this.baseUrl}/commodities`),
        fetch(`${this.baseUrl}/api/laporan`),
        fetch(`${this.baseUrl}/api/pembibitan/history`)
      ]);

      const resultCat = await resCat.json();
      const resultLaporan = await resLaporan.json();
      const resultHistory = await resHistory.json();
      if (resultCat.status === 'success') this.onDataReady(resultCat.data);
      if (resultLaporan.status === 'success' && resultHistory.status === 'success') {
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);

        // 1. FILTER ANTRIAN MASUK (DATA PANEN)
        const dataPanen = resultLaporan.data.filter(item => {
          const d = new Date(item.tanggal_jam); d.setHours(0,0,0,0);
          return d.getTime() === targetDate.getTime() &&
                 item.hewan.toLowerCase().includes(categoryId.toLowerCase()) &&
                 item.pekerjaan_data.some(p => p.name.toLowerCase().includes('panen telur') && parseInt(p.val) > 0);
        }).map(item => {
          const panenTask = item.pekerjaan_data.find(p => p.name.toLowerCase().includes('panen telur'));
          return {
            hewan: item.hewan,
            deret: item.deret_kandang,
            jumlah: parseInt(panenTask.val),
            sesi: item.sesi
          };
        });

        // 2. HITUNG ANTRIAN KELUAR (YANG SUDAH DIPROSES)
        const totalSudahDiproses = resultHistory.data.filter(item => {
          const d = new Date(item.tanggal_proses); d.setHours(0,0,0,0);
          return d.getTime() === targetDate.getTime() &&
                 item.kategori_id.toLowerCase() === categoryId.toLowerCase();
        }).reduce((acc, curr) => acc + (parseInt(curr.total_panen) || 0), 0);
        this.onEggsReady(dataPanen, totalSudahDiproses);
      }
    } catch (err) {
      console.error("Presenter Error:", err);
    }
  }

  async submitBibitProcess(payload) {

    // Payload di sini cuma berisi: kategori_id, berhasil, gagal, sisa_ke_konsumsi
    const response = await fetch(`${this.baseUrl}/api/pembibitan/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  }
}
export default BibitPresenter;