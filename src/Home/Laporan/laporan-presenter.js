import AuthService from '../../auth/auth-services.js';
import { CONFIG } from '../../config.js';

class LaporanPresenter {
  constructor() {
    this.isSubmitting = false;
    this.progress = { PAGI: 0, SORE: 0 }; // Akan diupdate dari database
  }

  async init() {
    this.form = document.getElementById('laporanForm');
    this.hewanSelect = document.getElementById('hewanType');
    this.noKandangSelect = document.getElementById('noKandang');
    this.sessionSelect = document.getElementById('sessionType');
    this.stepSesi = document.getElementById('stepSesi');
    this.tableBody = document.getElementById('reportTableBody');
    this.btnSubmit = document.getElementById('btnSubmit');

    await this._loadCategories();
    await this._fetchReportHistory(); // Tarik data dari cloud saat start
    this._setupEventListeners();
  }

  async _fetchReportHistory() {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/api/laporan`);
      const result = await response.json();
      if (result.status === 'success' && result.data.length > 0) {
        this.tableBody.innerHTML = '';
        
        // 1. Tampilkan data ke tabel
        result.data.forEach(item => {
          this._addNewRowToTable(item);
        });

        // 2. Hitung progres terakhir per sesi
        // Ambil kandang tertinggi yang sudah diisi untuk hari ini (opsional: tambah filter tgl)
        const pagiReports = result.data.filter(r => r.sesi === 'PAGI');
        const soreReports = result.data.filter(r => r.sesi === 'SORE');
        
        if (pagiReports.length > 0) this.progress.PAGI = Math.max(...pagiReports.map(r => r.deret_kandang));
        if (soreReports.length > 0) this.progress.SORE = Math.max(...soreReports.map(r => r.deret_kandang));
      }
    } catch (err) { console.error("Gagal load histori:", err); }
  }

  _setupEventListeners() {
    this.sessionSelect.onchange = (e) => {
      const session = e.target.value;
      if (session) {
        this._renderTaskTable(session);
        this.noKandangSelect.value = "";
        this.stepSesi.style.display = 'none';
        // Kasih tau user giliran kandang berapa
        const next = this.progress[session] + 1;
        console.log(`Sesi ${session} selanjutnya: Kandang ${next}`);
      }
    };

    this.noKandangSelect.onchange = (e) => {
      const selected = parseInt(e.target.value);
      const session = this.sessionSelect.value;
      if (!session) { alert("Pilih Sesi Dulu!"); e.target.value = ""; return; }
      
      const lastProcessed = this.progress[session];
      if (selected !== lastProcessed + 1) {
        alert(`Harus urut Sesi ${session}! Sekarang giliran Kandang ${lastProcessed + 1}`);
        e.target.value = ""; return;
      }
      if (this.hewanSelect.value) this.stepSesi.style.display = 'flex';
    };

    this.form.onsubmit = async (e) => {
      e.preventDefault();
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      this.btnSubmit.disabled = true;
      this.btnSubmit.innerText = "MENYIMPAN KE CLOUD...";
      try { await this._handleSubmit(); } 
      finally { 
        this.isSubmitting = false; 
        this.btnSubmit.disabled = false; 
        this.btnSubmit.innerText = "SIMPAN LAPORAN KANDANG"; 
      }
    };

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.onclick = () => {
        document.getElementById('statusModal').style.display = 'none';
        document.getElementById('taskModal').style.display = 'none';
      };
    });
  }

  async _handleSubmit() {
    const user = AuthService.getUser();
    const payload = {
        hewan: this.hewanSelect.value,
        deret: this.noKandangSelect.value,
        sesi: this.sessionSelect.value,
        kesehatan: this._getSickData(),
        kelayakan: this._getKelayakanData(),
        pekerjaan: this._getTaskList(),
        petugas: user.nama
    };

    try {
        const response = await fetch(`${CONFIG.BASE_URL}/api/laporan/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert("Berhasil!");
            this.progress[payload.sesi] = parseInt(payload.deret);
            this._addNewRowToTable(result.data); 
            this.form.reset();
            this.stepSesi.style.display = 'none';
        }
    } catch (err) { alert("Gagal Simpan!"); }
  }

  _getSickData() {
    let sickData = [];
    const healthSelect = this.form.querySelector('.health-status-select');
    if (healthSelect?.value === 'SAKIT') {
      this.form.querySelectorAll('.health-entry-card').forEach(card => {
        sickData.push({
          kandang: card.querySelector('.disease-kandang').value || '-',
          ayam: card.querySelector('.disease-ayam').value || '-',
          penyakit: card.querySelector('.disease-name').value || '-',
          karantina: card.querySelector('.is-quarantine').value,
          pemulihan: card.querySelector('.recovery-step').value || '-'
        });
      });
    }
    return sickData;
  }

  _getKelayakanData() {
    return {
      status: this.form.querySelector('.status-kandang-select').value,
      note: this.form.querySelector('.kandang-note').value,
      photo: "" // Di sini lo bisa tambah logic upload file beneran ke Supabase Storage
    };
  }

  _getTaskList() {
    let taskList = [];
    this.form.querySelectorAll('#taskContainer tr:not(.health-detail-row)').forEach(row => {
      taskList.push({
        name: row.cells[0].innerText,
        status: row.querySelector('.task-check').checked,
        val: row.querySelector('.task-input')?.value || '',
        unit: row.querySelector('.task-input')?.dataset.unit || ''
      });
    });
    return taskList;
  }

  _addNewRowToTable(data) {
    const time = new Date(data.tanggal_jam).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    // Data di Supabase disimpan sebagai JSONB, jadi sudah otomatis jadi Object/Array
    const kesehatan = data.kesehatan_data || [];
    const kelayakan = data.kelayakan_data || {};
    const pekerjaan = data.pekerjaan_data || [];
    const isSakit = kesehatan.length > 0;

    const newRow = `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 15px;">${time}</td>
        <td style="padding: 15px; font-weight:700;">${data.hewan}</td>
        <td style="padding: 15px;">Deret ${data.deret_kandang}</td>
        <td style="padding: 15px;">${data.sesi}</td>
        <td style="padding: 15px;">
          <button type="button" class="btn-health-pop" data-sakit='${JSON.stringify(kesehatan)}' 
            style="padding: 5px 10px; border-radius: 6px; border: none; font-weight: 800; cursor: pointer; 
            background: ${isSakit ? '#fff5f5' : '#eef2ed'}; color: ${isSakit ? '#c53030' : '#2d4a36'};">
            ${isSakit ? '⚠ SAKIT' : '✅ SEHAT'}
          </button>
        </td>
        <td style="padding: 15px;">
           <button type="button" class="btn-layak-pop" data-note="${kelayakan.note || ''}" data-photo="${kelayakan.photo || ''}" data-status="${kelayakan.status}"
            style="padding: 5px 10px; border-radius: 6px; border: none; font-weight: 800; cursor: pointer; 
            background: ${kelayakan.status === 'STANDAR' ? '#eef2ed' : '#fff5f5'}; color: ${kelayakan.status === 'STANDAR' ? '#2d4a36' : '#c53030'};">
            ${kelayakan.status === 'STANDAR' ? 'STANDAR' : 'GANGGUAN'}
          </button>
        </td>
        <td style="padding: 15px; font-weight:700;">${data.petugas}</td>
        <td style="padding: 15px; text-align: center;">
          <button type="button" class="btn-task-pop" data-tasks='${JSON.stringify(pekerjaan)}' 
            style="background: #6CA651; color: white; border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-weight: 700;">
            LIHAT KERJA
          </button>
        </td>
      </tr>`;

    this.tableBody.insertAdjacentHTML('afterbegin', newRow);
    this._bindTableButtons(this.tableBody.firstElementChild);
  }

  // ... rute renderTaskTable & loadCategories lo sebelumnya tetap sama ...
  _renderTaskTable(session) {
    const container = document.getElementById('taskContainer');
    const tasks = session === 'PAGI' ? [
      { text: 'Pemberian Pakan Pagi', type: 'number', unit: 'Kg' },
      { text: 'Cek Kebersihan Alat Minum', type: 'check' },
      { text: 'Pengisian Air Minum', type: 'check' },
      { text: 'Panen Telur Sesi Pagi', type: 'number', unit: 'Butir' },
      { text: 'Cek Kesehatan Hewan', type: 'health' }
    ] : [
      { text: 'Pemberian Pakan Sore', type: 'number', unit: 'Kg' },
      { text: 'Panen Telur Sesi Sore', type: 'number', unit: 'Butir' },
      { text: 'Monitoring Kegiatan Sore', type: 'check' },
      { text: 'Pengasapan Sore', type: 'check' },
      { text: 'Cek Kesehatan Hewan', type: 'health' }
    ];

    container.innerHTML = tasks.map(t => `
      <tr style="border-bottom: 1px solid #f4f7f5;">
        <td style="padding: 15px; font-weight: 700; color: #1f3326;">${t.text}</td>
        <td style="padding: 10px; text-align: center;">
          <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
            ${t.type === 'number' ? `<input type="number" class="task-input" data-label="${t.text}" data-unit="${t.unit}" placeholder="${t.unit}" style="width: 80px; padding: 8px; border-radius: 8px; border: 1px solid #ddd; text-align: center; font-weight: 800;">` : ''}
            ${t.type === 'health' ? `
               <select class="health-status-select" style="padding: 8px; border-radius: 8px; font-weight: 700; border: 1px solid #ddd; width: 90px;">
                  <option value="SEHAT">SEHAT</option><option value="SAKIT">SAKIT</option>
               </select>
               <button type="button" class="add-health-btn" style="display:none; padding:6px 12px; border-radius:8px; background:#41644A; color:white; border:none; cursor:pointer; font-size:0.75rem; font-weight:900;">+ DATA SAKIT</button>
            ` : ''}
          </div>
        </td>
        <td style="padding: 15px; text-align: center;">
          <input type="checkbox" class="task-check" value="${t.text}" style="width: 24px; height: 24px; accent-color: #41644A;">
        </td>
      </tr>
      ${t.type === 'health' ? `
        <tr class="health-detail-row" style="display: none; background: #fff5f5;">
          <td colspan="3" style="padding: 20px;">
            <div class="health-entries-container">
               <div class="health-entry-card" style="border: 1.5px solid #feb2b2;">
                  <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030; display:block; margin-bottom:5px;">NOMOR KANDANG</label><input type="text" class="disease-kandang" placeholder="01" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;"></div>
                  <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030; display:block; margin-bottom:5px;">NOMOR AYAM</label><input type="text" class="disease-ayam" placeholder="12" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;"></div>
                  <div class="form-group grid-full"><label style="font-size:0.65rem; font-weight:900; color:#c53030; display:block; margin-bottom:5px;">INDIKASI PENYAKIT</label><input type="text" class="disease-name" placeholder="Gejala..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;"></div>
                  <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030; display:block; margin-bottom:5px;">KARANTINA?</label><select class="is-quarantine" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;"><option value="TIDAK">TIDAK</option><option value="YA">YA</option></select></div>
                  <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030; display:block; margin-bottom:5px;">PEMULIHAN</label><input type="text" class="recovery-step" placeholder="Obat..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;"></div>
               </div>
            </div>
          </td>
        </tr>
      ` : ''}
    `).join('');

    this._bindHealthLogic(container);
  }

  _bindHealthLogic(container) {
    const healthSelect = container.querySelector('.health-status-select');
    const addBtn = container.querySelector('.add-health-btn');
    const healthRow = container.querySelector('.health-detail-row');
    const entriesCont = container.querySelector('.health-entries-container');

    if (healthSelect) {
      healthSelect.onchange = (e) => {
        const isSakit = e.target.value === 'SAKIT';
        healthRow.style.display = isSakit ? 'table-row' : 'none';
        addBtn.style.display = isSakit ? 'inline-block' : 'none';
      };
      addBtn.onclick = () => {
        const card = document.createElement('div');
        card.className = 'health-entry-card';
        card.innerHTML = `
          <button type="button" class="btn-remove-entry">✕</button>
          <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">KANDANG</label><input type="text" class="disease-kandang" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
          <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">AYAM #</label><input type="text" class="disease-ayam" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
          <div class="form-group grid-full"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">INDIKASI</label><input type="text" class="disease-name" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
          <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">KARANTINA?</label><select class="is-quarantine" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"><option value="TIDAK">TIDAK</option><option value="YA">YA</option></select></div>
          <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">PEMULIHAN</label><input type="text" class="recovery-step" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
        `;
        card.querySelector('.btn-remove-entry').onclick = () => card.remove();
        entriesCont.appendChild(card);
      };
    }
  }

  _bindTableButtons(row) {
    row.querySelector('.btn-layak-pop').onclick = (e) => {
      const d = e.currentTarget.dataset;
      if (d.status === 'STANDAR') return alert("Kandang Aman! ✅");
      document.getElementById('modalNote').innerHTML = `<div style="background:#fff5f5; padding:15px; border-radius:15px;"><h3 style="color:#c53030;">⚠️ LAPORAN GANGGUAN</h3><p>${d.note}</p>${d.photo ? `<img src="${d.photo}" style="width:100%;">` : ''}</div>`;
      document.getElementById('statusModal').style.display = 'flex';
    };

    row.querySelector('.btn-health-pop').onclick = (e) => {
      const data = JSON.parse(e.currentTarget.dataset.sakit);
      if (data.length === 0) return alert("Sehat semua! ✅");
      document.getElementById('modalNote').innerHTML = `<h3 style="color:#c53030; text-align:center;">DAFTAR HEWAN SAKIT</h3>` + data.map(d => `<div style="border:1px solid #feb2b2; padding:10px; margin-top:10px; border-radius:10px;"><b>Kandang: ${d.kandang}</b> | Ayam: ${d.ayam}<br>Penyakit: ${d.penyakit}</div>`).join('');
      document.getElementById('statusModal').style.display = 'flex';
    };

    row.querySelector('.btn-task-pop').onclick = (e) => {
      const tasks = JSON.parse(e.currentTarget.dataset.tasks);
      document.getElementById('taskListContent').innerHTML = tasks.map(t => `<div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;"><span>${t.status ? '✅' : '❌'} ${t.name}</span><b>${t.val} ${t.unit}</b></div>`).join('');
      document.getElementById('taskModal').style.display = 'flex';
    };
  }

  async _loadCategories() {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/commodities`);
      const r = await res.json();
      if (r.status === 'success') {
        this.hewanSelect.innerHTML = '<option value="">-- Pilih --</option>' + r.data.map(cat => `<option value="${cat.nama}">${cat.nama.toUpperCase()}</option>`).join('');
      }
    } catch (err) {}
  }
}

export default LaporanPresenter;