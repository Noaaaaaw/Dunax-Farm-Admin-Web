import HomePresenter from './homepage-presenter.js';

const HomePage = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 20px; padding: 0 20px;">
  <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04); position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">    
    <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; font-weight: normal; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">
      Monitor Harian Penjualan
    </h1>
  </div>

  <div id="dashboardContent" style="display: flex; flex-direction: column; gap: 20px;"></div>
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