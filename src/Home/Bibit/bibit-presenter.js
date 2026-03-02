import { CONFIG } from '../../config.js';

class BibitPresenter {
  constructor({ onDataReady, onEggsReady }) {
    this.onDataReady = onDataReady;
    this.onEggsReady = onEggsReady;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init(selectedDate = new Date()) {
    // ... (Logika init tetap sama seperti kode Anda) ...
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

        const dataPanen = resultLaporan.data.filter(item => {
          const d = new Date(item.tanggal_jam); d.setHours(0,0,0,0);
          return d.getTime() === targetDate.getTime() &&
                 item.hewan.toLowerCase().includes(categoryId.toLowerCase()) &&
                 item.pekerjaan_data.some(p => p.name.toLowerCase().includes('panen telur') && parseInt(p.val) > 0);
        }).map(item => {
          const panenTask = item.pekerjaan_data.find(p => p.name.toLowerCase().includes('panen telur'));
          return { hewan: item.hewan, deret: item.deret_kandang, jumlah: parseInt(panenTask.val), sesi: item.sesi };
        });

        const totalSudahDiproses = resultHistory.data.filter(item => {
          const d = new Date(item.tanggal_proses); d.setHours(0,0,0,0);
          return d.getTime() === targetDate.getTime() &&
                 item.kategori_id.toLowerCase() === categoryId.toLowerCase();
        }).reduce((acc, curr) => acc + (parseInt(curr.total_panen) || 0), 0);

        this.onEggsReady(dataPanen, totalSudahDiproses);
      }
    } catch (err) { console.error("Presenter Error:", err); }
  }

  async submitBibitProcess(payload) {
    // Sanitasi: Pastikan semua angka dikirim sebagai Number (bukan string)
    const sanitizedPayload = {
        kategori_id: payload.kategori_id,
        berhasil: Number(payload.berhasil) || 0,
        gagal: Number(payload.gagal) || 0,
        sisa_ke_konsumsi: Number(payload.sisa_ke_konsumsi) || 0,
        sisa_ke_ayam_kampung: Number(payload.sisa_ke_ayam_kampung) || 0
    };

    const response = await fetch(`${this.baseUrl}/api/pembibitan/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedPayload)
    });
    return await response.json();
  }
}

export default BibitPresenter;