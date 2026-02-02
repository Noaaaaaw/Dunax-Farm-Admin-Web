const BASE_URL = 'http://localhost:5000';

const Api = {
  // Fungsi "Sedot" LocalStorage ke Server
  async syncAllFromStorage() {
    const keys = [
      { id: 'ayam', key: 'PRODUK_AYAM_DATA' },
      { id: 'bebek', key: 'PRODUK_BEBEK_DATA' },
      { id: 'ikan', key: 'PRODUK_IKAN_DATA' },
      { id: 'kambing', key: 'PRODUK_KAMBING_DATA' },
      { id: 'sapi', key: 'PRODUK_SAPI_DATA' },
      { id: 'sayur', key: 'PRODUK_SAYUR_DATA' },
    ];

    const fullData = keys.map(item => ({
      id: item.id,
      storageKey: item.key,
      nama: item.id.toUpperCase(),
      details: JSON.parse(localStorage.getItem(item.key)) || []
    }));

    try {
      const response = await fetch(`${BASE_URL}/commodities/sync-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
      });
      return await response.json();
    } catch (err) {
      console.error("Gagal Sync massal:", err);
    }
  },

  async updateCommodity(id, data) {
    try {
      await fetch(`${BASE_URL}/commodities/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error("Gagal update satuan:", err);
    }
  }
};

export default Api;