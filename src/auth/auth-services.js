import { CONFIG } from '../config.js';

const AuthService = {
  STORAGE_KEY: 'USER_SESSION',

  // 1. Fungsi Login (Nembak ke Railway)
  async login(email, password) {
    try {
      // ✅ Pakai CONFIG.BASE_URL biar sinkron dengan Railway
      const response = await fetch(`${CONFIG.BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.status === 'success') {
        // ✅ SOLUSI: Gabungkan data dari database dengan email yang diketik user
        // Ini memastikan AppBar selalu dapet data email yang valid
        const userData = {
          ...result.data, // Berisi: id, nama, role dari database
          email: email    // Kita paksa masukkan email ke dalam session
        };

        // Simpan object yang sudah lengkap ke LocalStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
        console.log('✅ Sesi Admin berhasil dibuat dengan Email.');
        return { success: true };
      } 
      
      // Jika dapet 401 (Unauthorized)
      return { success: false, message: result.message };
    } catch (err) {
      console.error("Gagal konek ke Auth API:", err);
      return { success: false, message: 'Gagal konek ke server!' };
    }
  },

  getUser() {
    const session = localStorage.getItem(this.STORAGE_KEY);
    return session ? JSON.parse(session) : null;
  },

  isAuthenticated() {
    return this.getUser() !== null;
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    location.hash = '#/login';
  },

  checkAccess() {
    const currentHash = location.hash || '#/';
    // Halaman publik cuma login
    if (!this.isAuthenticated() && currentHash !== '#/login') {
      alert('Akses Ditolak! Silakan login untuk operasional Dunax Farm.');
      this.logout();
      return false;
    }
    return true;
  }
};

export default AuthService;