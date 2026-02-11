import { CONFIG } from '../../config.js';

class BibitBaruPresenter {
    constructor() { this.baseUrl = CONFIG.BASE_URL; }

    async fetchAlatHistory() {
        try {
            const res = await fetch(`${this.baseUrl}/api/asset-alat/history`);
            const result = await res.json();
            return result.status === 'success' ? result.data : [];
        } catch (err) { return []; }
    }

    async submitToUnifiedTable(data) {
        try {
            const res = await fetch(`${this.baseUrl}/api/asset-alat/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) { return { status: 'error', message: err.message }; }
    }
    async updateUnifiedTable(data) {
    try {
        const res = await fetch(`${this.baseUrl}/api/asset-alat/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (err) { return { status: 'error' }; }
}

async deleteAsset(id) {
    try {
        const res = await fetch(`${this.baseUrl}/api/asset-alat/delete/${id}`, { method: 'DELETE' });
        return await res.json();
    } catch (err) { return { status: 'error' }; }
}
}
export default BibitBaruPresenter;