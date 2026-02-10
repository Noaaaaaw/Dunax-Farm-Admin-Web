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

    async submitAsset(data) {
        const hash = window.location.hash.slice(1);
        const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : '';
        
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
            return { status: 'error', message: 'Koneksi gagal' }; 
        }
    }

    async submitAlat(data) {
        try {
            const res = await fetch(`${this.baseUrl}/api/asset-alat/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) { 
            return { status: 'error', message: 'Koneksi gagal' }; 
        }
    }
}

export default BibitBaruPresenter;