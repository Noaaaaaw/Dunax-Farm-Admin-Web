import PembibitanPresenter from './pembibitan-presenter.js';

const Pembibitan = {
  async render() {
    return `
      <section class="page" style="display:flex; flex-direction:column; gap:30px; padding:0 20px;">
        
        <div class="page-header-card" style="
          background:#ffffff;
          border-radius:24px;
          padding:40px 20px;
          border:1px solid #e0eadd;
          box-shadow:0 8px 24px rgba(0,0,0,0.04);
          text-align:center;
        ">
          <h1 style="
            margin:0;
            font-family:'Luckiest Guy', cursive;
            font-size:2.8rem;
            font-weight:normal;
            color:#6CA651;
            letter-spacing:3px;
            text-transform:uppercase;
          ">
            MASTER PEMBIBITAN
          </h1>
        </div>

        <div class="main-content-card" style="
          background:white;
          padding:45px;
          border-radius:35px;
          border:1px solid #e0eadd;
          box-shadow:0 15px 35px rgba(0,0,0,0.05);
        ">
          <div id="pembibitanCategoryGrid" class="breed-grid-colorful">
            <div style="padding:50px; text-align:center; grid-column:1/-1; color:#888; font-weight:600;">
              ⏳ Menghubungkan ke server cloud...
            </div>
          </div>
        </div>

      </section>

      <style>
        .breed-grid-colorful {
          display:grid;
          grid-template-columns:repeat(2, 1fr);
          gap:25px;
        }

        .pembibitan-card-solid {
          border-radius:28px;
          padding:25px;
          display:flex;
          flex-direction:column;
          gap:20px;
          min-height:280px;
          transition:.3s;
          border:1px solid rgba(0,0,0,.05);
          box-shadow:0 6px 20px rgba(0,0,0,.06);
          color:white;
        }

        .pembibitan-card-solid:hover {
          transform:translateY(-5px);
          box-shadow:0 12px 30px rgba(0,0,0,.12);
        }

        .card-top-row {
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .card-top-row h3 {
          margin:0;
          font-size:1.4rem;
          font-weight:900;
          text-transform:uppercase;
        }

        .status-dot-white {
          width:14px;
          height:14px;
          border-radius:50%;
          border:2px solid white;
        }

        /* ===== GRID TOMBOL 3 ATAS 2 BAWAH ===== */
        .button-group-pembibitan {
          display:grid;
          grid-template-columns: repeat(3, 1fr); 
          gap:10px;
          margin-top:auto;
        }

        .btn-kelola-pembibitan {
          background:rgba(255,255,255,.15);
          color:white;
          border:1.5px solid rgba(255,255,255,.3);
          padding:14px 4px;
          border-radius:14px;
          font-weight:800;
          font-size:.62rem;
          text-transform:uppercase;
          cursor:pointer;
          transition:.2s;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
          min-height: 45px;
        }

        /* Container khusus baris bawah biar isi 2 tombol bagi rata */
        .row-bottom-wrap {
          grid-column: span 3;
          display: flex;
          gap: 10px;
        }

        .row-bottom-wrap .btn-kelola-pembibitan {
          flex: 1;
        }

        .btn-full-width {
          grid-column: span 3;
        }

        .btn-kelola-pembibitan:hover {
          background:white;
          color:#333;
          transform:scale(1.05);
          border-color:white;
        }

        @media (max-width:992px) {
          .breed-grid-colorful { grid-template-columns:1fr; }
        }
      </style>
    `;
  },

  async afterRender() {
    const gridContainer = document.getElementById('pembibitanCategoryGrid');

    const presenter = new PembibitanPresenter({
      onDataReady: (categories) => {
        gridContainer.innerHTML = this._renderGridContent(categories);
      }
    });

    await presenter.init();
  },

  _renderGridContent(categories) {
    if (!categories || categories.length === 0) {
      return `<div style="text-align:center; grid-column:1/-1; padding:50px; color:#888;">Data Komoditas Kosong.</div>`;
    }

    const bgColors = ['#2c3e50','#d68910','#8e44ad','#2980b9','#b95a2a','#16a085'];

    return categories.map((cat, i) => {
      const bgColor = bgColors[i % bgColors.length];
      const id = cat.id.toLowerCase();
      const name = cat.nama.toUpperCase();
      
      const isAyam = name.includes('AYAM');

      return `
        <div class="pembibitan-card-solid" style="background:${bgColor}">
          <div class="card-top-row">
            <h3>${cat.nama}</h3>
            <div class="status-dot-white" style="background:${cat.aktif ? '#2ecc71' : '#e74c3c'}"></div>
          </div>

          <div class="button-group-pembibitan">
            ${isAyam ? `
              <button class="btn-kelola-pembibitan" onclick="location.hash='#/bibit-${id}'">KELOLA PANEN</button>
              <button class="btn-kelola-pembibitan" onclick="location.hash='#/tetas-${id}'">MESIN TETAS</button>
              <button class="btn-kelola-pembibitan" onclick="location.hash='#/doc-${id}'">KELOLA DOC</button>

              <div class="row-bottom-wrap">
                <button class="btn-kelola-pembibitan" onclick="location.hash='#/pullet-${id}'">KELOLA PULLET</button>
                <button class="btn-kelola-pembibitan" onclick="location.hash='#/ayam-${id}'">KELOLA AYAM</button>
              </div>
            ` : `
              <button class="btn-kelola-pembibitan btn-full-width" onclick="location.hash='#/bibit-${id}'">Kelola Panen</button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }
};

export default Pembibitan;