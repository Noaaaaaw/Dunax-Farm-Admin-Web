import AuthService from '../auth-services.js';

class LoginPresenter {
  constructor({ form, emailInput, passwordInput }) {
    this.form = form;
    this.emailInput = emailInput;
    this.passwordInput = passwordInput;
  }

  init() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleLogin();
    });
  }

  async _handleLogin() {
    const email = this.emailInput.value;
    const password = this.passwordInput.value;
    const submitBtn = this.form.querySelector('button');

    try {
      // 1. Set Loading UI
      submitBtn.disabled = true;
      submitBtn.innerText = 'Mengecek...';

      // 2. Panggil AuthService (Cukup satu baris, logic fetch sudah ada di sana)
      // Pastikan AuthService.login lo sudah nembak ke Railway
      const result = await AuthService.login(email, password); 

      if (result.success) {
        // Data user sudah otomatis tersimpan di LocalStorage oleh AuthService
        alert(`Selamat Datang di Dunax Farm! 🚀`);
        window.location.replace('#/');
      } else {
        // Nampilin pesan error dari server (misal: "Password salah")
        alert(result.message || 'Login Gagal! Periksa email & password.');
      }
    } catch (error) {
      console.error('Error saat login:', error);
      alert('Koneksi bermasalah! Pastikan internet lo aktif.');
    } finally {
      // 3. Reset UI
      submitBtn.disabled = false;
      submitBtn.innerText = 'Masuk';
    }
  }
}

export default LoginPresenter;