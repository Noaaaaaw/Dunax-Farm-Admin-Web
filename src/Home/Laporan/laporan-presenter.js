import AuthService from '../../auth/auth-services.js';
import { CONFIG } from '../../config.js';

class LaporanPresenter {
  constructor() {
    this.isSubmitting = false;
    this.progress = { PAGI: 0, SORE: 0 }; 
    this.viewDate = new Date(); 
    this.allData = []; 
    this.tempPanenData = []; 
    this.MAX_KANDANG_PER_SESI = 10;
    this.MAX_TELUR_PER_HARI = 5; // ✅ Kuota Maksimal
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

    const currentHour = new Date().getHours();
    let initialSession = (currentHour >= 12) ? "SORE" : "PAGI";

    if (initialSession === "PAGI" && this.progress.PAGI >= this.MAX_KANDANG_PER_SESI) {
        initialSession = "SORE";
    }

    this.sessionSelect.value = initialSession;
    this._renderTaskTable(initialSession);
    this._setupEventListeners();
    this._setupKelayakanLogic();
    this._renderTableByDate(); 
  }

  async _fetchReportHistory() {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/api/laporan`);
      const result = await response.json();
      if (result.status === 'success') {
        this.allData = result.data; 
        const todayStr = new Date().toLocaleDateString('id-ID');
        const todayReports = this.allData.filter(item => 
            new Date(item.tanggal_jam).toLocaleDateString('id-ID') === todayStr
        );
        const pagiReps = todayReports.filter(r => r.sesi === 'PAGI');
        const soreReps = todayReports.filter(r => r.sesi === 'SORE');
        this.progress.PAGI = pagiReps.length > 0 ? Math.max(...pagiReps.map(r => parseInt(r.deret_kandang))) : 0;
        this.progress.SORE = soreReps.length > 0 ? Math.max(...soreReps.map(r => parseInt(r.deret_kandang))) : 0;
      }
    } catch (err) { console.error("Gagal sinkron cloud:", err); }
  }

  _renderTableByDate() {
    this.tableBody.innerHTML = '';
    const selectedDateStr = this.viewDate.toLocaleDateString('id-ID');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.dateDisplay.innerText = this.viewDate.toLocaleDateString('id-ID', options).toUpperCase();
    const filteredReports = this.allData.filter(item => new Date(item.tanggal_jam).toLocaleDateString('id-ID') === selectedDateStr);
    if (filteredReports.length > 0) {
      filteredReports.sort((a, b) => new Date(b.tanggal_jam) - new Date(a.tanggal_jam));
      filteredReports.forEach(item => this._addNewRowToTable(item));
    } else {
      this.tableBody.innerHTML = '<tr><td colspan="9" style="padding: 30px; color: #ccc; text-align: center;">Tidak ada laporan pada tanggal ini.</td></tr>';
    }
  }

  _setupEventListeners() {
    document.getElementById('prevDate').onclick = () => { this.viewDate.setDate(this.viewDate.getDate() - 1); this._renderTableByDate(); };
    document.getElementById('nextDate').onclick = () => { this.viewDate.setDate(this.viewDate.getDate() + 1); this._renderTableByDate(); };

    this.sessionSelect.onchange = (e) => {
      this._renderTaskTable(e.target.value);
      this.noKandangSelect.value = "";
      this.stepSesi.style.display = 'none';
      this.tempPanenData = []; 
    };

    this.noKandangSelect.onchange = (e) => {
      const selected = parseInt(e.target.value);
      const session = this.sessionSelect.value;
      const lastProcessed = this.progress[session];

      if (session === 'PAGI' && lastProcessed >= this.MAX_KANDANG_PER_SESI) {
        alert("SESI PAGI SELESAI! SILAHKAN PINDAH KE SESI SORE");
        this.sessionSelect.value = 'SORE';
        this._renderTaskTable('SORE');
        e.target.value = "";
        return;
      }

      if (selected !== lastProcessed + 1) {
        alert(`Urutan Salah! Sekarang giliran Deret ${lastProcessed + 1}`);
        e.target.value = "";
        return;
      }

      this.tempPanenData = [];
      if (this.hewanSelect.value) this.stepSesi.style.display = 'flex';
    };

    // --- LOGIKA MODAL PANEN OTOMATIS ---
    const panenModal = document.getElementById('panenModal');
    const panenEntries = document.getElementById('panenEntries');
    
    document.body.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-open-panen')) {
        this._generatePanenKandang(); // Generate otomatis 1-15 sesuai deret
        panenModal.style.display = 'flex';
      }
    });

    document.getElementById('btnSavePanen').onclick = () => {
        const rows = document.querySelectorAll('.panen-row');
        let total = 0;
        let valid = true;
        this.tempPanenData = [];

        rows.forEach(row => {
            const no = row.querySelector('.p-no-kandang').value;
            const inputVal = parseFloat(row.querySelector('.p-jumlah').value) || 0;
            const quota = parseFloat(row.querySelector('.p-jumlah').dataset.quota);

            if (inputVal > quota) {
                alert(`Kandang ${no} Over Quota! Maks sisa hari ini: ${quota}`);
                valid = false;
            }
            if (no) { 
                this.tempPanenData.push({ noKandang: no, jumlah: inputVal }); 
                total += inputVal; 
            }
        });

        if (!valid) return;
        
        const btnPanen = document.querySelector('.btn-open-panen');
        if (btnPanen) {
            btnPanen.innerText = `PANEN: ${total} BUTIR ✅`;
            btnPanen.style.background = '#1f3326';
        }
        panenModal.style.display = 'none';
    };

    this.form.onsubmit = async (e) => {
      e.preventDefault();
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      this.btnSubmit.disabled = true;
      try { 
        await this._handleSubmit(); 
        await this._fetchReportHistory(); 
        this._renderTableByDate(); 
      } finally { 
        this.isSubmitting = false; 
        this.btnSubmit.disabled = false; 
      }
    };

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      };
    });
  }

  // ✅ FUNGSI GENERATE KANDANG BERDASARKAN DERET (1-15, 16-30, dst)
  _generatePanenKandang() {
    const deret = parseInt(this.noKandangSelect.value);
    const start = (deret - 1) * 15 + 1;
    const end = deret * 15;
    const panenEntries = document.getElementById('panenEntries');
    panenEntries.innerHTML = '';

    // Cari riwayat hari ini untuk hitung kuota
    const todayStr = new Date().toLocaleDateString('id-ID');
    const todayData = this.allData.filter(d => new Date(d.tanggal_jam).toLocaleDateString('id-ID') === todayStr);

    for (let i = start; i <= end; i++) {
        // Hitung berapa yang sudah dipanen di kandang ini hari ini
        let sudahPanen = 0;
        todayData.forEach(rep => {
            const task = rep.pekerjaan_data.find(t => t.name.toLowerCase().includes('panen telur'));
            if (task && task.detailPanen) {
                const kandangInfo = task.detailPanen.find(p => parseInt(p.noKandang) === i);
                if (kandangInfo) sudahPanen += parseFloat(kandangInfo.jumlah);
            }
        });

        const sisaQuota = Math.max(0, this.MAX_TELUR_PER_HARI - sudahPanen);

        const div = document.createElement('div');
        div.className = 'panen-row';
        div.style = "display: flex; gap: 10px; margin-bottom: 10px; align-items: center; background: #f9f9f9; padding: 10px; border-radius: 10px;";
        div.innerHTML = `
            <input type="text" class="p-no-kandang" value="${i}" readonly style="width: 60px; padding:10px; border-radius:8px; border:1px solid #ddd; font-weight:900; text-align:center; background:#eee;">
            <input type="number" class="p-jumlah" step="0.1" data-quota="${sisaQuota}" placeholder="Butir (Maks: ${sisaQuota})" style="flex:1; padding:10px; border-radius:8px; border:1px solid #ddd; font-weight:700;">
            <span style="font-size:0.6rem; color:#888; width:40px;">SISA:${sisaQuota}</span>
        `;
        panenEntries.appendChild(div);
    }
  }

  _renderTaskTable(session) {
    const container = document.getElementById('taskContainer');
    const tasks = session === 'PAGI' ? [
      { text: 'Pemberian Pakan Pagi', type: 'number', unit: 'Kg' },
      { text: 'Cek Kebersihan Alat Minum', type: 'check' },
      { text: 'Pengisian Air Minum', type: 'check' },
      { text: 'Pemberian Kuteja', type: 'check' }, 
      { text: 'Panen Telur Sesi Pagi', type: 'panen' },
      { text: 'Cek Kesehatan Hewan', type: 'health' }
    ] : [
      { text: 'Pemberian Pakan SORE', type: 'number', unit: 'Kg' },
      { text: 'Panen Telur Sesi SORE', type: 'panen' },
      { text: 'Monitoring Kegiatan SORE', type: 'check' },
      { text: 'Pengasapan SORE', type: 'check' }
    ];

    container.innerHTML = tasks.map(t => `
      <tr style="border-bottom: 1px solid #f4f7f5;">
        <td style="padding: 15px; font-weight: 700; text-align: left;">${t.text}</td>
        <td style="padding: 10px; text-align: center;">
          <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
            ${t.type === 'number' ? `<input type="number" class="task-input" data-unit="${t.unit}" placeholder="${t.unit}" step="0.1" inputmode="decimal" style="width: 80px; padding: 10px; text-align: center; font-weight: 800; border-radius: 10px; border: 1px solid #ddd;">` : ''}
            ${t.type === 'panen' ? `<button type="button" class="btn-open-panen" style="padding:10px 15px; border-radius:10px; background:#6CA651; color:white; border:2px dashed rgba(255,255,255,0.4); cursor:pointer; font-size:0.75rem; font-weight:900; min-width:160px;">+ INPUT PANEN</button>` : ''}
            ${t.type === 'health' ? `<select class="health-status-select" style="padding: 10px; border-radius: 10px; font-weight: 700; border: 1px solid #ddd; width: 110px;"><option value="SEHAT">SEHAT</option><option value="SAKIT">SAKIT</option></select> <button type="button" class="add-health-btn" style="display:none; padding:6px 12px; border-radius:10px; background:#41644A; color:white; border:none; cursor:pointer; font-size:0.75rem; font-weight:900;">Tambah Data</button>` : ''}
          </div>
        </td>
        <td style="padding: 15px; text-align: center;"><input type="checkbox" class="task-check" style="width: 24px; height: 24px; accent-color: #41644A;"></td>
      </tr>
      ${t.type === 'health' ? `<tr class="health-detail-row" style="display: none; background: #fff5f5;"><td colspan="3" style="padding: 20px;"><div class="health-entries-container"></div></td></tr>` : ''}
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
        if (isSakit && entriesCont.innerHTML === "") addBtn.click();
      };
      addBtn.onclick = () => {
        const card = document.createElement('div');
        card.className = 'health-entry-card';
        card.style = "border: 1.5px solid #feb2b2; padding: 15px; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; position: relative; background: #fff;";
        card.innerHTML = `<button type="button" class="btn-remove-entry" style="position:absolute; top:-10px; right:-10px; background:#c53030; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;">✕</button><div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">KANDANG</label><input type="text" class="disease-kandang" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div><div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">NOMOR AYAM</label><input type="text" class="disease-ayam" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div><div class="form-group" style="grid-column:span 2;"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">INDIKASI</label><input type="text" class="disease-name" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div><div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">KARANTINA?</label><select class="is-quarantine" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"><option value="TIDAK">TIDAK</option><option value="YA">YA</option></select></div><div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">PEMULIHAN</label><input type="text" class="recovery-step" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>`;
        card.querySelector('.btn-remove-entry').onclick = () => card.remove();
        entriesCont.appendChild(card);
      };
    }
  }

  async _handleSubmit() {
    const user = AuthService.getUser();
    const session = this.sessionSelect.value;
    const kandang = this.noKandangSelect.value;
    const kelayakanType = this.form.querySelector('.status-kandang-select')?.value || 'STANDAR';
    let problemList = [];

    for (const row of this.form.querySelectorAll('.problem-entry-row')) {
        const kandangNo = row.querySelector('.problem-kandang-no')?.value;
        const note = row.querySelector('.kandang-note')?.value;
        const photoInput = row.querySelector('.kandang-photo');
        let photoData = '';
        if (photoInput && photoInput.files[0]) {
            photoData = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(photoInput.files[0]);
            });
        }
        if (kandangNo || note) problemList.push({ kandang: kandangNo || '-', note: note || '-', photo: photoData });
    }

    if (kelayakanType === 'TIDAK_STANDAR' && problemList.length === 0) {
        alert('Kandang TIDAK STANDAR wajib diisi minimal 1 masalah!');
        return;
    }

    const healthStatus = this.form.querySelector('.health-status-select')?.value || 'SEHAT';
    let healthDetail = [];
    this.form.querySelectorAll('.health-entry-card').forEach(card => {
        healthDetail.push({
            kandang: card.querySelector('.disease-kandang')?.value || '-',
            ayam: card.querySelector('.disease-ayam')?.value || '-',
            penyakit: card.querySelector('.disease-name')?.value || '-',
            karantina: card.querySelector('.is-quarantine')?.value || 'TIDAK',
            pemulihan: card.querySelector('.recovery-step')?.value || '-'
        });
    });

    const pekerjaan = this._getTaskList();
    const totalPanen = this.tempPanenData.reduce((s, p) => s + p.jumlah, 0);

    pekerjaan.forEach(task => {
        if (task.name.includes('Panen Telur')) {
            task.detailPanen = this.tempPanenData;
            task.val = totalPanen;
        }
    });

    const payload = {
        hewan: this.hewanSelect.value,
        deret: kandang,
        sesi: session,
        kesehatan: { status: healthStatus, detail: healthDetail },
        kelayakan: { status: kelayakanType === 'STANDAR' ? 'LAYAK' : 'TIDAK LAYAK', problems: problemList },
        pekerjaan,
        petugas: user.nama,
        total_panen: totalPanen
    };

    const response = await fetch(`${CONFIG.BASE_URL}/api/laporan/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === 'success') {
        alert('Laporan Berhasil Disimpan! ☁️');
        this.form.reset();
        this.stepSesi.style.display = 'none';
        this.tempPanenData = [];
    }
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
    const kelayakan = data.kelayakan_data || { status: 'LAYAK', problems: [] };
    const pekerjaan = data.pekerjaan_data || [];
    const panenTask = pekerjaan.find(t => t.name.includes('Panen Telur'));
    const totalButir = panenTask ? parseFloat(panenTask.val) : 0;
    const panenColor = totalButir > 0 ? { bg: '#eef2ed', text: '#2d4a36', label: `${totalButir}` } : { bg: '#fff5f5', text: '#c53030', label: 'TIDAK PANEN' };

    const newRow = `
      <tr style="border-bottom: 1px solid #eee; text-align: center;">
        <td style="padding: 15px;">${time} WIB</td>
        <td style="padding: 15px; font-weight:700;">${data.hewan}</td>
        <td style="padding: 15px;">Deret ${data.deret_kandang}</td>
        <td style="padding: 15px;">${data.sesi}</td>
        <td style="padding: 15px;"><button type="button" class="btn-panen-pop" data-detail='${JSON.stringify(panenTask?.detailPanen || []).replace(/'/g,"&apos;")}' style="padding: 5px 12px; border-radius: 8px; border: none; font-weight: 800; cursor: pointer; background: ${panenColor.bg}; color: ${panenColor.text};">${panenColor.label}</button></td>
        <td style="padding: 15px;"><button type="button" class="btn-health-pop" data-status="${kesehatan.status}" data-detail='${JSON.stringify(kesehatan.detail).replace(/'/g,"&apos;")}' style="padding: 5px 12px; border-radius: 8px; border: none; font-weight: 800; cursor: pointer; background: ${kesehatan.status==='SAKIT'?'#fff5f5':'#eef2ed'}; color: ${kesehatan.status==='SAKIT'?'#c53030':'#2d4a36'};">${kesehatan.status}</button></td>
        <td style="padding: 15px;"><button type="button" class="btn-layak-pop" data-problems='${JSON.stringify(kelayakan.problems || []).replace(/'/g, "&apos;")}' data-status="${kelayakan.status}" style="padding: 5px 12px; border-radius: 8px; border: none; font-weight: 800; cursor: pointer; background: ${kelayakan.status==='TIDAK LAYAK'?'#fff5f5':'#eef2ed'}; color: ${kelayakan.status==='TIDAK LAYAK'?'#c53030':'#2d4a36'};">${kelayakan.status}</button></td>
        <td style="padding: 15px; font-weight:700;">${data.petugas}</td>
        <td style="padding: 15px;"><button type="button" class="btn-task-pop" data-tasks='${JSON.stringify(pekerjaan).replace(/'/g,"&apos;")}' style="background: #6CA651; color: white; border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-weight: 700;">LIHAT KERJA</button></td>
      </tr>`;
    this.tableBody.insertAdjacentHTML('afterbegin', newRow);
    this._bindTableButtons(this.tableBody.firstElementChild);
  }

  _bindTableButtons(row) {
    row.querySelector('.btn-panen-pop').onclick = (e) => {
        const detail = JSON.parse(e.currentTarget.dataset.detail);
        document.getElementById('modalNote').innerHTML = `
          <h3 style="color:#6CA651; text-align:center; font-weight:900; margin-bottom:15px; text-transform: uppercase;">RINCIAN PANEN TELUR 🥚</h3>
          <table style="width:100%; border-collapse:collapse; background:white; border:1px solid #ddd;">
            <thead style="background:#6CA651; color:white;">
              <tr><th>KANDANG</th><th>JUMLAH</th></tr>
            </thead>
            <tbody>${detail.map(p => `<tr style="text-align:center;"><td>KANDANG ${p.noKandang}</td><td>${p.jumlah} Butir</td></tr>`).join('')}</tbody>
          </table>`;
        document.getElementById('statusModal').style.display = 'flex';
    };
    // Sisa fungsi popup (health, layak, task) tetap sama...
    row.querySelector('.btn-task-pop').onclick = (e) => {
      const tasks = JSON.parse(e.currentTarget.dataset.tasks);
      document.getElementById('taskListContent').innerHTML = `<table style="width:100%; border-collapse:collapse;">${tasks.map(t => `<tr><td>${t.status?'✅':'❌'} ${t.name}</td><td>${t.val} ${t.unit}</td></tr>`).join('')}</table>`;
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

  _setupKelayakanLogic() {
    const selectKelayakan = this.form.querySelector('.status-kandang-select');
    const alertRow = this.form.querySelector('.alert-row');
    if (selectKelayakan) {
      selectKelayakan.onchange = (e) => {
        alertRow.style.display = e.target.value === 'TIDAK_STANDAR' ? 'block' : 'none';
        if (e.target.value === 'TIDAK_STANDAR' && document.getElementById('problemListContainer').innerHTML === "") this._addProblemRow();
      };
    }
    document.getElementById('btnAddProblem').onclick = () => this._addProblemRow();
  }

  _addProblemRow() {
    const container = document.getElementById('problemListContainer');
    const div = document.createElement('div');
    div.className = 'problem-entry-row';
    div.style = "background: white; padding: 15px; border-radius: 12px; border: 1.5px solid #feb2b2; margin-bottom: 10px; position: relative;";
    div.innerHTML = `<button type="button" class="btn-remove-problem" style="position:absolute; top:-5px; right:-5px; background:#c53030; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;">✕</button><input type="text" class="problem-kandang-no" placeholder="No Kandang" style="width:100%; padding:8px; margin-bottom:10px;"><textarea class="kandang-note" placeholder="Masalah..."></textarea><input type="file" class="kandang-photo">`;
    div.querySelector('.btn-remove-problem').onclick = () => div.remove();
    container.appendChild(div);
  }
}

export default LaporanPresenter;