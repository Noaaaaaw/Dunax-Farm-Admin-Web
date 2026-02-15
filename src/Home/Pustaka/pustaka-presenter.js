import { CONFIG, supabase } from '../../config.js';

class PustakaPresenter {
  constructor() {
    this.allData = []; 
  }

  async init() {
    this.modal = document.getElementById('pustakaModal');
    this.form = document.getElementById('pustakaForm');
    this.tableBody = document.getElementById('pustakaTableBody');
    this.btnSubmit = document.getElementById('btnSubmitPustaka');
    this.searchInput = document.getElementById('searchInput');

    document.getElementById('btnOpenPopup').onclick = () => this._openModal();
    document.getElementById('btnClosePopup').onclick = () => this._closeModal();
    
    // Logic Pencarian (Filter Kategori Dihapus)
    this.searchInput.oninput = () => this._applyFilter();

    this.form.onsubmit = (e) => this._handleSubmit(e);
    
    await this._loadData();
  }

  _applyFilter() {
    const query = this.searchInput.value.toLowerCase();

    const filtered = this.allData.filter(item => {
        return item.nama.toLowerCase().includes(query) || 
               (item.deskripsi && item.deskripsi.toLowerCase().includes(query));
    });

    this._renderTable(filtered);
  }

  _openModal(data = null) {
    this.form.reset();
    document.getElementById('pustakaId').value = data ? data.id : "";
    if (data) {
      document.getElementById('namaPustaka').value = data.nama;
      document.getElementById('kategoriPustaka').value = data.kategori;
      document.getElementById('deskripsiPustaka').value = data.deskripsi || "";
      document.getElementById('urlPustaka').value = data.url || "";
      this.btnSubmit.innerText = "UPDATE DATA";
    } else {
      this.btnSubmit.innerText = "SIMPAN DATA";
    }
    this.modal.style.display = "flex";
  }

  _closeModal() {
    this.modal.style.display = "none";
  }

  async _uploadFile(file) {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await supabase.storage.from('pustaka-files').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('pustaka-files').getPublicUrl(fileName).data.publicUrl;
  }

  async _handleSubmit(e) {
    e.preventDefault();
    this.btnSubmit.disabled = true;
    this.btnSubmit.innerText = "PROCESSING...";

    try {
      const id = document.getElementById('pustakaId').value;
      const file = document.getElementById('fotoPustaka').files[0];
      let fotoUrl = null;
      
      if (file) fotoUrl = await this._uploadFile(file);

      const payload = {
        id: id || null,
        nama: document.getElementById('namaPustaka').value,
        kategori: document.getElementById('kategoriPustaka').value,
        deskripsi: document.getElementById('deskripsiPustaka').value,
        url: document.getElementById('urlPustaka').value,
        foto: fotoUrl
      };

      const endpoint = id ? '/api/pustaka/update' : '/api/pustaka/save';
      const response = await fetch(`${CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if ((await response.json()).status === 'success') {
        alert('Berhasil Disimpan! 📚');
        this._closeModal();
        await this._loadData();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      this.btnSubmit.disabled = false;
      this.btnSubmit.innerText = "SIMPAN DATA";
    }
  }

  async _loadData() {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/api/pustaka/history`);
      const result = await res.json();
      if (result.status === 'success') {
        this.allData = result.data;
        this._renderTable(this.allData);
      }
    } catch (err) {
      this.tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Gagal sinkron data cloud</td></tr>`;
    }
  }

  _renderTable(data) {
    if (data.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="6" style="padding:50px; color:#888; font-weight:800; text-align: center;">TIDAK ADA DATA COCOK</td></tr>`;
      return;
    }

    this.tableBody.innerHTML = data.map(item => `
      <tr style="border-bottom: 3px solid white; background:#fdfdfd;">
        <td style="padding: 15px; border: 3px solid white; text-align: center;">
            <img src="${item.foto || 'https://placehold.co/100'}" class="zoomable-img" data-src="${item.foto}" style="width:75px; height:75px; object-fit:cover; border-radius:12px; border:3px solid #6CA651; cursor:zoom-in;">
        </td>
        <td style="padding: 15px; border: 3px solid white; font-weight: 900; text-transform: uppercase; text-align: center;">${item.nama}</td>
        <td style="padding: 15px; border: 3px solid white; text-align: center;">
            <span style="background:#eef2ed; color:#41644A; padding:6px 12px; border-radius:10px; font-size:0.75rem; font-weight:900;">${item.kategori}</span>
        </td>
        <td style="padding: 15px; border: 3px solid white; font-size:0.85rem; max-width:350px; line-height:1.4; text-align: center;">${item.deskripsi || '-'}</td>
        <td style="padding: 15px; border: 3px solid white; text-align: center;">
            <div style="display:flex; flex-direction:column; gap:5px; align-items:center;">
                <a href="${item.url}" target="_blank" style="color:#6CA651; font-weight:900; text-decoration:none; font-size:0.8rem; background:#f0f7f0; padding:8px 12px; border-radius:8px;">BUKA LINK 🔗</a>
                <span style="font-size:0.6rem; color:#888; word-break:break-all; max-width:150px;">${item.url || ''}</span>
            </div>
        </td>
        <td style="padding: 15px; border: 3px solid white; text-align: center;">
            <div style="display:flex; gap:8px; justify-content:center;">
                <button class="btn-edit" data-id="${item.id}" style="background:#f0ad4e; color:white; border:none; padding:10px 15px; border-radius:10px; cursor:pointer; font-weight:800; font-size:0.7rem;">EDIT</button>
                <button class="btn-delete" data-id="${item.id}" style="background:#d9534f; color:white; border:none; padding:10px 15px; border-radius:10px; cursor:pointer; font-weight:800; font-size:0.7rem;">HAPUS</button>
            </div>
        </td>
      </tr>
    `).join('');

    this._setupTableEvents(data);
  }

  _setupTableEvents(data) {
    document.querySelectorAll('.zoomable-img').forEach(img => {
      img.onclick = () => {
        const modal = document.getElementById('zoomModal');
        const imgZoom = document.getElementById('imgZoomed');
        imgZoom.src = img.dataset.src;
        modal.style.display = 'flex';
      };
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.onclick = () => {
        const item = this.allData.find(x => x.id == btn.dataset.id);
        this._openModal(item);
      };
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.onclick = async () => {
        if (confirm(`Hapus materi ini?`)) {
          const res = await fetch(`${CONFIG.BASE_URL}/api/pustaka/delete/${btn.dataset.id}`, { method: 'DELETE' });
          if ((await res.json()).status === 'success') await this._loadData();
        }
      };
    });
  }
}

export default PustakaPresenter;