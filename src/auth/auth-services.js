const AuthService = {
  STORAGE_KEY: 'USER_SESSION',

  login(userData) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
    console.log('✅ Sesi Admin berhasil dibuat.');
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
    // Halaman publik SEKARANG CUMA LOGIN
    const publicPages = ['#/login'];

    if (!this.isAuthenticated() && !publicPages.includes(currentHash)) {
      alert('Akses Ditolak! Silakan login untuk operasional Dunax Farm.');
      this.logout();
      return false;
    }

    if (this.isAuthenticated() && publicPages.includes(currentHash)) {
      location.hash = '#/';
      return false;
    }

    return true;
  }
};

export default AuthService;