import { CONFIG, supabase } from '../../config.js';

class PustakaPresenter {
  constructor() {
    this.modal = null;
    this.form = null;
    this.tableBody = null;
    this.btnSubmit = null;
  }

  async init() {
    this.modal = document.getElementById('pustakaModal');
    this.form = document.getElementById('pustakaForm');
    this.tableBody = document.getElementById('pustakaTableBody');
    this.btnSubmit = document.getElementById('btnSubmitPustaka');

    document.getElementById('btnOpenPopup').onclick = () => this._openModal();
    document.getElementById('btnClosePopup').onclick = () => this._closeModal();
    
    this.form.onsubmit = (e) => this._handleSubmit(e);
    
    await this._loadData();
  }

  _openModal(data = null) {
    this.form.reset();
    document.getElementById('pustakaId').value = data ? data.id : "";
    if (data) {
      document.getElementById('namaPustaka').value = data.nama;
      document.getElementById('kategoriPustaka').value = data.kategori;
      document.getElementById('deskripsiPustaka').value = data.deskripsi;
      document.getElementById('urlPustaka').value = data.url;
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

      const result = await response.json();
      if (result.status === 'success') {
        alert('Data Pustaka Berhasil Disimpan! 📚');
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
        this.tableBody.innerHTML = result.data.map(item => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 15px; border: 3px solid white;">
                <img src="${item.foto || 'https://placehold.co/100'}" style="width:60px; height:60px; object-fit:cover; border-radius:10px; border:2px solid #6CA651;">
            </td>
            <td style="padding: 15px; border: 3px solid white; font-weight: 800;">${item.nama}</td>
            <td style="padding: 15px; border: 3px solid white;"><span style="background:#eef2ed; color:#41644A; padding:5px 10px; border-radius:8px; font-size:0.7rem; font-weight:900;">${item.kategori}</span></td>
            <td style="padding: 15px; border: 3px solid white; font-size:0.85rem; max-width:250px;">${item.deskripsi || '-'}</td>
            <td style="padding: 15px; border: 3px solid white;">
                <a href="${item.url}" target="_blank" style="color:#6CA651; font-weight:900; text-decoration:none;">BUKA LINK 🔗</a>
            </td>
            <td style="padding: 15px; border: 3px solid white;">
                <div style="display:flex; gap:5px; justify-content:center;">
                    <button class="btn-edit" style="background:#f0ad4e; color:white; border:none; padding:8px; border-radius:8px; cursor:pointer; font-weight:800;">EDIT</button>
                    <button class="btn-delete" style="background:#d9534f; color:white; border:none; padding:8px; border-radius:8px; cursor:pointer; font-weight:800;">HAPUS</button>
                </div>
            </td>
          </tr>
        `).join('');

        this._bindTableEvents(result.data);
      }
    } catch (err) {
      this.tableBody.innerHTML = `<tr><td colspan="6">Gagal memuat data</td></tr>`;
    }
  }

  _bindTableEvents(data) {
    const editBtns = document.querySelectorAll('.btn-edit');
    const deleteBtns = document.querySelectorAll('.btn-delete');

    editBtns.forEach((btn, index) => {
      btn.onclick = () => this._openModal(data[index]);
    });

    deleteBtns.forEach((btn, index) => {
      btn.onclick = async () => {
        if (confirm(`Hapus materi ${data[index].nama}?`)) {
          const res = await fetch(`${CONFIG.BASE_URL}/api/pustaka/delete/${data[index].id}`, { method: 'DELETE' });
          if ((await res.json()).status === 'success') this._loadData();
        }
      };
    });
  }
}

export default PustakaPresenter;