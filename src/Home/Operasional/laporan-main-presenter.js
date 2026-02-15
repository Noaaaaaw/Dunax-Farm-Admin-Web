import { CONFIG } from '../../config.js';

class LaporanMainPresenter {
  constructor() {
    this.container = document.getElementById('containerMenuLaporan');
  }

  async init() {
    await this._renderMenu();
  }

  async _renderMenu() {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/commodities`); 
      const result = await res.json();
      
      if (result.status === 'success') {
        const activeAnimals = result.data.filter(item => item.aktif === true);

        if (activeAnimals.length === 0) {
          this.container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:50px; color:#888;">Tidak ada kategori aktif.</div>`;
          return;
        }

        this.container.innerHTML = activeAnimals.map(animal => `
          <div class="card-laporan-hewan" data-id="${animal.id}" style="background: white; padding: 35px; border-radius: 28px; border: 2px solid #eef2ed; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="background: #f8f9f8; width: 85px; height: 85px; border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid #eee;">
                <img src="${animal.foto}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://placehold.co/80x80?text=${animal.id.toUpperCase()}'">
            </div>
            <div style="flex-grow: 1;">
              <h3 style="margin: 0; color: #1f3326; font-weight: 900; font-size: 1.3rem; text-transform: uppercase;">LAPORAN ${animal.nama}</h3>
              <p style="margin: 8px 0 0; color: #666; font-size: 0.95rem;">Manajemen harian spesifik ${animal.id}.</p>
            </div>
          </div>
        `).join('');

        this._setupEvents();
      }
    } catch (err) {
      this.container.innerHTML = `<div style="grid-column: 1/-1; color:red; text-align:center; padding:50px; font-weight:900;">GAGAL SYNC DATA API!</div>`;
    }
  }

  _setupEvents() {
    document.querySelectorAll('.card-laporan-hewan').forEach(card => {
      card.onclick = () => {
        const id = card.dataset.id.toLowerCase();
        
        // LOGIKA NAVIGASI TERPISAH
        if (id === 'ayam') {
            // Khusus Ayam masuk ke file lama lu
            window.location.hash = '#/laporan-harian-kandang';
        } else {
            // Yang lain masuk ke file tersendiri (Misal: laporan-kambing, laporan-sapi, dll)
            window.location.hash = `#/laporan-harian-${id}`;
        }
      };
      
      card.onmouseenter = () => { 
        card.style.transform = 'translateY(-8px)'; 
        card.style.borderColor = '#6CA651'; 
      };
      card.onmouseleave = () => { 
        card.style.transform = 'translateY(0)'; 
        card.style.borderColor = '#eef2ed'; 
      };
    });
  }
}
export default LaporanMainPresenter;