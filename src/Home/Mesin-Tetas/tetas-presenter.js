import { CONFIG } from '../../config.js';

class TetasPresenter {
    constructor({ onDataReady, onUpdateUI }) {
        this.onDataReady = onDataReady;
        this.onUpdateUI = onUpdateUI;
        this.baseUrl = CONFIG.BASE_URL;
    }

    async init() {
        const hash = window.location.hash.slice(1);
        const categoryId = hash.split('-').slice(1).join('-').toLowerCase();

        try {
            const [cat, mesin] = await Promise.all([
                fetch(`${this.baseUrl}/commodities/${categoryId}`).then(r => r.json()),
                fetch(`${this.baseUrl}/api/mesin-tetas/status/${categoryId}`).then(r => r.json())
            ]);

            if (cat.status === 'success') this.onDataReady(cat.data);
            if (mesin.status === 'success') this.onUpdateUI(mesin.data);
        } catch (err) {
            console.error("Gagal mengambil data:", err);
        }
    }

    // Mengaktifkan timer 21 hari di database
    async startTimer(catId, status) {
        return fetch(`${this.baseUrl}/api/mesin-tetas/start-timer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kategori_id: catId, status })
        }).then(r => r.json());
    }

    // Melakukan cheat waktu (mempercepat ke 22 hari yang lalu)
    async cheatDB(catId, status) {
        return fetch(`${this.baseUrl}/api/mesin-tetas/cheat-db`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kategori_id: catId, status })
        }).then(r => r.json());
    }

    // Memindahkan status (Inkubasi -> Siap Panen -> Selesai)
    async moveMesin(payload) {
        return fetch(`${this.baseUrl}/api/mesin-tetas/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => r.json());
    }
}

export default TetasPresenter;