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
            gap: 25px;
        }

        .pembibitan-card-solid {
            border-radius: 28px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 180px;
            transition: 0.3s ease;
            border: 1px solid rgba(0,0,0,0.05);
            position: relative;
            box-shadow: 0 6px 20px rgba(0,0,0,0.06);
        }

        .pembibitan-card-solid:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }

        .card-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .card-top-row h3 {
            margin: 0;
            color: white; 
            font-size: 1.4rem;
            font-weight: 900;
            text-transform: uppercase;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .status-dot-white {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 3px solid white;
        }

        .button-group-pembibitan {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        /* Styling Tombol Universal */
        .btn-kelola-pembibitan {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1.5px solid rgba(255, 255, 255, 0.4);
            padding: 14px 20px;
            border-radius: 16px;
            font-weight: 800;
            font-size: 0.85rem;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            flex: 1;
            text-align: center;
        }
        
        /* Efek Hover Disamakan (Putih Solid) */
        .btn-kelola-pembibitan:hover {
            background: white !important;
            color: #1f3326 !important; /* Warna teks gelap saat hover */
            transform: scale(1.03);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        @media (max-width: 768px) {
            .breed-grid-colorful { grid-template-columns: 1fr; }
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
      const categoryId = cat.id.toLowerCase();
      const isAyam = cat.nama.toUpperCase().includes('AYAM');

      return `
        <div class="pembibitan-card-solid" style="background-color: ${bgColor};">
          
          <div class="card-top-row">
            <h3>${cat.nama}</h3>
            <div class="status-dot-white" style="background: ${cat.aktif ? '#2ecc71' : '#e74c3c'}"></div>
          </div>

          <div class="button-group-pembibitan">
            <button class="btn-kelola-pembibitan" onclick="location.hash = '#/bibit-${categoryId}'">
                KELOLA BIBIT
            </button>
            
            ${isAyam ? `
            <button class="btn-kelola-pembibitan" onclick="location.hash = '#/doc-${categoryId}'">
                KELOLA DOC
            </button>` : ''}
          </div>

        </div>
      `;
    }).join('');
  }
};

export default Pembibitan;