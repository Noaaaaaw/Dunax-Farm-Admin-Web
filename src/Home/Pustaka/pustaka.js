const Pustaka = {
  async render() {
    return `
      <section class="page" style="display: flex; flex-direction: column; gap: 30px; padding: 0 20px; max-width:1400px; margin: 0 auto; min-height: 100vh; font-family: 'Inter', sans-serif;">
        <div class="page-header-card" style="background: #ffffff; border-radius: 24px; padding: 40px; text-align: center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <h1 style="margin: 0; font-family: 'Luckiest Guy'; color: #6CA651; font-size: 2.5rem; letter-spacing: 2px;">PUSTAKA EDUKASI & REFERENSI</h1>
          <button id="btnOpenPopup" style="margin-top: 20px; padding: 15px 30px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer; transition: 0.3s;">+ TAMBAH REFERENSI BARU</button>
        </div>

        <div class="dashboard-card" style="background: white; padding: 35px; border-radius: 35px; box-shadow: 0 15px 45px rgba(0,0,0,0.04);">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: center;">
                    <thead>
                        <tr style="background: #6CA651; color: white; text-transform: uppercase; font-size: 0.8rem; font-weight: 900;">
                            <th style="padding: 15px; border: 3px solid white;">Foto</th>
                            <th style="padding: 15px; border: 3px solid white;">Nama Materi</th>
                            <th style="padding: 15px; border: 3px solid white;">Kategori</th>
                            <th style="padding: 15px; border: 3px solid white;">Deskripsi</th>
                            <th style="padding: 15px; border: 3px solid white;">Link URL</th>
                            <th style="padding: 15px; border: 3px solid white;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="pustakaTableBody">
                        <tr><td colspan="6" style="padding:50px; color:#ccc;">Memuat data...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="pustakaModal" style="display: none; position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); align-items: center; justify-content: center; padding: 20px;">
            <div style="background: white; width: 100%; max-width: 500px; border-radius: 30px; border: 3px solid #000; box-shadow: 0 15px 0 #000; overflow: hidden; position: relative;">
                <div style="background: #6CA651; padding: 20px; text-align: center; border-bottom: 3px solid #000;">
                    <h3 style="margin: 0; font-family: 'Luckiest Guy'; color: white;">INPUT DATA PUSTAKA</h3>
                    <button id="btnClosePopup" style="position: absolute; right: 20px; top: 15px; background: white; border: 2px solid #000; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-weight: 900;">✕</button>
                </div>
                <form id="pustakaForm" style="padding: 30px; display: flex; flex-direction: column; gap: 15px;">
                    <input type="hidden" id="pustakaId">
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">JUDUL</label>
                        <input type="text" id="namaPustaka" required style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 700;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">KATEGORI</label>
                        <select id="kategoriPustaka" required style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 700;">
                            <option value="EDUKASI">EDUKASI</option>
                            <option value="SOP">SOP KANDANG</option>
                            <option value="PENYAKIT">INFO PENYAKIT</option>
                            <option value="PAKAN">FORMULA PAKAN</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">DESKRIPSI SINGKAT</label>
                        <textarea id="deskripsiPustaka" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 700; height: 80px;"></textarea>
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">LINK URL</label>
                        <input type="url" id="urlPustaka" placeholder="https://" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #eee; font-weight: 700;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 900; color: #41644A; font-size: 0.8rem;">FOTO PENDUKUNG</label>
                        <input type="file" id="fotoPustaka" accept="image/*" style="width: 100%; padding: 10px; border: 2px dashed #6CA651; border-radius: 12px;">
                    </div>
                    <button type="submit" id="btnSubmitPustaka" style="width: 100%; padding: 18px; background: #6CA651; color: white; border: none; border-radius: 15px; font-weight: 900; cursor: pointer; transition: 0.3s;">SIMPAN DATA</button>
                </form>
            </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const { default: PustakaPresenter } = await import('./pustaka-presenter.js');
    const presenter = new PustakaPresenter();
    presenter.init();
  }
};

export default Pustaka;