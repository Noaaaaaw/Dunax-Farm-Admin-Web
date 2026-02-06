import { CONFIG } from '../../config.js';

class PulletPresenter {
  constructor({ onDataReady, onPulletReady }) {
    this.onDataReady = onDataReady;
    this.onPulletReady = onPulletReady;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init() {
    try {
      const hash = window.location.hash.slice(1);
      const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : '';

      const response = await fetch(`${this.baseUrl}/commodities/${categoryId}`);
      const result = await response.json();

      if (result.status === 'success') {
        this.onDataReady(result.data);
        // Cari item Pullet (8 Minggu)
        const pulletItem = result.data.details.find(p => p.nama === 'Pullet (8 Minggu)');
        this.onPulletReady(pulletItem || { stok: 0 });
      }
    } catch (err) {
      console.error("Pullet Presenter Error:", err);
    }
  }

  async submitPulletProcess(payload) {
    const response = await fetch(`${this.baseUrl}/api/pullet/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  }
}
export default PulletPresenter;