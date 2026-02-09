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
            console.error("Gagal ambil riwayat:", err);
            return []; 
        }
    }

    async submitAsset(data) {
        // Ambil ID dari URL, misal: #/new-asset-ayam -> ayam
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
            console.error("Gagal koneksi server:", err);
            return { status: 'error', message: 'Koneksi server gagal' }; 
        }
    }
}

export default BibitBaruPresenter;