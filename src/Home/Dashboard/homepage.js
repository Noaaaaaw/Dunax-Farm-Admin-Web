import HomePresenter from './homepage-presenter.js';

const HomePage = {
  async render() {
    return `
      <section class="page-dashboard">
        <div class="dashboard-header-block">
          <div class="header-content">
            <h1 class="main-title">Dashboard</h1>
            <p class="sub-title">Ringkasan data persediaan dan harga komoditas Dunax Farm secara real-time.</p>
          </div>
          <div class="header-decoration"></div>
        </div>

        <div id="dashboardContent"></div>
      </section>
    `;
  },

  async afterRender() {
    const presenter = new HomePresenter({
      container: document.getElementById('dashboardContent'),
    });
    presenter.init();
  },
};

export default HomePage;