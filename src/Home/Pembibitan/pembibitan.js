import PembibitanPresenter from './pembibitan-presenter.js';

const Pembibitan = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04); text-align: center;">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; font-weight: normal; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">
            MASTER PEMBIBITAN
          </h1>
        </div>

        <div class="main-content-card" style="background: white; padding: 45px; border-radius: 35px; border: 1px solid #e0eadd; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
            
            <div id="pembibitanCategoryGrid" class="breed-grid-colorful">
                <div style="padding: 50px; text-align: center; grid-column: 1/-1; color: #888; font-weight: 600;">
                  Menghubungkan ke server cloud...
                </div>
            </div>
        </div>
      </section>

      <style>
        .breed-grid-colorful {
            display: grid;
            grid-template-columns: repeat(2, 1fr); 
            gap: 20px;
        }

        .pembibitan-card-solid {
            border-radius: 22px;
            padding: 25px 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 140px;
            cursor: pointer;
            transition: 0.3s ease;
            border: 1px solid rgba(0,0,0,0.05);
            position: relative;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .pembibitan-card-solid:hover {
            transform: scale(1.02);
            filter: brightness(1.1);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .card-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card-top-row h3 {
            margin: 0;
            color: white; 
            font-size: 1.3rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .status-dot-white {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }

        .btn-kelola-white {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.4);
            padding: 10px 18px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 0.8rem;
            text-transform: uppercase;
            width: fit-content;
            margin-top: 20px;
            transition: 0.2s;
        }
        
        .btn-kelola-white:hover {
            background: white;
            color: #333;
        }

        @media (max-width: 768px) {
            .breed-grid-colorful {
                grid-template-columns: 1fr;
            }
        }
      </style>
    `;
  },

  async afterRender() {
    const gridContainer = document.getElementById('pembibitanCategoryGrid');
    const presenter = new PembibitanPresenter({
      onDataReady: (categories) => this._renderGrid(gridContainer, categories)
    });
    await presenter.init();
  },

  _renderGrid(container, categories) {
    if (categories.length === 0) {
        container.innerHTML = `<div style="text-align:center; grid-column: 1/-1; padding: 50px; color: #ccc;">Data Kosong.</div>`;
        return;
    }

    const bgColors = ['#2c3e50', '#d68910', '#8e44ad', '#2980b9', '#7f8c8d', '#b95a2a'];

    container.innerHTML = categories.map((cat, i) => {
      const bgColor = bgColors[i % bgColors.length];
      
      // ARAHKAN KE ALAMAT BIBIT SESUAI ROUTES.JS
      // Format: #/bibit-namaid
      const targetHash = `#/bibit-${cat.id.toLowerCase()}`;

      return `
        <div class="pembibitan-card-solid" 
             style="background-color: ${bgColor};" 
             onclick="location.hash = '${targetHash}'">
          
          <div class="card-top-row">
            <h3>${cat.nama}</h3>
            <div class="status-dot-white" style="background: ${cat.aktif ? '#2ecc71' : '#e74c3c'}"></div>
          </div>

          <button class="btn-kelola-white">
              KELOLA BIBIT &rarr;
          </button>
        </div>
      `;
    }).join('');
  }
};

export default Pembibitan;