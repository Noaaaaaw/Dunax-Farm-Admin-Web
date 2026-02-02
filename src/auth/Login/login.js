import LoginPresenter from './login-presenter.js';

const Login = {
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">Dunax Farm Operation</h1>
          </div>
          
          <form id="loginForm" class="auth-form">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="email" placeholder="Masukkan email Anda" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="password" placeholder="••••••••" required>
            </div>
            <button type="submit" class="auth-btn">Masuk</button>
          </form>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const formElement = document.getElementById('loginForm');
    if (formElement) {
      const presenter = new LoginPresenter({
        form: formElement,
        emailInput: document.getElementById('email'),
        passwordInput: document.getElementById('password')
      });
      presenter.init();
    }
  }
};

export default Login;