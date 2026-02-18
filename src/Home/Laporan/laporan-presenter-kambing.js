import AuthService from '../../auth/auth-services.js';
import { CONFIG } from '../../config.js';

class LaporanPresenterKambing {
  constructor() {
    this.isSubmitting = false;
    this.viewDate = new Date();
    this.allData = [];
    this.TOTAL_KANDANG = 9; 
  }

  async init() {
    this.form = document.getElementById('laporanForm');
    this.hewanSelect = document.getElementById('hewanType');
    this.noKandangSelect = document.getElementById('noKandang');
    this.sessionSelect = document.getElementById('sessionType');
    this.taskContainer = document.getElementById('taskContainer');
    this.stepSesi = document.getElementById('stepSesi');
    this.btnSubmit = document.getElementById('btnSubmit');
    this.statusKandang = document.getElementById('statusKandang');
    this.alertRow = document.getElementById('alertRow');
    this.problemListContainer = document.getElementById('problemListContainer');
    this.tableBody = document.getElementById('reportTableBody');
    this.dateDisplay = document.getElementById('currentDateDisplay');

    const currentHour = new Date().getHours();
    this.sessionSelect.value = (currentHour >= 12) ? "SORE" : "PAGI";

    const animalId = window.location.hash.split('-').pop(); 
    await this._loadCategories(animalId);
    await this._fetchReportHistory(); 
    
    this._setupEvents();
    this._renderTasks();
    this._renderTableByDate();
  }

  // --- LOGIKA AUTO CENTANG STATUS ---
  _handleAutoCheck(e) {
    const row = e.target.closest('tr');
    if (!row) return;
    const checkbox = row.querySelector('.task-check');
    if (checkbox) {
      if (e.target.value.trim() !== "") {
        checkbox.checked = true;
      }
    }
  }

  async _compressImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  }

  _setupEvents() {
    this.noKandangSelect.onchange = () => this._checkKandangStatus();
    this.sessionSelect.onchange = () => {
      this._renderTasks();
      this._checkKandangStatus();
    };

    this.taskContainer.addEventListener('input', (e) => this._handleAutoCheck(e));
    this.taskContainer.addEventListener('change', (e) => this._handleAutoCheck(e));

    this.statusKandang.onchange = (e) => {
      if (e.target.value === 'TIDAK_STANDAR') {
        this.alertRow.style.display = 'block';
        if (this.problemListContainer.innerHTML === "") this._addProblemRow();
      } else {
        this.alertRow.style.display = 'none';
        this.problemListContainer.innerHTML = "";
      }
    };

    document.getElementById('btnAddProblem').onclick = () => {
        this._addProblemRow();
        this.statusKandang.value = 'TIDAK_STANDAR';
        this.alertRow.style.display = 'block';
    };

    this.form.onsubmit = async (e) => {
      e.preventDefault();
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      this.btnSubmit.disabled = true;
      this.btnSubmit.innerText = "MENYIMPAN DATA...";

      try {
        const problemRows = Array.from(this.form.querySelectorAll('.problem-entry-row'));
        const problems = [];
        for (const row of problemRows) {
          const fileInput = row.querySelector('.kandang-photo');
          let photoData = "";
          if (fileInput && fileInput.files[0]) photoData = await this._compressImage(fileInput.files[0]);
          problems.push({
            kandang: row.querySelector('.problem-kandang-no').value,
            noKambing: row.querySelector('.problem-kambing-id').value,
            note: row.querySelector('.kandang-note').value,
            photo: photoData 
          });
        }

        const payload = {
          hewan: this.hewanSelect.value,
          deret_kandang: parseInt(this.noKandangSelect.value),
          sesi: this.sessionSelect.value,
          kesehatan_data: this._getHealthData(),
          kelayakan_data: { status: this.statusKandang.value === 'STANDAR' ? 'LAYAK' : 'TIDAK LAYAK', problems },
          pekerjaan_data: this._getTaskList(),
          petugas: AuthService.getUser().nama
        };

        const res = await fetch(`${CONFIG.BASE_URL}/api/laporan-kambing/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          alert("Laporan Berhasil Disimpan! 🐐✨");
          location.reload();
        }
      } catch (err) {
        alert("Gagal simpan data.");
      } finally {
        this.isSubmitting = false;
        this.btnSubmit.disabled = false;
        this.btnSubmit.innerText = "SIMPAN LAPORAN";
      }
    };
  }

  _getHealthData() {
    const status = this.taskContainer.querySelector('.health-status-select')?.value || 'SEHAT';
    const detail = Array.from(this.form.querySelectorAll('.health-entry-card')).map(card => ({
      kandang: card.querySelector('.disease-kandang').value,
      noKambing: card.querySelector('.disease-kambing-id').value, 
      penyakit: card.querySelector('.disease-name').value,
      karantina: card.querySelector('.is-quarantine').value,
      recovery: card.querySelector('.recovery-step').value
    }));
    return { status, detail };
  }

  _getTaskList() {
    return Array.from(this.taskContainer.querySelectorAll('tr:not(.health-detail-row)')).map(row => {
      const taskName = row.cells[0].innerText;
      const isPakan = taskName.includes('Pemberian Pakan');
      const pakanType = row.querySelector('.pakan-type')?.value || '';
      
      return {
        // Simpan jenis pakan ke dalam nama pengerjaan
        name: isPakan ? `Pemberian Pakan (${pakanType})` : taskName,
        status: row.querySelector('.task-check').checked,
        val: row.querySelector('input[type="number"]')?.value || '',
        unit: isPakan ? 'Kg' : '' // Kg hanya untuk pakan
      };
    });
  }

  _renderTasks() {
    const sesi = this.sessionSelect.value;
    const tasks = [
      { text: 'Pemberian Pakan', type: 'pakan' },
      { text: 'Pemberian Minum', type: 'check' },
      { text: 'Cek Kebersihan Kandang', type: 'check' },
      { text: 'Cek Kebersihan Alat Makan & Minum', type: 'check' }
    ];
    if (sesi === 'PAGI') tasks.push({ text: 'Cek Kesehatan', type: 'health' });

    this.taskContainer.innerHTML = tasks.map(t => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 15px; text-align: left; font-weight: 700;">${t.text}</td>
        <td style="padding: 10px;">
          ${t.type === 'pakan' ? `<div style="display:flex; gap:8px; justify-content:center; align-items:center;"><select class="pakan-type" style="padding:8px; border-radius:8px; border:1px solid #ddd; font-weight:700;"><option value="HIJAUAN">HIJAUAN</option><option value="COMBORAN">COMBORAN</option></select><input type="number" step="0.1" class="pakan-val" placeholder="Data" style="width:75px; padding:8px; border-radius:8px; border:1px solid #ddd; text-align:center; font-weight:900;"></div>` : ''}
          ${t.type === 'health' ? `<select class="health-status-select" style="padding: 10px; border-radius: 10px; font-weight: 700; border: 1px solid #ddd; width: 110px;"><option value="SEHAT">SEHAT</option><option value="SAKIT">SAKIT</option></select><button type="button" class="add-health-btn" style="display:none; margin-left:5px; padding:8px; border-radius:10px; background:#41644A; color:white; border:none; cursor:pointer; font-weight:900;">+ DATA</button>` : ''}
        </td>
        <td style="padding: 15px;"><input type="checkbox" class="task-check" style="width: 25px; height: 25px; accent-color: #1f3326;"></td>
      </tr>
      ${t.type === 'health' ? `<tr class="health-detail-row" style="display: none; background: #fff5f5;"><td colspan="3" style="padding: 20px;"><div class="health-entries-container"></div></td></tr>` : ''}
    `).join('');

    if (sesi === 'PAGI') this._bindHealthLogic();
  }

  _bindHealthLogic() {
    const healthSelect = this.taskContainer.querySelector('.health-status-select');
    const addBtn = this.taskContainer.querySelector('.add-health-btn');
    const healthRow = this.taskContainer.querySelector('.health-detail-row');
    const entriesCont = this.taskContainer.querySelector('.health-entries-container');
    
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
        <button type="button" style="position:absolute; top:-10px; right:-10px; background:#c53030; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;" onclick="this.parentElement.remove()">✕</button>
        <div><label style="font-size:0.65rem; font-weight:900; color:#c53030;">KANDANG</label><input type="text" class="disease-kandang" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
        <div><label style="font-size:0.65rem; font-weight:900; color:#c53030;">ID KAMBING</label><input type="text" class="disease-kambing-id" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
        <div style="grid-column:span 2;"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">INDIKASI / GEJALA</label><input type="text" class="disease-name" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
        <div><label style="font-size:0.65rem; font-weight:900; color:#c53030;">KARANTINA?</label><select class="is-quarantine" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"><option value="TIDAK">TIDAK</option><option value="YA">YA</option></select></div>
        <div><label style="font-size:0.65rem; font-weight:900; color:#c53030;">TINDAKAN PEMULIHAN</label><input type="text" class="recovery-step" placeholder="Obat/Tindakan" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
      `;
      entriesCont.appendChild(card);
    };
  }

  _addProblemRow() {
    const div = document.createElement('div');
    div.className = 'problem-entry-row';
    div.style = "background: white; padding: 15px; border-radius: 12px; border: 1.5px solid #feb2b2; margin-bottom: 10px; position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;";
    div.innerHTML = `
      <button type="button" style="position:absolute; top:-10px; right:-10px; background:#c53030; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;" onclick="this.parentElement.remove()">✕</button>
      <div><label style="font-size: 0.7rem; font-weight: 900; color: #c53030;">NO KANDANG</label><input type="text" class="problem-kandang-no" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;"></div>
      <div><label style="font-size: 0.7rem; font-weight: 900; color: #c53030;">ID KAMBING</label><input type="text" class="problem-kambing-id" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;"></div>
      <div style="grid-column: span 2;"><label style="font-size: 0.7rem; font-weight: 900; color: #c53030;">KETERANGAN</label><textarea class="kandang-note" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px; font-family:inherit;"></textarea></div>
      <div style="grid-column: span 2;"><label style="font-size: 0.7rem; font-weight: 900; color: #c53030;">FOTO BUKTI</label><input type="file" class="kandang-photo" accept="image/*" style="width:100%;"></div>`;
    this.problemListContainer.appendChild(div);
  }

  async _loadCategories(id) {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/commodities`);
      const r = await res.json();
      const animal = r.data.find(item => item.id.toLowerCase() === id.toLowerCase());
      if (animal) {
        this.hewanSelect.innerHTML = `<option value="${animal.nama}">${animal.nama.toUpperCase()}</option>`;
        this.hewanSelect.disabled = true;
      }
    } catch (e) { console.error(e); }
  }

  async _fetchReportHistory() {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/api/laporan-kambing`);
      const result = await response.json();
      if (result.status === 'success') this.allData = result.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (err) { console.error(err); }
  }

  // --- LOGIKA MUNCULKAN TANGGAL DI HEADER TABEL ---
  _renderTableByDate() {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = '';
    const selectedDateStr = this.viewDate.toLocaleDateString('id-ID');
    
    // TANGGAL HEADER TABEL
    if (this.dateDisplay) {
        this.dateDisplay.innerText = this.viewDate.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }).toUpperCase();
    }

    const filtered = this.allData.filter(item => new Date(item.tanggal_jam).toLocaleDateString('id-ID') === selectedDateStr);
    if (filtered.length > 0) filtered.forEach(item => this._addNewRowToTable(item));
    else this.tableBody.innerHTML = '<tr><td colspan="8" style="padding:30px; color:#ccc; text-align:center;">Belum ada laporan di tanggal ini.</td></tr>';
  }

  _addNewRowToTable(data) {
    const time = new Date(data.tanggal_jam).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const row = `
      <tr style="border-bottom: 1px solid #eee; text-align: center;">
        <td style="padding: 15px;">${time} WIB</td>
        <td style="padding: 15px; font-weight:700;">${data.hewan}</td>
        <td style="padding: 15px;">Blok ${data.deret_kandang}</td>
        <td style="padding: 15px;">${data.sesi}</td>
        <td style="padding: 15px;"><button type="button" class="btn-health-pop" data-status="${data.kesehatan_data.status}" data-detail='${JSON.stringify(data.kesehatan_data.detail)}' style="padding:5px 10px; border-radius:8px; border:none; background:${data.kesehatan_data.status==='SAKIT'?'#fff5f5':'#eef2ed'}; color:${data.kesehatan_data.status==='SAKIT'?'#c53030':'#2d4a36'}; font-weight:800; cursor:pointer;">${data.kesehatan_data.status}</button></td>
        <td style="padding: 15px;"><button type="button" class="btn-layak-pop" data-status="${data.kelayakan_data.status}" data-problems='${JSON.stringify(data.kelayakan_data.problems)}' style="padding:5px 10px; border-radius:8px; border:none; background:${data.kelayakan_data.status==='TIDAK LAYAK'?'#fff5f5':'#eef2ed'}; color:${data.kelayakan_data.status==='TIDAK LAYAK'?'#c53030':'#2d4a36'}; font-weight:800; cursor:pointer;">${data.kelayakan_data.status}</button></td>
        <td style="padding: 15px; font-weight:700;">${data.petugas}</td>
        <td style="padding: 15px;"><button type="button" class="btn-task-pop" data-tasks='${JSON.stringify(data.pekerjaan_data)}' style="background:#6CA651; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:900;">LIHAT KERJA</button></td>
      </tr>`;
    this.tableBody.insertAdjacentHTML('afterbegin', row);
    if (this._bindTableButtons) this._bindTableButtons(this.tableBody.firstElementChild);
  }

  _checkKandangStatus() {
    const selectedDeret = parseInt(this.noKandangSelect.value);
    const selectedSesi = this.sessionSelect.value;
    if (!selectedDeret || !selectedSesi) return;

    const todayStr = new Date().toLocaleDateString('id-ID');
    const reportsToday = this.allData.filter(item => 
      new Date(item.tanggal_jam).toLocaleDateString('id-ID') === todayStr && 
      item.sesi === selectedSesi
    );
    
    // 1. NOTIF URUTAN SALAH (Longkap Deret)
    for (let i = 1; i < selectedDeret; i++) {
      if (!reportsToday.some(item => item.deret_kandang === i)) {
        alert(`Urutan Salah! Sekarang giliran Deret ${i}`); // Format sesuai permintaan
        this.noKandangSelect.value = "";
        this.stepSesi.style.display = 'none';
        return;
      }
    }
    
    // 2. NOTIF JIKA DERET SUDAH PERNAH DIISI (Format disamakan)
    if (reportsToday.some(item => item.deret_kandang === selectedDeret)) {
      alert(`Urutan Salah! Deret ${selectedDeret} sudah dikerjakan.`); // Pesan disamakan gaya bahasanya
      this.noKandangSelect.value = "";
      this.stepSesi.style.display = 'none';
    } else {
      this.stepSesi.style.display = 'flex';
    }
  }
}

export default LaporanPresenterKambing;