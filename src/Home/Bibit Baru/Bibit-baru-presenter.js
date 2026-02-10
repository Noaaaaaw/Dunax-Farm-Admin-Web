import { CONFIG } from '../../config.js';

class BibitBaruPresenter {
    constructor() { 
        this.baseUrl = CONFIG.BASE_URL; 
    }

    async fetchHistory() {
        try {
            const res = await fetch(`${this.baseUrl}/api/asset-baru/history`);
            const result = await res.json();
            return result.status === 'success' ? result.data : [];
        } catch (err) { 
            console.error("Gagal ambil riwayat bibit:", err);
            return []; 
        }
    }

    async submitAsset(data) {
        const hash = window.location.hash.slice(1);
        const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : '';
        
        if (!categoryId) return { status: 'error', message: 'Kategori tidak valid' };

        try {
            const res = await fetch(`${this.baseUrl}/api/asset-baru/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...data, 
                    kategori_id: categoryId.toLowerCase() 
                })
            });

            return await res.json();
        } catch (err) { 
            console.error("Gagal simpan bibit:", err);
            return { status: 'error', message: 'Koneksi server gagal' }; 
        }
    }

    // --- LOGIKA BARU UNTUK ASSET ALAT (INVENTARIS) ---

    async fetchAlatHistory() {
        try {
            const res = await fetch(`${this.baseUrl}/api/asset-alat/history`);
            const result = await res.json();
            return result.status === 'success' ? result.data : [];
        } catch (err) { 
            console.error("Gagal ambil riwayat alat:", err);
            return []; 
        }
    }

    async submitAlat(data) {
        try {
            const res = await fetch(`${this.baseUrl}/api/asset-alat/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data) // Mengirim nama_alat, jumlah, harga, pembeli
            });

            return await res.json();
        } catch (err) { 
            console.error("Gagal simpan alat:", err);
            return { status: 'error', message: 'Koneksi server gagal' }; 
        }
    }
}

export default BibitBaruPresenter;