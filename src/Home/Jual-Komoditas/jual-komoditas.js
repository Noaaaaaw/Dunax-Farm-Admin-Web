import JualKomoditasPresenter from './jual-komoditas-presenter.js';
import { CONFIG } from '../../config.js';

const JualKomoditas = {
  async render() {
    return `
      <section class="page">
        <div class="page-header-card">
          <h1>Manajemen Komoditas</h1>
          <p>Management kategori dan produk Dunax Farm dengan mudah dan terintegrasi.</p>
        </div>

        <div class="action-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px; margin-bottom: 40px;">
          
          <div class="action-card" id="openModalCatBtn" style="cursor: pointer; display: flex; align-items: center; gap: 25px; padding: 40px 35px;">
            <div class="icon-box-clean" style="width: 85px; height: 85px; border-radius: 20px;">
               <span style="font-size: 3.5rem;">📁</span>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 1.5rem; font-weight: 900; letter-spacing: -0.5px;">Tambah Kategori</h3>
              <p style="margin: 5px 0 0; opacity: 0.85; font-size: 1rem; font-weight: 500;">Buat grup komoditas baru</p>
            </div>
          </div>

          <div class="action-card" id="openModalProdBtn" style="cursor: pointer; display: flex; align-items: center; gap: 25px; padding: 40px 35px;">
            <div class="icon-box-clean" style="width: 85px; height: 85px; border-radius: 20px;">
               <span style="font-size: 3.5rem;">📦</span>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 1.5rem; font-weight: 900; letter-spacing: -0.5px;">Tambah Produk</h3>
              <p style="margin: 5px 0 0; opacity: 0.85; font-size: 1rem; font-weight: 500;">Masukkan jenis barang baru</p>
            </div>
          </div>
        </div>

        <div class="main-content-card">
            <h2 class="section-title-centered">
                <span style="opacity: 0.5;"></span> Daftar Kategori Komoditas
            </h2>
            
            <div id="categoryCardsGrid" class="category-grid-system">
               <div style="padding: 50px; text-align: center; grid-column: 1/-1; color: #888; font-weight: 600;">
                  Menghubungkan ke server cloud...
               </div>
            </div>
        </div>

        <div id="addCatModal" class="modal-overlay">
           <div class="modal-content">
              <button class="closeModal close-modal-x">&times;</button>
              <h2 style="margin-bottom: 30px;">Tambah Kategori Baru 📁</h2>
              <div class="form-group">
                <label>NAMA KATEGORI</label>
                <input type="text" id="newCatNama" class="form-input" placeholder="Masukkan nama kategori">
              </div>
              <div class="form-group" style="margin-top: 20px;">
                <label>KETERANGAN KATEGORI</label>
                <textarea id="newCatDesc" class="form-input" style="height: 100px; resize: none;" placeholder="Berikan deskripsi singkat..."></textarea>
              </div>
              <div class="form-group" style="margin-top: 20px;">
                <label>FOTO BANNER</label>
                <input type="file" id="newCatImage" class="form-input" accept="image/*">
              </div>
              <button id="saveNewCatBtn" class="btn-submit-modal" style="margin-top: 30px;">BUAT KATEGORI</button>
           </div>
        </div>

        <div id="addProdModal" class="modal-overlay">
           <div class="modal-content">
              <button class="closeModal close-modal-x">&times;</button>
              <h2 style="margin-bottom: 30px;">Tambah Produk Baru 📦</h2>
              <div class="form-group">
                <label>KATEGORI</label>
                <select id="prodCatSelect" class="form-input" style="appearance: auto;"></select>
              </div>
              <div class="form-group" style="margin-top: 20px;">
                <label>NAMA PRODUK</label>
                <input type="text" id="prodName" class="form-input" placeholder="Contoh: Ayam Broiler Super">
              </div>
              <div style="display: flex; gap: 15px; margin-top: 20px;">
                <div style="flex: 1;" class="form-group">
                  <label>HARGA (Rp)</label>
                  <input type="number" id="prodHarga" class="form-input" placeholder="0">
                </div>
                <div style="flex: 1;" class="form-group">
                  <label>STOK AWAL</label>
                  <input type="number" id="prodStok" class="form-input" placeholder="0">
                </div>
              </div>
              <button id="saveNewProdBtn" class="btn-submit-modal" style="margin-top: 30px;">SIMPAN PRODUK</button>
           </div>
        </div>

        <div id="editCatModal" class="modal-overlay">
           <div class="modal-content">
              <button class="closeModal close-modal-x">&times;</button>
              <h2 style="margin-bottom: 30px;">Edit Kategori ✏️</h2>
              <input type="hidden" id="editCatId">
              <div class="form-group"><label>NAMA KATEGORI</label><input type="text" id="editCatNama" class="form-input"></div>
              <div class="form-group" style="margin-top: 20px;"><label>KETERANGAN</label><textarea id="editCatDesc" class="form-input" style="height: 100px; resize: none;"></textarea></div>
              <div class="form-group" style="margin-top: 20px;"><label>FOTO BANNER BARU</label><input type="file" id="editCatImage" class="form-input" accept="image/*"></div>
              <button id="saveEditCatBtn" class="btn-submit-modal" style="margin-top: 30px; background: #f39c12;">SIMPAN PERUBAHAN</button>
           </div>
        </div>
      </section>

      <style>
        /* HEADER PUTIH AKSEN HIJAU */
        .page-header-card {
            background: #ffffff !important; border-radius: 24px !important; padding: 32px 40px !important;
            border: 1px solid #e0eadd !important; box-shadow: 0 8px 24px rgba(0,0,0,0.04) !important;
            position: relative !important; overflow: hidden !important; margin-bottom: 30px !important;
        }
        .page-header-card::before { content: ''; position: absolute; left: 0; top: 0; width: 10px; height: 100%; background: #41644A; }
        .page-header-card h1 { margin: 0; font-size: 2.2rem; font-weight: 950; color: #1f3326; letter-spacing: -1px; }

        /* ACTION CARDS (DIGEDEIN) */
        .action-card {
            background: #4A7255 !important; color: white !important; 
            border-radius: 25px !important; border: 1px solid rgba(255,255,255,0.1) !important;
            transition: 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
            box-shadow: 0 12px 30px rgba(65, 100, 74, 0.15) !important;
        }
        .action-card:hover { transform: translateY(-8px) scale(1.02) !important; background: #568563 !important; box-shadow: 0 20px 40px rgba(65, 100, 74, 0.25) !important; }
        .icon-box-clean { background: rgba(255,255,255,0.15) !important; display: flex; align-items: center; justify-content: center; }

        /* MAIN CONTENT CARD WRAPPER */
        .main-content-card { background: white; border-radius: 32px; border: 1px solid #e0eadd; box-shadow: 0 10px 30px rgba(0,0,0,0.03); padding: 45px; margin-bottom: 40px; }
        .section-title-centered { margin-bottom: 40px; color: #1f3326; font-weight: 950; font-size: 1.8rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .category-grid-system { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }

        /* MODALS & FORMS */
        .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); z-index: 4000; justify-content: center; align-items: center; padding: 20px; }
        .modal-content { background: white; padding: 50px; border-radius: 40px; width: 100%; max-width: 550px; box-shadow: 0 35px 80px rgba(0,0,0,0.3); position: relative; }
        .form-group label { display: block; font-size: 0.8rem; font-weight: 900; color: #4a5a4d; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .form-input { width: 100%; padding: 18px 22px; border-radius: 18px; border: 2px solid #eef2ed; background: #f9fbf9; font-weight: 700; transition: 0.3s; color: #1f3326; font-size: 1rem; }
        .form-input:focus { border-color: #41644A; background: white; outline: none; box-shadow: 0 0 0 5px rgba(65, 100, 74, 0.1); }
        .btn-submit-modal { width: 100%; padding: 20px; background: #41644A; color: white; border: none; border-radius: 20px; font-weight: 950; font-size: 1.1rem; cursor: pointer; transition: 0.3s; letter-spacing: 1px; }
        .btn-submit-modal:hover { background: #35523c; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .close-modal-x { position: absolute; top: 30px; right: 30px; background: none; border: none; font-size: 2.2rem; cursor: pointer; color: #ccc; transition: 0.2s; }
        .close-modal-x:hover { color: #e74c3c; transform: rotate(90deg); }

        /* CATEGORY INDIVIDUAL CARD */
        .category-card { background: #f9fbf9; border: 1px solid #eef2ed; border-radius: 28px; overflow: hidden; display: flex; flex-direction: column; transition: 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .category-card:hover { transform: translateY(-12px); background: white; border-color: #41644A; box-shadow: 0 25px 50px rgba(0,0,0,0.12); }
      </style>
    `;
  },

  async afterRender() {
    const gridContainer = document.getElementById('categoryCardsGrid');
    this._presenter = new JualKomoditasPresenter({
      onDataReady: (komoditas) => {
        this._renderCategoryCards(gridContainer, komoditas);
        this._fillCategorySelect(komoditas);
      },
    });
    await this._presenter.init();

    const SUPABASE_URL = CONFIG.SUPABASE_URL; 
    const SUPABASE_KEY = CONFIG.SUPABASE_KEY;

    const uploadToStorage = async (file) => {
      const cleanFileName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
      const fileName = `${Date.now()}-${cleanFileName}`;
      const response = await fetch(`${SUPABASE_URL}/storage/v1/object/category-photos/${fileName}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': file.type },
        body: file
      });
      if (response.ok) return `${SUPABASE_URL}/storage/v1/object/public/category-photos/${fileName}`;
      return null;
    };

    // Logical Events
    document.getElementById('saveNewCatBtn').onclick = async () => {
      const nameIn = document.getElementById('newCatNama');
      const descIn = document.getElementById('newCatDesc');
      const fileIn = document.getElementById('newCatImage');

      if (!nameIn.value.trim() || !descIn.value.trim() || fileIn.files.length === 0) {
        return alert("Waduh, Nama, Keterangan, dan Foto Kategori wajib diisi semua!");
      }

      let photoUrl = await uploadToStorage(fileIn.files[0]);
      const payload = {
        id: nameIn.value.toLowerCase().trim().replace(/\s+/g, '-'),
        nama: nameIn.value,
        keterangan: descIn.value,
        foto: photoUrl
      };

      const result = await this._presenter.addCategory(payload);
      if (result.status === 'success') {
        alert("Mantap! Kategori Berhasil Dibuat 🚀");
        document.getElementById('addCatModal').style.display = 'none';
        nameIn.value = ''; descIn.value = ''; fileIn.value = '';
      }
    };

    document.getElementById('saveEditCatBtn').onclick = async () => {
      const editNama = document.getElementById('editCatNama');
      const editDesc = document.getElementById('editCatDesc');
      const fileIn = document.getElementById('editCatImage');

      if (!editNama.value.trim() || !editDesc.value.trim()) {
        return alert("Nama dan Keterangan gak boleh kosong pas edit bro!");
      }

      let photoUrl = fileIn.files.length > 0 ? await uploadToStorage(fileIn.files[0]) : null;
      const payload = {
        id: document.getElementById('editCatId').value,
        nama: editNama.value,
        keterangan: editDesc.value,
        foto: photoUrl
      };
      const result = await this._presenter.updateCategory(payload);
      if (result.status === 'success') {
        alert("Perubahan Berhasil Disimpan! ✨");
        document.getElementById('editCatModal').style.display = 'none';
      }
    };

    document.getElementById('saveNewProdBtn').onclick = async () => {
      const nameP = document.getElementById('prodName');
      const hargaP = document.getElementById('prodHarga');
      const stokP = document.getElementById('prodStok');

      if (!nameP.value.trim() || !hargaP.value || !stokP.value) {
        return alert("Waduh, data produknya harus lengkap dulu baru bisa disimpan!");
      }

      const payload = {
        category_id: document.getElementById('prodCatSelect').value,
        nama: nameP.value,
        harga: Number(hargaP.value),
        stok: Number(stokP.value),
        aktif: true
      };
      const result = await this._presenter.addProduct(payload);
      if (result.status === 'success') {
         alert("Produk Baru Berhasil Ditambahkan! 🚀");
         document.getElementById('addProdModal').style.display = 'none';
         nameP.value = ''; hargaP.value = ''; stokP.value = '';
      }
    };

    document.getElementById('openModalCatBtn').onclick = () => document.getElementById('addCatModal').style.display = 'flex';
    document.getElementById('openModalProdBtn').onclick = () => document.getElementById('addProdModal').style.display = 'flex';
    document.querySelectorAll('.closeModal').forEach(btn => {
      btn.onclick = () => document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    });
  },

  _renderCategoryCards(container, komoditas) {
    container.innerHTML = komoditas.map((item) => `
      <div class="category-card">
        <div style="height: 180px; background: ${item.foto ? `url(${item.foto}) center/cover` : '#eee'}; display: flex; align-items: center; justify-content: center;">
           ${!item.foto ? `<span style="font-size: 3rem; opacity: 0.2;">📁</span>` : ''}
        </div>
        <div style="padding: 25px; flex: 1; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="margin: 0; color: #1f3326; font-size: 1.2rem; text-transform: uppercase; font-weight: 900;">${item.nama}</h3>
            <div title="${item.aktif ? 'Aktif' : 'Non-Aktif'}" style="width: 12px; height: 12px; border-radius: 50%; background: ${item.aktif ? '#2ecc71' : '#e74c3c'}; box-shadow: 0 0 8px ${item.aktif ? '#2ecc7166' : '#e74c3c66'};"></div>
          </div>
          
          <p style="color: #666; font-size: 0.85rem; line-height: 1.5; margin: 0 0 20px 0; flex: 1; height: 40px; overflow: hidden;">${item.keterangan || 'Tidak ada keterangan.'}</p>
          
          <div style="background: white; border: 1px solid #eef2ed; padding: 12px; border-radius: 15px; margin-bottom: 20px; text-align: center;">
            <strong style="font-size: 1.1rem; color: #41644A;">${item.totalStok.toLocaleString('id-ID')} UNIT</strong>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <button class="update-btn-table btn-action-text" data-id="${item.id.toLowerCase()}" 
                    style="background: #41644A; color: white; border: none; padding: 12px 5px; border-radius: 12px; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: 0.2s;">KELOLA</button>
            
            <button class="edit-cat-btn btn-action-text" data-id="${item.id}" 
                    style="background: #f39c12; color: white; border: none; padding: 12px 5px; border-radius: 12px; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: 0.2s;">EDIT</button>
            
            <button class="delete-btn btn-action-text" data-id="${item.id}" data-nama="${item.nama}" 
                    style="background: #e74c3c; color: white; border: none; padding: 12px 5px; border-radius: 12px; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: 0.2s;">HAPUS</button>
          </div>
        </div>
      </div>
    `).join('');
    this._bindCardEvents(container);
  },

  _bindCardEvents(container) {
    container.querySelectorAll('.update-btn-table').forEach(btn => btn.onclick = (e) => location.hash = `#/setting-${e.currentTarget.dataset.id}`);
    
    container.querySelectorAll('.edit-cat-btn').forEach(btn => {
      btn.onclick = (e) => {
        const cat = this._presenter._lastData.find(c => c.id === e.currentTarget.dataset.id);
        if (cat) {
          document.getElementById('editCatId').value = cat.id;
          document.getElementById('editCatNama').value = cat.nama;
          document.getElementById('editCatDesc').value = cat.keterangan || '';
          document.getElementById('editCatModal').style.display = 'flex';
        }
      };
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = async (e) => {
        if (confirm(`Hapus kategori "${e.currentTarget.dataset.nama}"?`)) {
          await this._presenter.deleteCategory(e.currentTarget.dataset.id);
        }
      };
    });
  },

  _fillCategorySelect(komoditas) {
    const select = document.getElementById('prodCatSelect');
    if (select) select.innerHTML = komoditas.map(c => `<option value="${c.id}">${c.nama}</option>`).join('');
  }
};

export default JualKomoditas;