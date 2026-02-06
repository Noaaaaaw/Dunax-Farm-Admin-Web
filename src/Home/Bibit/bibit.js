import BibitPresenter from './bibit-presenter.js';

const Bibit = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04); text-align: center;">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">
            PROSES BIBIT & TETAS
          </h1>
          <h2 id="displayCategoryName" style="margin: 10px 0 0; color: #1f3326; font-weight: 900; text-transform: uppercase; font-size: 1.5rem;"></h2>
        </div>

        <div class="dashboard-card" style="background: #fff; padding: 30px; border-radius: 28px; border: 1px solid #eef2ed; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
            <div>
              <h3 style="font-weight: 1200; color: #41644A; margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                🥚 ANTRIAN HASIL PANEN
              </h3>
              <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button class="filter-sesi-btn active" data-sesi="SEMUA">SEMUA</button>
                <button class="filter-sesi-btn" data-sesi="PAGI">PAGI</button>
                <button class="filter-sesi-btn" data-sesi="SORE">SORE</button>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 12px; background: #f9fbf9; padding: 10px 18px; border-radius: 15px; border: 1px solid #eef2ed;">
                <button id="prevDateBibit" style="background: #6CA651; color: white; border: none; padding: 8px 15px; border-radius: 10px; cursor: pointer; font-weight: 900;">&lt;</button>
                <span id="dateDisplayBibit" style="font-weight: 900; color: #14280a; font-size: 1rem; min-width: 130px; text-align: center;">-</span>
                <button id="nextDateBibit" style="background: #6CA651; color: white; border: none; padding: 8px 15px; border-radius: 10px; cursor: pointer; font-weight: 900;">&gt;</button>
            </div>
          </div>

          <div id="eggQueue" class="egg-grid-container">
             <p style="color: #ccc; text-align: center; grid-column: 1/-1; padding: 40px;">Mencari data panen...</p>
          </div>
          
          <div style="margin-top: 25px; padding-top: 20px; border-top: 3px solid #f4f7f4; display: flex; justify-content: center; align-items: center;">
            <div style="background: #f9fbf9; padding: 15px 40px; border-radius: 20px; border: 1px solid #eef2ed; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
              <span style="font-weight: 1200; color: #1f3326; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">
                TOTAL TELUR: <span id="totalEggDay" style="color: #6CA651; font-size: 2.2rem; margin-left: 10px; display: inline-block; vertical-align: middle;">0 BUTIR</span>
              </span>
            </div>
          </div>
        </div>

        <div class="main-content-card" style="background: white; padding: 45px; border-radius: 35px; border: 1px solid #e0eadd; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
           <div id="processArea" style="display: flex; flex-direction: column; gap: 35px;">
              <button id="btnProsesBerantai" style="width: 100%; padding: 25px; background: #6CA651; color: white; border: none; border-radius: 22px; font-weight: 1200; font-size: 1.3rem; cursor: pointer; box-shadow: 0 8px 0 #4a7337; transition: 0.3s; letter-spacing: 1px;">
                UPDATE STOK
              </button>

              <div id="resultArea" style="display: none; flex-direction: column; gap: 25px; background: #fcfdfc; padding: 35px; border-radius: 30px; border: 2px solid #eef2ed; animation: slideDown 0.4s ease;">
                 <h3 style="margin: 0; color: #1f3326; font-weight: 900; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Rincian Hasil Akhir</h3>
                 
                 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                    <div style="background: #f0f7f0; padding: 25px; border-radius: 20px; border: 1px solid #d1e7d1; text-align: center;">
                       <label style="display: block; font-size: 0.85rem; font-weight: 900; color: #2d4a36; margin-bottom: 12px;">DITETAS</label>
                       <input type="number" id="inputBerhasil" placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #6CA651; font-weight: 900; font-size: 1.5rem; text-align: center; color: #14280a;">
                    </div>
                    <div style="background: #fff5f5; padding: 25px; border-radius: 20px; border: 1px solid #feb2b2; text-align: center;">
                       <label style="display: block; font-size: 0.85rem; font-weight: 900; color: #c53030; margin-bottom: 12px;">TIDAK DITETAS</label>
                       <input type="number" id="inputGagal" placeholder="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #e74c3c; font-weight: 900; font-size: 1.5rem; text-align: center; color: #742a2a;">
                    </div>
                 </div>

                 <button id="btnFinalSubmit" style="width: 100%; padding: 22px; background: #1f3326; color: white; border: none; border-radius: 20px; font-weight: 1200; font-size: 1.1rem; cursor: pointer; transition: 0.2s;">
                    KONFIRMASI & PINDAHKAN KE STOK JUAL 🐣
                 </button>
              </div>
           </div>
        </div>
      </section>

      <style>
        .egg-grid-container {
            display: grid;
            grid-template-rows: repeat(5, 75px);
            grid-auto-flow: column;
            gap: 12px;
            overflow-x: auto;
            padding-bottom: 15px;
        }
        .egg-row-item-mini {
            display: flex; justify-content: space-between; align-items: center; 
            background: #ffffff; border: 2px dashed #6CA651; padding: 0 25px; 
            border-radius: 15px; min-width: 280px; height: 75px;
        }
        .filter-sesi-btn {
            background: #f0f4f0; color: #41644A; border: 1.5px solid #e0eadd; 
            padding: 6px 15px; border-radius: 10px; font-size: 0.75rem; font-weight: 900; 
            cursor: pointer;
        }
        .filter-sesi-btn.active { background: #41644A !important; color: white !important; }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      </style>
    `;
  },

  async afterRender() {
    let currentViewDate = new Date();
    let currentFilterSesi = 'SEMUA';
    let rawEggs = [];
    let dailySaldoGlobal = 0; // Menyimpan total awal berdasarkan filter sesi

    const hash = window.location.hash.slice(1); 
    const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : null;
    const eggQueue = document.getElementById('eggQueue');
    const totalDisplay = document.getElementById('totalEggDay');
    const btnBerantai = document.getElementById('btnProsesBerantai');
    const resultArea = document.getElementById('resultArea');
    const inputBerhasil = document.getElementById('inputBerhasil');
    const inputGagal = document.getElementById('inputGagal');

    // LOGIKA UPDATE TOTAL DINAMIS (SALDO BERJALAN)
    const refreshDynamicTotal = () => {
        const alokasiBerhasil = parseInt(inputBerhasil.value) || 0;
        const alokasiGagal = parseInt(inputGagal.value) || 0;
        const sisaSaldo = dailySaldoGlobal - (alokasiBerhasil + alokasiGagal);

        totalDisplay.innerText = `${sisaSaldo.toLocaleString()} BUTIR`;
        
        // Peringatan warna jika input melebihi saldo yang ada
        totalDisplay.style.color = sisaSaldo < 0 ? '#e74c3c' : '#6CA651';
    };

    const renderList = () => {
      let filtered = rawEggs.filter(e => e.hewan.toLowerCase().includes(categoryId.split('-')[0]));
      if (currentFilterSesi !== 'SEMUA') filtered = filtered.filter(e => e.sesi === currentFilterSesi);

      if (filtered.length === 0) {
        eggQueue.innerHTML = `<div style="padding: 40px; text-align: center; color:#aaa; font-weight: 700; grid-column: 1/-1;">Data panen kosong.</div>`;
        dailySaldoGlobal = 0;
        refreshDynamicTotal();
        return;
      }

      let total = 0;
      eggQueue.innerHTML = filtered.map(e => {
        total += e.jumlah;
        return `
          <div class="egg-row-item-mini">
            <div style="text-align: left;">
              <div style="font-size: 0.75rem; font-weight: 1200; color: #6CA651; text-transform: uppercase;">SESI ${e.sesi}</div>
              <div style="font-size: 0.7rem; color: #14280a; font-weight: 900; text-transform: uppercase;">DERET KE-${e.deret}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 1.3rem; font-weight: 1200; color: #14280a;">${e.jumlah.toLocaleString()} <small style="font-size: 0.8rem; color: #666;">Butir</small></span>
            </div>
          </div>`;
      }).join('');
      
      // Update saldo berdasarkan hasil sortir
      dailySaldoGlobal = total;
      refreshDynamicTotal();
    };

    const presenter = new BibitPresenter({
      onDataReady: (categories) => {
        const cat = categories.find(c => c.id === categoryId);
        if (cat) document.getElementById('displayCategoryName').innerText = cat.nama;
      },
      onEggsReady: (eggs) => { rawEggs = eggs; renderList(); }
    });

    const refreshData = async () => {
      document.getElementById('dateDisplayBibit').innerText = currentViewDate.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }).toUpperCase();
      await presenter.init(currentViewDate);
    };

    // Event Input Real-time
    inputBerhasil.oninput = refreshDynamicTotal;
    inputGagal.oninput = refreshDynamicTotal;

    btnBerantai.onclick = () => {
        if (dailySaldoGlobal <= 0) return alert("Belum ada antrian telur untuk diproses!");
        resultArea.style.display = 'flex';
        btnBerantai.style.opacity = '0.5';
        btnBerantai.innerText = "RINCIAN PENGGUNAAN TELUR";
        btnBerantai.style.pointerEvents = 'none';
        inputBerhasil.focus();
    };

    document.getElementById('btnFinalSubmit').onclick = async () => {
        const payload = {
            kategori_id: categoryId,
            berhasil: parseInt(inputBerhasil.value) || 0,
            gagal: parseInt(inputGagal.value) || 0
        };

        if (payload.berhasil + payload.gagal > dailySaldoGlobal) {
            alert("Waduh! Total alokasi melebihi stok antrian yang tersedia.");
            return;
        }
        
        if (confirm("Konfirmasi rincian? Stok DOC & Telur Konsumsi akan segera diperbarui.")) {
            const res = await presenter.submitBibitProcess(payload);
            if (res.status === 'success') {
                alert("Stok Berhasil Disinkronkan! 🚀");
                location.reload();
            }
        }
    };

    document.getElementById('prevDateBibit').onclick = () => { currentViewDate.setDate(currentViewDate.getDate() - 1); refreshData(); };
    document.getElementById('nextDateBibit').onclick = () => { currentViewDate.setDate(currentViewDate.getDate() + 1); refreshData(); };

    document.querySelectorAll('.filter-sesi-btn').forEach(btn => {
      btn.onclick = (e) => {
        document.querySelectorAll('.filter-sesi-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilterSesi = e.target.dataset.sesi;
        renderList(); // Otomatis update total telur sesuai sesi
      };
    });

    await refreshData();
  }
};

export default Bibit;