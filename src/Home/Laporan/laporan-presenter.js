import AuthService from '../../auth/auth-services.js';
import { CONFIG } from '../../config.js';

class LaporanPresenter {
  constructor() {
    this.isSubmitting = false;
    this.progress = { PAGI: 0, SORE: 0 }; 
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
        
        // 1. Tampilkan data ke tabel histori
        result.data.forEach(item => this._addNewRowToTable(item));

        // 2. Hitung progres terakhir per sesi
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

    this.form.addEventListener('change', (e) => {
      if (e.target.classList.contains('status-kandang-select')) {
        const alertRow = this.form.querySelector('.alert-row');
        if (alertRow) alertRow.style.display = e.target.value === 'TIDAK_STANDAR' ? 'block' : 'none';
      }
    });

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
    const session = this.sessionSelect.value;
    const kandang = this.noKandangSelect.value;
    const photoInput = this.form.querySelector('.kandang-photo');
    
    let photoUrl = ""; // Default kosong

    // 1. Logic Upload Foto: WAJIB AWAIT
    if (photoInput.files && photoInput.files[0]) {
      const formData = new FormData();
      formData.append('foto', photoInput.files[0]);

      try {
        const uploadRes = await fetch(`${CONFIG.BASE_URL}/upload-foto`, {
          method: 'POST',
          body: formData
        });

        const uploadResult = await uploadRes.json();
        if (uploadResult.status === 'success') {
          photoUrl = uploadResult.foto; // 🔥 URL FINAL RAPI
        } else {
          alert('Gagal upload foto ke server');
          return;
        }
      } catch (err) {
        alert('Koneksi upload error');
        return;
      }
    }

    // 2. Kirim Payload dengan URL Foto (Bukan Base64)
    const payload = {
        hewan: this.hewanSelect.value,
        deret: kandang,
        sesi: session,
        kesehatan: this._getSickData(),
        kelayakan: { 
            status: this.form.querySelector('.status-kandang-select').value === 'STANDAR' ? 'LAYAK' : 'TIDAK LAYAK', 
            note: this.form.querySelector('.kandang-note').value, 
            photo: photoUrl // SEKARANG ISINYA URL https://...
        },
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
            alert("Laporan Tersimpan! 🚀");
            this.progress[session] = parseInt(kandang);
            this._addNewRowToTable(result.data); 
            this.form.reset();
            this.stepSesi.style.display = 'none';
        }
    } catch (err) { alert("Server Railway Error!"); }
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
    const kesehatan = data.kesehatan_data || { status: 'SEHAT', detail: [] };
    const kelayakan = data.kelayakan_data || { status: 'LAYAK', note: '', photo: '' };
    const pekerjaan = data.pekerjaan_data || [];

    const newRow = `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 15px;">${time}</td>
        <td style="padding: 15px; font-weight:700;">${data.hewan}</td>
        <td style="padding: 15px;">Deret ${data.deret_kandang}</td>
        <td style="padding: 15px;">${data.sesi}</td>
        <td style="padding: 15px;">
          <button type="button" class="btn-health-pop" data-status="${kesehatan.status}" data-detail='${JSON.stringify(kesehatan.detail)}' 
            style="padding: 5px 10px; border-radius: 6px; border: none; font-weight: 800; cursor: pointer; 
            background: ${kesehatan.status === 'SAKIT' ? '#fff5f5' : '#eef2ed'}; color: ${kesehatan.status === 'SAKIT' ? '#c53030' : '#2d4a36'};">
            ${kesehatan.status}
          </button>
        </td>
        <td style="padding: 15px;">
           <button type="button" class="btn-layak-pop" data-note="${kelayakan.note}" data-photo="${kelayakan.photo}" data-status="${kelayakan.status}"
            style="padding: 5px 10px; border-radius: 6px; border: none; font-weight: 800; cursor: pointer; 
            background: ${kelayakan.status === 'LAYAK' ? '#eef2ed' : '#fff5f5'}; color: ${kelayakan.status === 'LAYAK' ? '#2d4a36' : '#c53030'};">
            ${kelayakan.status}
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

  _renderTaskTable(session) {
    const container = document.getElementById('taskContainer');
    const tasks = session === 'PAGI' ? [
      { text: 'Pemberian Pakan Pagi', type: 'number', unit: 'Kg' },
      { text: 'Cek Kebersihan Alat Minum', type: 'check' },
      { text: 'Pengisian Air Minum', type: 'check' },
      { text: 'Panen Telur Sesi Pagi', type: 'number', unit: 'Butir' },
      { text: 'Cek Kesehatan Hewan', type: 'health' }
    ] : [
      { text: 'Pemberian Pakan SORE', type: 'number', unit: 'Kg' },
      { text: 'Panen Telur Sesi SORE', type: 'number', unit: 'Butir' },
      { text: 'Monitoring Kegiatan SORE', type: 'check' },
      { text: 'Pengasapan SORE', type: 'check' }
    ];
    container.innerHTML = tasks.map(t => `
      <tr style="border-bottom: 1px solid #f4f7f5;">
        <td style="padding: 15px; font-weight: 700;">${t.text}</td>
        <td style="padding: 10px; text-align: center;">
          <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
            ${t.type === 'number' ? `<input type="number" class="task-input" data-unit="${t.unit}" placeholder="${t.unit}" style="width: 80px; padding: 8px;">` : ''}
            ${t.type === 'health' ? `<select class="health-status-select"><option value="SEHAT">SEHAT</option><option value="SAKIT">SAKIT</option></select> <button type="button" class="add-health-btn" style="display:none; padding:6px 12px; border-radius:8px; background:#41644A; color:white; border:none; cursor:pointer;">+ DATA SAKIT</button>` : ''}
          </div>
        </td>
        <td style="padding: 15px; text-align: center;"><input type="checkbox" class="task-check" style="width: 24px; height: 24px;"></td>
      </tr>
      ${t.type === 'health' ? `<tr class="health-detail-row" style="display: none; background: #fff5f5;"><td colspan="3" style="padding: 20px;"><div class="health-entries-container"><div class="health-entry-card" style="border: 1.5px solid #feb2b2; padding: 15px; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;"><div class="form-group"><label>KANDANG</label><input type="text" class="disease-kandang"></div><div class="form-group"><label>AYAM #</label><input type="text" class="disease-ayam"></div></div></div></td></tr>` : ''}
    `).join('');
    this._bindHealthLogic(container);
  }

  _bindHealthLogic(container) {
    const healthSelect = container.querySelector('.health-status-select');
    const addBtn = container.querySelector('.add-health-btn');
    if (healthSelect) {
      healthSelect.onchange = (e) => {
        const isSakit = e.target.value === 'SAKIT';
        container.querySelector('.health-detail-row').style.display = isSakit ? 'table-row' : 'none';
        addBtn.style.display = isSakit ? 'inline-block' : 'none';
      };
    }
  }

  _bindTableButtons(row) {
    row.querySelector('.btn-layak-pop').onclick = (e) => {
      const d = e.currentTarget.dataset;
      if (d.status === 'LAYAK') return alert("Kandang Aman! ✅");
      document.getElementById('modalNote').innerHTML = `<h3 style="color:#c53030;">⚠️ TIDAK LAYAK: ${d.note}</h3>${d.photo ? `<img src="${d.photo}" style="width:100%; border-radius:12px;">` : ''}`;
      document.getElementById('statusModal').style.display = 'flex';
    };

    row.querySelector('.btn-health-pop').onclick = (e) => {
      const status = e.currentTarget.dataset.status;
      if (status === 'SEHAT') return alert("Hewan Sehat! ✅");
      const detail = JSON.parse(e.currentTarget.dataset.detail);
      document.getElementById('modalNote').innerHTML = `<h3>DETAIL HEWAN SAKIT</h3>` + detail.map(d => `<div style="border:1px solid #feb2b2; padding:12px; margin-top:10px; border-radius:10px; background:#fff5f5;"><b>Kandang: ${d.kandang}</b> | Ayam #: ${d.ayam}<br><b>Penyakit:</b> ${d.penyakit}</div>`).join('');
      document.getElementById('statusModal').style.display = 'flex';
    };

    row.querySelector('.btn-task-pop').onclick = (e) => {
      const tasks = JSON.parse(e.currentTarget.dataset.tasks);
      document.getElementById('taskListContent').innerHTML = tasks.map(t => `<div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #eee;"><span>${t.status ? '✅' : '❌'} ${t.name}</span><b>${t.val ? t.val + ' ' + t.unit : ''}</b></div>`).join('');
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