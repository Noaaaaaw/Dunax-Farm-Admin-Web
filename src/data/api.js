const BASE_URL = 'https://dunax-farm-admin-web-production.up.railway.app';

const Api = {
  // 1. Fungsi Ambil Data (GET) - Tambahin ini biar Dashboard lo bisa nampil data awal
  async getAllCommodities() {
    try {
      const response = await fetch(`${BASE_URL}/commodities`);
      return await response.json();
    } catch (err) {
      console.error("Gagal ambil data cloud:", err);
    }
  },

  // 2. Fungsi Update Produk (POST) - Sesuaikan dengan route Backend lo
  async updateCommodity(id, data) {
    try {
      // Sesuai kodingan server.js lo, route-nya adalah /api/commodities/update-product
      const response = await fetch(`${BASE_URL}/api/commodities/update-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }) // Kirim ID dan datanya
      });
      return await response.json();
    } catch (err) {
      console.error("Gagal update cloud:", err);
    }
  },

  // 3. Fungsi Sync (Opsional - Jika masih mau pake localStorage)
  async syncAllFromStorage() {
    // ... isi kodingan lo (FullData) tetap oke ...
    try {
      // Pastikan Backend punya route '/commodities' untuk method POST jika pake ini
      const response = await fetch(`${BASE_URL}/commodities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
      });
      return await response.json();
    } catch (err) {
      console.error("Gagal Sync:", err);
    }
  }
};

export default Api;