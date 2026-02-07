import HomePresenter from './homepage-presenter.js';

const HomePage = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 20px; padding: 0 20px;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04); text-align: center;">     
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">
            Monitor Harian Penjualan
          </h1>
        </div>

        <div id="dashboardContent" style="display: flex; flex-direction: column; gap: 20px;"></div>

        <div id="statusModal" class="modal" style="display:none; position:fixed; z-index:99999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.7); align-items:center; justify-content:center; backdrop-filter: blur(15px);">
          <div class="modal-content" style="background: rgba(255, 255, 255, 0.8); border-radius:35px; width:90%; max-width:500px; max-height: 85vh; position:relative; box-shadow: 0 15px 45px rgba(0,0,0,0.2); border: 1px solid rgba(255, 255, 255, 0.4); display: flex; flex-direction: column; overflow: hidden; animation: zoomIn 0.3s ease;">
            
            <div style="padding: 25px 20px; border-bottom: 1px solid rgba(0,0,0,0.05); text-align: center; position: relative; background: rgba(255,255,255,0.3);">
               <h2 id="modalTitleText" style="margin:0; font-size:1.1rem; color:#1f3326; font-weight:1200; text-transform:uppercase; letter-spacing: 1.5px;">Detail Laporan</h2>
               <span class="close-modal-btn" style="position: absolute; top: 15px; right: 20px; font-size:35px; color:#aaa; cursor:pointer; line-height: 1;">&times;</span>
            </div>

            <div id="modalNote" style="padding: 30px 25px; overflow-y: auto; flex-grow: 1; background: rgba(249, 251, 249, 0.4);">
            </div>
          </div>
        </div>

        <div id="taskModal" class="modal" style="display:none; position:fixed; z-index:99999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.7); align-items:center; justify-content:center; backdrop-filter: blur(15px);">
          <div class="modal-content" style="background: rgba(255, 255, 255, 0.85); border-radius:35px; width:95%; max-width:550px; max-height: 85vh; position:relative; box-shadow: 0 15px 45px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden;">
            <div style="padding: 25px; border-bottom: 1px solid rgba(0,0,0,0.05); text-align: center; position: relative;">
               <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                 <span style="background:rgba(108,166,81,0.15); padding:8px; border-radius:12px; font-size:1.2rem;">📋</span>
                 <h2 style="margin:0; font-size:1.1rem; color:#1f3326; font-weight:1200; text-transform:uppercase;">Detail Pekerjaan</h2>
               </div>
               <span class="close-modal-btn" style="position: absolute; top: 15px; right: 20px; font-size:35px; color:#aaa; cursor:pointer; line-height: 1;">&times;</span>
            </div>
            <div id="taskListContent" style="padding: 25px; overflow-y: auto; flex-grow: 1;">
            </div>
          </div>
        </div>
      </section>

      <style>
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal { display: none; } 
        .close-modal-btn:hover { color: #e74c3c !important; }
        
        /* Scrollbar mentereng transparan */
        #modalNote::-webkit-scrollbar, #taskListContent::-webkit-scrollbar { width: 6px; }
        #modalNote::-webkit-scrollbar-thumb, #taskListContent::-webkit-scrollbar-thumb { background: rgba(248, 248, 248, 0.5); border-radius: 10px; }
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