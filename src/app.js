import { resolveRoute } from './routes/route.js';
import AppBar from './components/appbar.js';
import AuthService from './auth/auth-services.js';

const App = {
  init() {
    window.addEventListener('hashchange', () => this.renderPage());
    window.addEventListener('load', () => this.renderPage());
    this.renderPage();
  },

  async renderPage() {
    const page = await resolveRoute();
    if (!page) return;

    const root = document.getElementById('app-root');
    const isAuthenticated = AuthService.isAuthenticated();

    if (isAuthenticated) {
      // PERBAIKAN: Jangan pake pengecekan 'if (!document.querySelector(".appbar"))'
      // AppBar WAJIB di-render setiap renderPage() jalan biar garis kuningnya pindah!
      root.innerHTML = `
        ${AppBar.render()}
        <div class="layout">
          <main id="main-content" class="content"></main>
        </div>
      `;
      
      // Aktifkan kembali event listener (dropdown & hamburger)
      if (AppBar.afterRender) await AppBar.afterRender();
    } else {
      root.innerHTML = `<main id="main-content"></main>`;
    }

    // 2. Render isi konten halaman (Dashboard, Komoditas, dll)
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = await page.render();
      if (page.afterRender) await page.afterRender();
    }
  },
};

export default App;