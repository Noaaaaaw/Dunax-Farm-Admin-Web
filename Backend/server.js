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
    await this._fetchReportHistory(); 
    this._setupEventListeners();
  }

  async _fetchReportHistory() {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/api/laporan`);
      const result = await response.json();
      if (result.status === 'success' && result.data.length > 0) {
        this.tableBody.innerHTML = '';
        result.data.forEach(item => this._addNewRowToTable(item));
        
        const pagiReports = result.data.filter(r => r.sesi === 'PAGI');
        const soreReports = result.data.filter(r => r.sesi === 'SORE');
        if (pagiReports.length > 0) this.progress.PAGI = Math.max(...pagiReports.map(r => r.deret_kandang));
        if (soreReports.length > 0) this.progress.SORE = Math.max(...soreReports.map(r => r.deret_kandang));
      }
    } catch (err) { console.error("Gagal load histori cloud"); }
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
      if (!session) { alert("Pilih Sesi!"); e.target.value = ""; return; }
      
      const last = this.progress[session];
      if (selected !== last + 1) {
        alert(`Urutan Salah! Sesi ${session} giliran Kandang ${last + 1}`);
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
    const session = this.sessionSelect.value;
    const kandang = this.noKandangSelect.value;

    // Logic Detail Kesehatan
    let healthFinalStatus = "SEHAT";
    let sickDetails = [];
    const healthSelect = this.form.querySelector('.health-status-select');
    if (healthSelect?.value === 'SAKIT') {
      healthFinalStatus = "SAKIT";
      this.form.querySelectorAll('.health-entry-card').forEach(card => {
        sickDetails.push({
          kandang: card.querySelector('.disease-kandang').value || '-',
          ayam: card.querySelector('.disease-ayam').value || '-',
          penyakit: card.querySelector('.disease-name').value || '-',
          karantina: card.querySelector('.is-quarantine').value,
          pemulihan: card.querySelector('.recovery-step').value || '-'
        });
      });
    }

    // Logic Detail Kelayakan
    const kelayakanVal = this.form.querySelector('.status-kandang-select').value;
    const note = this.form.querySelector('.kandang-note').value;
    const photoInput = this.form.querySelector('.kandang-photo');
    let photoData = "";
    if (photoInput.files[0]) {
       photoData = await new Promise(r => {
         const reader = new FileReader();
         reader.onload = e => r(e.target.result);
         reader.readAsDataURL(photoInput.files[0]);
       });
    }

    const payload = {
        hewan: this.hewanSelect.value,
        deret: kandang,
        sesi: session,
        kesehatan: { status: healthFinalStatus, detail: sickDetails }, // Detail lebih jelas
        kelayakan: { 
            status: kelayakanVal === 'STANDAR' ? 'LAYAK' : 'TIDAK LAYAK', 
            note: note, 
            photo: photoData 
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
    // Tugas sore tanpa "Cek Kesehatan Hewan"
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
      { text: 'Pengasapan Sore', type: 'check' }
    ];

    container.innerHTML = tasks.map(t => `
      <tr style="border-bottom: 1px solid #f4f7f5;">
        <td style="padding: 15px; font-weight: 700;">${t.text}</td>
        <td style="padding: 10px; text-align: center;">
          ${t.type === 'number' ? `<input type="number" class="task-input" data-unit="${t.unit}" style="width: 80px; padding: 8px;">` : ''}
          ${t.type === 'health' ? `<select class="health-status-select"><option value="SEHAT">SEHAT</option><option value="SAKIT">SAKIT</option></select>` : ''}
        </td>
        <td style="padding: 15px; text-align: center;"><input type="checkbox" class="task-check"></td>
      </tr>
    `).join('');
  }

  _bindTableButtons(row) {
    row.querySelector('.btn-layak-pop').onclick = (e) => {
      const d = e.currentTarget.dataset;
      if (d.status === 'LAYAK') return alert("Kandang Layak & Aman! ✅");
      document.getElementById('modalNote').innerHTML = `<div style="background:#fff5f5; padding:15px; border-radius:15px;"><h3 style="color:#c53030;">⚠️ TIDAK LAYAK: ${d.note}</h3>${d.photo ? `<img src="${d.photo}" style="width:100%; border-radius:10px; margin-top:10px;">` : ''}</div>`;
      document.getElementById('statusModal').style.display = 'flex';
    };

    row.querySelector('.btn-health-pop').onclick = (e) => {
      const status = e.currentTarget.dataset.status;
      const detail = JSON.parse(e.currentTarget.dataset.detail);
      if (status === 'SEHAT') return alert("Semua hewan sehat walafiat! ✅");
      document.getElementById('modalNote').innerHTML = `<h3 style="color:#c53030; text-align:center;">DETAIL HEWAN SAKIT</h3>` + detail.map(d => `<div style="border:1px solid #feb2b2; padding:10px; margin-top:10px; border-radius:10px; background:#fff5f5;"><b>Kandang: ${d.kandang}</b> | Ayam #: ${d.ayam}<br><b>Penyakit:</b> ${d.penyakit}<br><small>Karantina: ${d.karantina} | Pemulihan: ${d.pemulihan}</small></div>`).join('');
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