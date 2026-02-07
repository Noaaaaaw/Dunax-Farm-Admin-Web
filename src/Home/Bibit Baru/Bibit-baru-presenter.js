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
        // Ambil ID dari URL, misal: #/new-asset-ayam
        const hash = window.location.hash.slice(1);
        const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : '';
        
        if (!categoryId) {
            return { status: 'error', message: 'Kategori tidak valid' };
        }

        try {
            // Data yang dikirim berisi { produk: 'AYAM PEJANTAN', jumlah: 5 }
            const res = await fetch(`${this.baseUrl}/api/asset-baru/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...data, 
                    kategori_id: categoryId 
                })
            });

            const result = await res.json();
            
            // Logika deteksi error 500 biar dashboard lu gak nge-hang
            if (res.status === 500) {
                console.error("Backend Error (500):", result.message);
                return { status: 'error', message: result.message };
            }

            return result;
        } catch (err) { 
            console.error("Gagal koneksi ke server farm:", err);
            return { status: 'error', message: 'Koneksi server gagal' }; 
        }
    }
}

export default BibitBaruPresenter;