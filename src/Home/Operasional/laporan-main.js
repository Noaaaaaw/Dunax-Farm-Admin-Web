const LaporanMain = {
  async render() {
    return `
      <div class="page" style="display: flex; flex-direction: column; gap: 20px; padding: 0 20px;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04); text-align: center;">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; letter-spacing: 3px; text-transform: uppercase;">
            PUSAT LAPORAN OPERASIONAL
          </h1>
        </div>

        <div id="containerMenuLaporan" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px;">
           <div style="text-align:center; padding:50px; color:#ccc; font-weight:800;">MENYINKRONKAN DATA KATEGORI...</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px; opacity: 0.6; margin-top: 10px;">
          <div style="background: #fdfdfd; padding: 35px; border-radius: 28px; border: 2px solid #f1f1f1; cursor: not-allowed; display: flex; align-items: center; gap: 25px; position: relative;">
            <div style="background: #fff5f5; width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">💰</div>
            <div>
              <h3 style="margin: 0; color: #1f3326; font-weight: 900;">Laporan Keuangan</h3>
              <p style="margin: 8px 0 0; color: #666; font-size: 0.95rem;">Monitoring arus kas dan laba bersih.</p>
            </div>
            <span style="position: absolute; top: 15px; right: 15px; background: #f39c12; color: white; font-size: 0.6rem; padding: 4px 8px; border-radius: 6px; font-weight: 900;">COMING SOON</span>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const { default: LaporanMainPresenter } = await import('./laporan-main-presenter.js');
    const presenter = new LaporanMainPresenter();
    presenter.init();
  }
};

export default LaporanMain;