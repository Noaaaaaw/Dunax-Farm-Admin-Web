import BibitPresenter from './bibit-presenter.js';

const Bibit = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width: 1200px; margin: 0 auto;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px 20px; border: 1px solid #e0eadd; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">PROSES BIBIT & TETAS</h1>
          <h2 id="displayCategoryName" style="margin: 10px 0 0; color: #1f3326; font-weight: 900; text-transform: uppercase; font-size: 1.5rem;"></h2>
        </div>

        <div class="dashboard-card" style="background: #fff; padding: 30px; border-radius: 28px; border: 1px solid #eef2ed; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
          <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 20px; margin-bottom: 30px;">
            <div style="width: 100%;">
              <h3 style="font-weight: 1200; color: #41644A; margin: 0; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 10px;">ANTRIAN HASIL PANEN</h3>
              <div style="display: flex; justify-content: center; gap: 8px; margin-top: 12px;">
                <button class="filter-sesi-btn active" data-sesi="SEMUA">SEMUA</button>
                <button class="filter-sesi-btn" data-sesi="PAGI">PAGI</button>
                <button class="filter-sesi-btn" data-sesi="SORE">SORE</button>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; background: #f9fbf9; padding: 10px 18px; border-radius: 15px; border: 1px solid #eef2ed; width: fit-content;">
                <button id="prevDateBibit" style="background: #6CA651; color: white; border: none; padding: 8px 15px; border-radius: 10px; cursor: pointer; font-weight: 900;">&lt;</button>
                <span id="dateDisplayBibit" style="font-weight: 900; color: #14280a; font-size: 1rem; min-width: 130px; text-align: center;">-</span>
                <button id="nextDateBibit" style="background: #6CA651; color: white; border: none; padding: 8px 15px; border-radius: 10px; cursor: pointer; font-weight: 900;">&gt;</button>
            </div>
          </div>

          <div id="eggQueue" style="display: flex; flex-wrap: wrap; gap: 15px; max-height: 450px; overflow-y: auto; padding: 10px; scrollbar-width: thin;">
             <p style="color: #ccc; text-align: center; width: 100%; padding: 40px;">Mencari data panen...</p>
          </div>
          
          <div style="margin-top: 25px; padding-top: 20px; border-top: 3px solid #f4f7f4; display: flex; justify-content: center; align-items: center;">
            <div style="background: #f9fbf9; padding: 15px 40px; border-radius: 20px; border: 1px solid #eef2ed; text-align: center;">
              <span style="font-weight: 1200; color: #1f3326; font-size: 1.1rem; text-transform: uppercase;">
                TOTAL SISA<span id="totalEggDay" style="color: #6CA651; font-size: 1.2rem; margin-left: 10px;">0 BUTIR</span>
              </span>
            </div>
          </div>
        </div>

        <div class="main-content-card" style="background: white; padding: 45px; border-radius: 35px; border: 1px solid #e0eadd; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
           <div id="processArea" style="display: flex; flex-direction: column; gap: 35px;">
              <button id="btnProsesBerantai" style="width: 100%; padding: 25px; background: #6CA651; color: white; border: none; border-radius: 22px; font-weight: 1200; font-size: 1.3rem; cursor: pointer; box-shadow: 0 8px 0 #4a7337; transition: 0.3s; letter-spacing: 1px;">UPDATE STOK</button>

              <div id="resultArea" style="display: none; flex-direction: column; gap: 25px; background: #fcfdfc; padding: 35px; border-radius: 30px; border: 2px solid #eef2ed; animation: slideDown 0.4s ease;">
                 <h3 style="margin: 0; color: #1f3326; font-weight: 900; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Distribusi Stok Berantai</h3>
                 
                 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                    <div style="background: #f0f7f0; padding: 25px; border-radius: 20px; text-align: center;">
                       <label style="display: block; font-size: 0.85rem; font-weight: 900; color: #2d4a36; margin-bottom: 12px;">DITETAS (STOK DOC)</label>
                       <input type="number" id="inputBerhasil" value="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #6CA651; font-weight: 900; font-size: 1.5rem; text-align: center; color: #14280a;">
                    </div>
                    <div style="background: #fff5f5; padding: 25px; border-radius: 20px; text-align: center;">
                       <label style="display: block; font-size: 0.85rem; font-weight: 900; color: #c53030; margin-bottom: 12px;">FERTIL JUAL (SORTIR)</label>
                       <input type="number" id="inputGagal" value="0" style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #e74c3c; font-weight: 900; font-size: 1.5rem; text-align: center; color: #742a2a;">
                    </div>
                 </div>

                 <div style="background: #f1f5f9; padding: 20px; border-radius: 20px; border: 1px dashed #cbd5e1;">
                    <div id="autoKonsumsi" style="display: flex; flex-direction: column; gap: 8px; text-align: center;">
                        </div>
                 </div>

                 <button id="btnFinalSubmit" style="width: 100%; padding: 22px; background: #1f3326; color: white; border: none; border-radius: 20px; font-weight: 1200; font-size: 1.1rem; cursor: pointer; transition: 0.2s;">KONFIRMASI</button>
              </div>
           </div>
        </div>
      </section>

      <style>
        .filter-sesi-btn { background: #f0f4f0; color: #41644A; border: 1.5px solid #e0eadd; padding: 6px 15px; border-radius: 10px; font-size: 0.75rem; font-weight: 900; cursor: pointer; transition: 0.2s; }
        .filter-sesi-btn.active { background: #41644A !important; color: white !important; }
        .egg-card-item { flex: 1 1 calc(50% - 20px); min-width: 280px; background: #ffffff; border: 2px dashed #6CA651; padding: 15px 25px; border-radius: 18px; display: flex; justify-content: space-between; align-items: center; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      </style>
    `;
  },

  async afterRender() {
    let currentViewDate = new Date();
    let currentFilterSesi = 'SEMUA';
    let rawEggsPanen = [];
    let processedTotalGlobal = 0;
    let currentSaldoSisa = 0;

    const totalDisplay = document.getElementById('totalEggDay');
    const inputBerhasil = document.getElementById('inputBerhasil');
    const inputGagal = document.getElementById('inputGagal');
    const eggQueue = document.getElementById('eggQueue');
    const autoKonsumsi = document.getElementById('autoKonsumsi');

    const refreshUI = () => {
      const hash = window.location.hash.slice(1);
      const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : '';
      
      let filtered = rawEggsPanen.filter(e => e.hewan.toLowerCase().includes(categoryId.split('-')[0].toLowerCase()));
      if (currentFilterSesi !== 'SEMUA') filtered = filtered.filter(e => e.sesi === currentFilterSesi);

      const totalPanenFilter = filtered.reduce((sum, e) => sum + (parseInt(e.jumlah) || 0), 0);
      currentSaldoSisa = totalPanenFilter - processedTotalGlobal; 
      
      const valBerhasil = (parseInt(inputBerhasil.value) || 0);
      const valGagal = (parseInt(inputGagal.value) || 0);
      
      // ✅ LOGIKA PENYARINGAN 17 BUTIR
      const sisaAwal = currentSaldoSisa - (valBerhasil + valGagal);
      let fixAyamKampung = 0;
      let fixKonsumsi = 0;

      if (sisaAwal > 0) {
          // Ambil 17 butir pertama buat Ayam Kampung
          fixAyamKampung = sisaAwal >= 17 ? 17 : Math.floor(sisaAwal); 
          
          // Sisanya dikurangi 17 lagi buat Konsumsi
          const sisaKedua = sisaAwal - fixAyamKampung;
          if (sisaKedua > 0) {
              fixKonsumsi = sisaKedua >= 17 ? 17 : Math.floor(sisaKedua);
          }
      }

      totalDisplay.innerText = `${(Math.max(0, sisaAwal)).toLocaleString()} BUTIR`;
      totalDisplay.style.color = sisaAwal < 0 ? '#e74c3c' : '#6CA651';
      
      autoKonsumsi.innerHTML = `
        <div style="display:flex; justify-content: space-between; align-items:center;">
            <span style="font-size:0.8rem; font-weight:700; color:#475569;">TELUR AYAM KAMPUNG (FIX 17):</span>
            <span style="font-weight:900; color:#6CA651;">${fixAyamKampung} BUTIR</span>
        </div>
        <div style="display:flex; justify-content: space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:8px;">
            <span style="font-size:0.8rem; font-weight:700; color:#475569;">TELUR KONSUMSI (SISA - 17):</span>
            <span style="font-weight:900; color:#1e293b;">${fixKonsumsi} BUTIR</span>
        </div>
      `;

      if (filtered.length === 0) {
        eggQueue.innerHTML = `<div style="padding: 40px; text-align: center; width: 100%; color:#aaa; font-weight: 700;">Data panen kosong.</div>`;
      } else {
        eggQueue.innerHTML = filtered.map(e => `
          <div class="egg-card-item">
            <div style="text-align: left;">
              <div style="font-size: 0.75rem; font-weight: 1200; color: #6CA651;">SESI ${e.sesi}</div>
              <div style="font-size: 0.75rem; color: #14280a; font-weight: 900;">DERET KE-${e.deret || '-'}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 1.3rem; font-weight: 1200; color: #14280a;">
                ${(parseInt(e.jumlah) || 0).toLocaleString()} <small style="font-size: 0.8rem; color: #666;">Butir</small>
              </span>
            </div>
          </div>`).join('');
      }
    };

    const presenter = new BibitPresenter({
      onDataReady: (cats) => {
        const hash = window.location.hash.slice(1);
        const cat = cats.find(c => c.id === hash.split('-').slice(1).join('-'));
        if (cat) document.getElementById('displayCategoryName').innerText = cat.nama;
      },
      onEggsReady: (eggs, processed) => { 
        rawEggsPanen = eggs; 
        processedTotalGlobal = processed; 
        refreshUI(); 
      }
    });

    const loadData = async () => {
      document.getElementById('dateDisplayBibit').innerText = currentViewDate.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }).toUpperCase();
      await presenter.init(currentViewDate);
    };

    inputBerhasil.oninput = refreshUI;
    inputGagal.oninput = refreshUI;
    document.getElementById('btnProsesBerantai').onclick = () => {
        if (currentSaldoSisa <= 0) return alert("Antrian sudah habis!");
        document.getElementById('resultArea').style.display = 'flex';
    };
    
    document.getElementById('btnFinalSubmit').onclick = async () => {
        const valBerhasil = (parseInt(inputBerhasil.value) || 0);
        const valGagal = (parseInt(inputGagal.value) || 0);
        const alokasiTotal = valBerhasil + valGagal;

        if (alokasiTotal > currentSaldoSisa) return alert("Melebihi sisa antrian telur!");

        // RE-CALCULATE FOR SUBMISSION
        const sisaAwal = currentSaldoSisa - alokasiTotal;
        let fixAyamKampung = 0;
        let fixKonsumsi = 0;

        if (sisaAwal > 0) {
            fixAyamKampung = sisaAwal >= 17 ? 17 : Math.floor(sisaAwal);
            const sisaKedua = sisaAwal - fixAyamKampung;
            if (sisaKedua > 0) {
                fixKonsumsi = sisaKedua >= 17 ? 17 : Math.floor(sisaKedua);
            }
        }

        const res = await presenter.submitBibitProcess({
            kategori_id: window.location.hash.split('-').slice(1).join('-'),
            berhasil: valBerhasil,      
            gagal: valGagal,            
            sisa_ke_konsumsi: fixKonsumsi,
            sisa_ke_ayam_kampung: fixAyamKampung
        });

        if (res.status === 'success') {
            alert("Distribusi 17 Butir Sukses! 🚀");
            location.reload();
        }
    };

    document.getElementById('prevDateBibit').onclick = () => { currentViewDate.setDate(currentViewDate.getDate() - 1); loadData(); };
    document.getElementById('nextDateBibit').onclick = () => { currentViewDate.setDate(currentViewDate.getDate() + 1); loadData(); };
    
    document.querySelectorAll('.filter-sesi-btn').forEach(btn => {
      btn.onclick = (e) => {
        document.querySelectorAll('.filter-sesi-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilterSesi = e.target.dataset.sesi;
        refreshUI();
      };
    });

    await loadData();
  }
};

export default Bibit;