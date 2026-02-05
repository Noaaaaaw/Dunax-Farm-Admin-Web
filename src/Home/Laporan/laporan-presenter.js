import AuthService from '../../auth/auth-services.js';
import { CONFIG } from '../../config.js';

class LaporanPresenter {
  constructor() {
    this.isSubmitting = false;
    // Track progres mandiri per sesi agar tidak tabrakan
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
    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Logic ganti sesi: Reset kandang
    this.sessionSelect.onchange = (e) => {
      const session = e.target.value;
      if (session) {
        this._renderTaskTable(session);
        this.noKandangSelect.value = "";
        this.stepSesi.style.display = 'none';
      }
    };

    // Validasi urutan kandang mandiri per sesi
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

    // Logic kelayakan kandang
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
      finally { this.isSubmitting = false; this.btnSubmit.disabled = false; this.btnSubmit.innerText = "SIMPAN LAPORAN KANDANG"; }
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
    const kandang = this.noKandangSelect.value;
    const session = this.sessionSelect.value;
    const hewan = this.hewanSelect.value;

    // 1. Ambil Data Sakit
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

    // 2. Ambil Data Kelayakan & Foto
    const kelayakanSelect = this.form.querySelector('.status-kandang-select');
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

    // 3. Ambil List Pekerjaan
    let taskList = [];
    this.form.querySelectorAll('#taskContainer tr:not(.health-detail-row)').forEach(row => {
      taskList.push({
        name: row.cells[0].innerText,
        status: row.querySelector('.task-check').checked,
        val: row.querySelector('.task-input')?.value || '',
        unit: row.querySelector('.task-input')?.dataset.unit || ''
      });
    });

    // 4. KIRIM KE BACKEND (RAILWAY)
    const payload = {
        hewan, deret: kandang, sesi: session,
        kesehatan: sickData, 
        kelayakan: { status: kelayakanSelect.value, note, photo: photoData },
        pekerjaan: taskList,
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
            alert("Laporan Berhasil Masuk Database! ☁️");
            this.progress[session] = parseInt(kandang);
            this._addNewRowToTable(result.data, payload); // Nampilin ke tabel bawah
            this.form.reset();
            this.stepSesi.style.display = 'none';
        }
    } catch (err) { alert("Gagal Simpan! Periksa koneksi backend."); }
  }

  _addNewRowToTable(dbData, originalPayload) {
    const time = new Date(dbData.tanggal_jam).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    const isSakit = originalPayload.kesehatan.length > 0;
    const isLayak = originalPayload.kelayakan.status === 'STANDAR';

    const newRow = `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 15px;">${time}</td>
        <td style="padding: 15px; font-weight:700;">${originalPayload.hewan}</td>
        <td style="padding: 15px;">Deret ${originalPayload.deret}</td>
        <td style="padding: 15px;">${originalPayload.sesi}</td>
        <td style="padding: 15px;">
          <button type="button" class="btn-health-pop" data-sakit='${JSON.stringify(originalPayload.kesehatan)}' 
            style="padding: 5px 10px; border-radius: 6px; border: none; font-weight: 800; cursor: pointer; 
            background: ${isSakit ? '#fff5f5' : '#eef2ed'}; color: ${isSakit ? '#c53030' : '#2d4a36'};">
            ${isSakit ? '⚠ SAKIT' : '✅ SEHAT'}
          </button>
        </td>
        <td style="padding: 15px;">
           <button type="button" class="btn-layak-pop" data-note="${originalPayload.kelayakan.note}" data-photo="${originalPayload.kelayakan.photo}" data-status="${originalPayload.kelayakan.status}"
            style="padding: 5px 10px; border-radius: 6px; border: none; font-weight: 800; cursor: pointer; 
            background: ${isLayak ? '#eef2ed' : '#fff5f5'}; color: ${isLayak ? '#2d4a36' : '#c53030'};">
            ${isLayak ? 'STANDAR' : 'GANGGUAN'}
          </button>
        </td>
        <td style="padding: 15px; font-weight:700;">${originalPayload.petugas}</td>
        <td style="padding: 15px; text-align: center;">
          <button type="button" class="btn-task-pop" data-tasks='${JSON.stringify(originalPayload.pekerjaan)}' 
            style="background: #6CA651; color: white; border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-weight: 700;">
            LIHAT KERJA
          </button>
        </td>
      </tr>`;

    if (this.tableBody.innerHTML.includes('Belum ada')) this.tableBody.innerHTML = '';
    this.tableBody.insertAdjacentHTML('afterbegin', newRow);
    this._bindTableButtons(this.tableBody.firstElementChild);
  }

  // (Method _renderTaskTable, _bindTableButtons, _loadCategories dkk tetap sama)
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
        card.style.marginTop = "15px";
        card.innerHTML = `
          <button type="button" class="btn-remove-entry">✕</button>
          <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">NOMOR KANDANG</label><input type="text" class="disease-kandang" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
          <div class="form-group"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">NOMOR AYAM</label><input type="text" class="disease-ayam" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
          <div class="form-group grid-full"><label style="font-size:0.65rem; font-weight:900; color:#c53030;">INDIKASI PENYAKIT</label><input type="text" class="disease-name" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></div>
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
      document.getElementById('modalNote').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div style="background: #fff5f5; padding: 15px; border-radius: 15px; border-left: 5px solid #c53030;">
            <h3 style="color: #c53030; margin: 0 0 5px; font-size: 1rem;">⚠️ LAPORAN GANGGUAN</h3>
            <p style="margin: 0; color: #1f3326; font-weight: 700;">${d.note}</p>
          </div>
          ${d.photo ? `<img src="${d.photo}" style="width: 100%; border-radius: 15px; border: 1px solid #ddd;">` : ''}
        </div>`;
      document.getElementById('statusModal').style.display = 'flex';
    };

    row.querySelector('.btn-health-pop').onclick = (e) => {
      const data = JSON.parse(e.currentTarget.dataset.sakit);
      if (data.length === 0) return alert("Sehat semua! ✅");
      document.getElementById('modalNote').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <h3 style="color: #c53030; margin: 0 0 5px; font-size: 1.1rem; text-align: center; font-weight: 900;">DAFTAR HEWAN SAKIT</h3>
          ${data.map(d => `
            <div style="background: white; padding: 15px; border-radius: 15px; border: 1px solid #feb2b2; position: relative; overflow: hidden;">
              <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: #c53030;"></div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #eee; padding-bottom: 5px;">
                  <span style="font-weight: 800; color: #c53030;">Kandang: ${d.kandang}</span>
                  <span style="font-weight: 800; color: #1f3326;">Ayam #: ${d.ayam}</span>
                </div>
                <div style="font-size: 0.9rem;">
                  <p style="margin: 5px 0;"><b>Penyakit:</b> <span style="color: #c53030;">${d.penyakit}</span></p>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #fff5f5; padding: 8px; border-radius: 8px; margin-top: 5px;">
                    <p style="margin: 0; font-size: 0.8rem;"><b>Karantina:</b><br>${d.karantina}</p>
                    <p style="margin: 0; font-size: 0.8rem;"><b>Pemulihan:</b><br>${d.pemulihan}</p>
                  </div>
                </div>
              </div>
            </div>`).join('')}
        </div>`;
      document.getElementById('statusModal').style.display = 'flex';
    };

    row.querySelector('.btn-task-pop').onclick = (e) => {
      const tasks = JSON.parse(e.currentTarget.dataset.tasks);
      document.getElementById('taskListContent').innerHTML = tasks.map(t => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f1f1;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.2rem;">${t.status ? '✅' : '❌'}</span>
            <span style="font-weight: 700; color: ${t.status ? '#1f3326' : '#999'}; text-decoration: ${t.status ? 'none' : 'line-through'};">${t.name}</span>
          </div>
          ${t.val ? `<span style="background: #eef2ed; padding: 4px 10px; border-radius: 8px; font-weight: 900; color: #2d4a36; font-size: 0.8rem;">${t.val} ${t.unit}</span>` : ''}
        </div>`).join('');
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