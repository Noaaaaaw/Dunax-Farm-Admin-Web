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
    const email = this.emailInput.value; // Kita pegang email dari inputan form
    const password = this.passwordInput.value;

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        // ✅ UPDATE: Gabungkan data dari backend dengan email asli yang diketik user
        const userData = {
          ...result.data, // Ambil nama, role, dll dari backend
          email: email    // Paksa masukin email yang dipake buat login tadi
        };

        // Simpan data user yang sudah lengkap ke AuthService
        AuthService.login(userData);
        
        alert(`Selamat Datang, ${result.data.nama}!`);
        
        window.location.replace('#/');
      } else {
        alert(result.message || 'Login Gagal! Periksa kembali email dan password.');
      }
    } catch (error) {
      console.error('Error saat login:', error);
      alert('Gagal terhubung ke server! Pastikan Backend lo sudah nyala.');
    }
  }
}

export default LoginPresenter;