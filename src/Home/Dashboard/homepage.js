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

        <div id="statusModal" class="modal" style="display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.7); align-items:center; justify-content:center; backdrop-filter: blur(4px);">
          <div class="modal-content" style="background:white; padding:30px; border-radius:30px; width:90%; max-width:450px; position:relative; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: zoomIn 0.3s ease;">
            <span class="close-modal-btn" style="position:absolute; top:15px; right:25px; font-size:35px; color:#aaa; cursor:pointer;">&times;</span>
            <div id="modalNote" style="text-align:center; padding-top:10px;">
              </div>
          </div>
        </div>

        <div id="taskModal" class="modal" style="display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.7); align-items:center; justify-content:center; backdrop-filter: blur(4px);">
          <div class="modal-content" style="background:white; padding:30px; border-radius:30px; width:90%; max-width:480px; position:relative; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: zoomIn 0.3s ease;">
            <span class="close-modal-btn" style="position:absolute; top:15px; right:25px; font-size:35px; color:#aaa; cursor:pointer;">&times;</span>
            <div style="display:flex; align-items:center; gap:15px; margin-bottom:25px; border-bottom: 2px solid #f0f4f0; padding-bottom:15px;">
              <span style="background:#eef2ed; padding:10px; border-radius:12px; font-size:1.5rem;">📋</span>
              <h2 style="margin:0; font-size:1.4rem; color:#1f3326; font-weight:900;">Detail Pekerjaan</h2>
            </div>
            <div id="taskListContent" style="display:flex; flex-direction:column; gap:5px;">
              </div>
          </div>
        </div>
      </section>

      <style>
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal { display: none; } /* Default sembunyi */
        .modal-content h3 { color: #c53030; font-weight: 900; margin-bottom: 15px; }
        .close-modal-btn:hover { color: #333 !important; }
      </style>
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