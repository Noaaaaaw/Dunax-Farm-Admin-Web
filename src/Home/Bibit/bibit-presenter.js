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

        // 1. FILTER DATA PANEN (ANTRIAN MASUK)
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

        // 2. HITUNG TOTAL KELUAR (ANTRIAN YANG SUDAH DIPROSES)
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
    // AMBIL NAMA PEKERJA DARI LOCALSTORAGE (Hasil Login)
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const namaPetugas = userData.nama || 'PEKERJA'; 

    // Tambahkan nama petugas ke dalam data yang dikirim ke Backend
    const finalPayload = {
      ...payload,
      petugas: namaPetugas
    };

    const response = await fetch(`${this.baseUrl}/api/pembibitan/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload)
    });
    
    return await response.json();
  }
}
export default BibitPresenter;