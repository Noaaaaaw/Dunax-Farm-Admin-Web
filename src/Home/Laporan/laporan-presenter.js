import AuthService from '../../auth/auth-services.js';
import { CONFIG } from '../../config.js';

class LaporanPresenter {
  constructor() {
    this.isSubmitting = false;
    this.progress = { PAGI: 0, SORE: 0 }; 
    this.viewDate = new Date(); 
    this.allData = []; 
  }

  async init() {
    this.form = document.getElementById('laporanForm');
    this.hewanSelect = document.getElementById('hewanType');
    this.noKandangSelect = document.getElementById('noKandang');
    this.sessionSelect = document.getElementById('sessionType');
    this.stepSesi = document.getElementById('stepSesi');
    this.tableBody = document.getElementById('reportTableBody');
    this.btnSubmit = document.getElementById('btnSubmit');
    this.dateDisplay = document.getElementById('currentDateDisplay');

    await this._loadCategories();
    await this._fetchReportHistory(); 
    this._setupEventListeners();
    this._renderTableByDate(); 
  }

  async _fetchReportHistory() {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/api/laporan`);
      const result = await response.json();
      if (result.status === 'success') {
        this.allData = result.data; 
      }
    } catch (err) { console.error("Gagal sinkron cloud:", err); }
  }

  _renderTableByDate() {
    this.tableBody.innerHTML = '';
    const selectedDateStr = this.viewDate.toLocaleDateString('id-ID');
    const todayStr = new Date().toLocaleDateString('id-ID');
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.dateDisplay.innerText = this.viewDate.toLocaleDateString('id-ID', options).toUpperCase();

    const filteredReports = this.allData.filter(item => {
      return new Date(item.tanggal_jam).toLocaleDateString('id-ID') === selectedDateStr;
    });

    if (filteredReports.length > 0) {
      filteredReports.sort((a, b) => new Date(b.tanggal_jam) - new Date(a.tanggal_jam));
      filteredReports.forEach(item => this._addNewRowToTable(item));

      if (selectedDateStr === todayStr) {
        const pagiReports = filteredReports.filter(r => r.sesi === 'PAGI');
        const soreReports = filteredReports.filter(r => r.sesi === 'SORE');
        this.progress.PAGI = pagiReports.length > 0 ? Math.max(...pagiReports.map(r => r.deret_kandang)) : 0;
        this.progress.SORE = soreReports.length > 0 ? Math.max(...soreReports.map(r => r.deret_kandang)) : 0;
      }
    } else {
      this.tableBody.innerHTML = '<tr><td colspan="8" style="padding: 30px; color: #ccc; text-align: center;">Tidak ada laporan pada tanggal ini.</td></tr>';
      if (selectedDateStr === todayStr) this.progress = { PAGI: 0, SORE: 0 };
    }
  }

  _setupEventListeners() {
    document.getElementById('prevDate').onclick = () => {
      this.viewDate.setDate(this.viewDate.getDate() - 1);
      this._renderTableByDate();
    };

    document.getElementById('nextDate').onclick = () => {
      this.viewDate.setDate(this.viewDate.getDate() + 1);
      this._renderTableByDate();
    };

    this.form.addEventListener('change', (e) => {
      if (e.target.classList.contains('status-kandang-select')) {
        const alertRow = this.form.querySelector('.alert-row');
        if (alertRow) alertRow.style.display = e.target.value === 'TIDAK_STANDAR' ? 'block' : 'none';
      }
    });

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
      const todayStr = new Date().toLocaleDateString('id-ID');

      if (this.viewDate.toLocaleDateString('id-ID') !== todayStr) {
        alert("Pindah ke hari ini untuk input data baru!");
        e.target.value = ""; return;
      }

      if (!session) { alert("Pilih Sesi Dulu!"); e.target.value = ""; return; }
      
      const lastProcessed = this.progress[session];
      if (selected !== lastProcessed + 1) {
        alert(`Urutan Salah! Sekarang giliran Kandang ${lastProcessed + 1}`);
        e.target.value = ""; return;
      }
      if (this.hewanSelect.value) this.stepSesi.style.display = 'flex';
    };

    this.form.onsubmit = async (e) => {
      e.preventDefault();
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      this.btnSubmit.disabled = true;
      this.btnSubmit.innerText = "MENYIMPAN...";
      try { 
        await this._handleSubmit(); 
        await this._fetchReportHistory(); 
        this._renderTableByDate(); 
      } finally { 
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
        if (isSakit && entriesCont.innerHTML === "") addBtn.click();
      };

      addBtn.onclick = () => {
        const card = document.createElement('div');
        card.className = 'health-entry-card';
        card.style = "border: 1.5px solid #feb2b2; padding: 15px; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; position: relative; background: #fff;";
        card.innerHTML = `
          <button type="button" class="btn-remove-entry" style="position:absolute; top:-10px; right:-10px; background:#c53030; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;">✕</button>
          <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">NOMOR KANDANG</label><input type="text" class="disease-kandang" placeholder="01" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
          <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">NOMOR AYAM</label><input type="text" class="disease-ayam" placeholder="12" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
          <div class="form-group" style="grid-column:span 2;"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">INDIKASI</label><input type="text" class="disease-name" placeholder="Gejala..." style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
          <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">KARANTINA?</label><select class="is-quarantine" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"><option value="TIDAK">TIDAK</option><option value="YA">YA</option></select></div>
          <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">PEMULIHAN</label><input type="text" class="recovery-step" placeholder="Obat..." style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>`;
        card.querySelector('.btn-remove-entry').onclick = () => card.remove();
        entriesCont.appendChild(card);
      };
    }
  }

  async _handleSubmit() {
    const user = AuthService.getUser();
    const session = this.sessionSelect.value;
    const kandang = this.noKandangSelect.value;

    let healthStatus = "SEHAT";
    let healthDetail = [];
    const healthSelect = this.form.querySelector('.health-status-select');
    if (healthSelect?.value === 'SAKIT') {
      healthStatus = "SAKIT";
      this.form.querySelectorAll('.health-entry-card').forEach(card => {
        healthDetail.push({
          kandang: card.querySelector('.disease-kandang').value || '-',
          ayam: card.querySelector('.disease-ayam').value || '-',
          penyakit: card.querySelector('.disease-name').value || '-',
          karantina: card.querySelector('.is-quarantine').value,
          pemulihan: card.querySelector('.recovery-step').value || '-'
        });
      });
    }

    const kelayakanSelect = this.form.querySelector('.status-kandang-select').value;
    const kelayakanStatus = kelayakanSelect === 'STANDAR' ? 'LAYAK' : 'TIDAK LAYAK';
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
        kesehatan: { status: healthStatus, detail: healthDetail },
        kelayakan: { status: kelayakanStatus, note: note, photo: photoData },
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
            alert("Laporan Berhasil Disimpan! ☁️");
            this.form.reset();
            this.stepSesi.style.display = 'none';
        }
    } catch (err) { alert("Gagal Simpan Database!"); }
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
    const time = new Date(data.tanggal_jam).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const kesehatan = data.kesehatan_data || { status: 'SEHAT', detail: [] };
    const kelayakan = data.kelayakan_data || { status: 'LAYAK', note: '', photo: '' };
    const pekerjaan = data.pekerjaan_data || [];

    const healthColor = kesehatan.status === 'SAKIT' ? { bg: '#fff5f5', text: '#c53030' } : { bg: '#eef2ed', text: '#2d4a36' };
    const layakColor = kelayakan.status === 'TIDAK LAYAK' ? { bg: '#fff5f5', text: '#c53030' } : { bg: '#eef2ed', text: '#2d4a36' };

    const newRow = `
      <tr style="border-bottom: 1px solid #eee; text-align: center;">
        <td style="padding: 15px;">${time} WIB</td>
        <td style="padding: 15px; font-weight:700;">${data.hewan}</td>
        <td style="padding: 15px;">Deret ${data.deret_kandang}</td>
        <td style="padding: 15px;">${data.sesi}</td>
        <td style="padding: 15px;">
          <button type="button" class="btn-health-pop" data-status="${kesehatan.status}" data-detail='${JSON.stringify(kesehatan.detail)}' 
            style="padding: 5px 12px; border-radius: 8px; border: none; font-weight: 800; cursor: pointer; background: ${healthColor.bg}; color: ${healthColor.text};">
            ${kesehatan.status}
          </button>
        </td>
        <td style="padding: 15px;">
           <button type="button" class="btn-layak-pop" data-note="${kelayakan.note}" data-photo="${kelayakan.photo}" data-status="${kelayakan.status}"
            style="padding: 5px 12px; border-radius: 8px; border: none; font-weight: 800; cursor: pointer; background: ${layakColor.bg}; color: ${layakColor.text};">
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
            ${t.type === 'number' ? `<input type="number" class="task-input" data-unit="${t.unit}" placeholder="${t.unit}" style="width: 80px; padding: 8px; text-align: center; font-weight: 800; border-radius: 8px; border: 1px solid #ddd;">` : ''}
            ${t.type === 'health' ? `<select class="health-status-select" style="padding: 8px; border-radius: 8px; font-weight: 700; border: 1px solid #ddd; width: 90px;"><option value="SEHAT">SEHAT</option><option value="SAKIT">SAKIT</option></select> <button type="button" class="add-health-btn" style="display:none; padding:6px 12px; border-radius:8px; background:#41644A; color:white; border:none; cursor:pointer; font-size:0.75rem; font-weight:900;">+ DATA SAKIT</button>` : ''}
          </div>
        </td>
        <td style="padding: 15px; text-align: center;"><input type="checkbox" class="task-check" style="width: 24px; height: 24px; accent-color: #41644A;"></td>
      </tr>
      ${t.type === 'health' ? `<tr class="health-detail-row" style="display: none; background: #fff5f5;"><td colspan="3" style="padding: 20px;"><div class="health-entries-container"></div></td></tr>` : ''}
    `).join('');
    this._bindHealthLogic(container);
  }

  _bindTableButtons(row) {
    // Tombol Pop-up Kesehatan (TABEL DIPISAH)
    row.querySelector('.btn-health-pop').onclick = (e) => {
        const status = e.currentTarget.dataset.status;
        if (status === 'SEHAT') return alert("Hewan Sehat Semua! ✅");
        
        const detail = JSON.parse(e.currentTarget.dataset.detail);
        document.getElementById('modalNote').innerHTML = `
          <h3 style="color:#c53030; text-align:center; font-weight:900; margin-bottom:15px;">DETAIL HEWAN SAKIT ⚠️</h3>
          <div style="overflow-x:auto; border-radius:12px; border:1px solid #feb2b2;">
            <table style="width:100%; border-collapse:collapse; background:white; font-size:0.8rem;">
              <thead style="background:#6CA651; color:white;">
                <tr>
                  <th style="padding:10px; border:1px solid #feb2b2;">KDG</th>
                  <th style="padding:10px; border:1px solid #feb2b2;">AYAM</th>
                  <th style="padding:10px; border:1px solid #feb2b2;">GEJALA</th>
                  <th style="padding:10px; border:1px solid #feb2b2;">OBAT</th>
                  <th style="padding:10px; border:1px solid #feb2b2;">KARANTINA</th>
                </tr>
              </thead>
              <tbody>
                ${detail.map(d => `
                  <tr style="text-align:center;">
                    <td style="padding:10px; border:1px solid #feb2b2; font-weight:900;">${d.kandang}</td>
                    <td style="padding:10px; border:1px solid #feb2b2;">${d.ayam}</td>
                    <td style="padding:10px; border:1px solid #feb2b2; text-align:left;">${d.penyakit}</td>
                    <td style="padding:10px; border:1px solid #feb2b2; text-align:left;">${d.pemulihan}</td>
                    <td style="padding:10px; border:1px solid #feb2b2; font-weight:bold; color:${d.karantina === 'YA' ? '#c53030' : '#2d4a36'}">
                      ${d.karantina}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        document.getElementById('statusModal').style.display = 'flex';
    };

    // Tombol Pop-up Kelayakan
    row.querySelector('.btn-layak-pop').onclick = (e) => {
      const d = e.currentTarget.dataset;
      const isBad = d.status === 'TIDAK LAYAK';
      document.getElementById('modalNote').innerHTML = `
        <h3 style="color:${isBad?'#c53030':'#2d4a36'}; text-align:center; font-weight:900; margin-bottom:10px;">STATUS KANDANG: ${d.status}</h3>
        ${isBad ? `<div style="background:#fff5f5; padding:15px; border-radius:12px; border:1px solid #feb2b2; text-align:center; color:#c53030; font-weight:bold;">${d.note}</div>` : `<p style="text-align:center;">Kandang dalam kondisi prima. ✅</p>`}
        ${d.photo ? `<img src="${d.photo}" style="width:100%; border-radius:15px; margin-top:15px; border:1px solid #ddd;">` : ''}
      `;
      document.getElementById('statusModal').style.display = 'flex';
    };

    // Tombol Pop-up Pekerjaan (TABEL)
    row.querySelector('.btn-task-pop').onclick = (e) => {
      const tasks = JSON.parse(e.currentTarget.dataset.tasks);
      document.getElementById('taskListContent').innerHTML = `
        <div style="overflow-x:auto; border-radius:12px; border:1px solid #eef2ed; margin-top:10px;">
          <table style="width:100%; border-collapse:collapse; background:white; font-size:0.85rem;">
            <thead style="background:#6CA651; color:white;">
              <tr>
                <th style="padding:10px; border:1px solid #eef2ed;">TUGAS</th>
                <th style="padding:10px; border:1px solid #eef2ed; text-align:center;">HASIL</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map(t => `
                <tr>
                  <td style="padding:10px; border:1px solid #eef2ed;">${t.status?'✅':'❌'} ${t.name}</td>
                  <td style="padding:10px; border:1px solid #eef2ed; text-align:center; font-weight:900; color:#41644A;">${t.val || '-'} ${t.unit || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
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