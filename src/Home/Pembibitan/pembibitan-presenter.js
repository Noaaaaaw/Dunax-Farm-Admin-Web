import { CONFIG } from '../../config.js';

class PembibitanPresenter {
  constructor({ onDataReady }) {
    this.onDataReady = onDataReady;
    this.baseUrl = CONFIG.BASE_URL;
    this._lastData = [];
  }

  async init() {
    try {
      // 1. Ambil data pembibitan yang sedang berjalan di lifecycle
      const resPembibitan = await fetch(`${this.baseUrl}/api/pembibitan`);
      const result = await resPembibitan.json();

      // 2. Ambil data laporan operasional untuk discan panen telurnya
      const resLaporan = await fetch(`${this.baseUrl}/api/laporan`);
      const resultLaporan = await resLaporan.json();

      if (result.status !== 'success' || resultLaporan.status !== 'success') throw new Error('Gagal tarik data');

      // SCANNING: Cari tugas yang namanya mengandung "Panen Telur" dan punya "Hasil" (val)
      const antrianPanen = resultLaporan.data.filter(item => 
        item.pekerjaan_data.some(p => p.name.toLowerCase().includes('panen telur') && p.val > 0)
      ).map(item => {
        const tugasPanen = item.pekerjaan_data.find(p => p.name.toLowerCase().includes('panen telur'));
        return {
          id_laporan: item.id,
          tanggal: item.tanggal_jam,
          hewan: item.hewan,
          jumlah: tugasPanen.val,
          sesi: item.sesi
        };
      });

      this._lastData = result.data;
      
      // Kirim data pembibitan yang jalan + antrian dari laporan ke UI
      if (this.onDataReady) this.onDataReady(result.data, antrianPanen);
    } catch (err) {
      console.error("Error Init Pembibitan:", err);
    }
  }

  // Pindahkan telur dari laporan ke Master Pembibitan (Status: TELUR FERTIL)
  async moveReportToFertil(payload) {
    try {
      const response = await fetch(`${this.baseUrl}/api/pembibitan/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await this.init(); // Refresh data
      return await response.json();
    } catch (err) { return { status: 'error' }; }
  }

  // Update tahapan (DOC -> PULLET -> PETELUR)
  async updateLifecycle(payload) {
    try {
      const response = await fetch(`${this.baseUrl}/api/pembibitan/qualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await this.init();
      return await response.json();
    } catch (err) { return { status: 'error' }; }
  }
}

export default PembibitanPresenter;