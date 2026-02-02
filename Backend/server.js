import Hapi from '@hapi/hapi';
import authRoutes from './routes/auth.js';
import pool from './db.js'; 
import 'dotenv/config';

const init = async () => {
    const server = Hapi.server({
        // RAILWAY DYNAMICS: Ambil port dari environment variable
        port: process.env.PORT || 5000,
        // WAJIB '0.0.0.0' biar bisa diakses via internet (Railway requirement)
        host: '0.0.0.0', 
        routes: { 
            cors: { origin: ['*'] }, 
            payload: { maxBytes: 2097152 } 
        },
    });

    // Landing Page (Cek Deployment)
    server.route({
        method: 'GET',
        path: '/',
        handler: () => ({ 
            status: 'success', 
            message: 'Dunax Farm API is Cloud Powered! ☁️',
            uptime: Math.floor(process.uptime()) + ' seconds'
        }),
    });

    // Pastiin authRoutes ter-import dengan benar
    try {
        server.route(authRoutes);
    } catch (err) {
        console.error('Peringatan: Cek file ./routes/auth.js lo, pastikan export default-nya bener.');
    }

    server.route([
        {
            // 1. GET Semua Kategori (LOGIKA MAYORITAS PRODUK)
            method: 'GET',
            path: '/commodities',
            handler: async (request, h) => {
                try {
                    const categories = await pool.query('SELECT * FROM categories ORDER BY id ASC');
                    const products = await pool.query('SELECT * FROM komoditas ORDER BY id ASC');
                    
                    const result = categories.rows.map(cat => {
                        const catProducts = products.rows.filter(p => p.category_id === cat.id);
                        const activeCount = catProducts.filter(p => p.aktif === true).length;
                        const inactiveCount = catProducts.filter(p => p.aktif === false).length;
                        const isMajorityActive = activeCount >= inactiveCount && activeCount > 0;

                        return {
                            id: cat.id, nama: cat.nama, keterangan: cat.keterangan || '',
                            foto: cat.foto || null, 
                            aktif: isMajorityActive,
                            details: catProducts.map(p => ({ ...p, harga: parseInt(p.harga), isEditing: false }))
                        };
                    });
                    return { status: 'success', data: result };
                } catch (err) { 
                    console.error('Error GET /commodities:', err);
                    return h.response({ status: 'error', message: 'Internal Server Error' }).code(500); 
                }
            }
        },
        {
            // 2. GET Detail Per Kategori (LOGIKA MAYORITAS PRODUK)
            method: 'GET',
            path: '/commodities/{id}',
            handler: async (request, h) => {
                const { id } = request.params;
                try {
                    const catRes = await pool.query('SELECT * FROM categories WHERE id = $1', [id.toLowerCase()]);
                    if (catRes.rows.length === 0) return h.response({ status: 'fail' }).code(404);
                    
                    const prodRes = await pool.query('SELECT * FROM komoditas WHERE category_id = $1 ORDER BY id ASC', [id.toLowerCase()]);
                    
                    const activeCount = prodRes.rows.filter(p => p.aktif === true).length;
                    const inactiveCount = prodRes.rows.filter(p => p.aktif === false).length;
                    const isMajorityActive = activeCount >= inactiveCount && activeCount > 0;

                    return {
                        status: 'success',
                        data: {
                            ...catRes.rows[0],
                            aktif: isMajorityActive, 
                            details: prodRes.rows.map(p => ({ ...p, harga: parseInt(p.harga), isEditing: false }))
                        }
                    };
                } catch (err) { 
                    console.error('Error GET /commodities/{id}:', err);
                    return h.response({ status: 'error' }).code(500); 
                }
            }
        },
        {
            // 3. GET Produk Spesifik
            method: 'GET',
            path: '/commodities/{id}/{productName}',
            handler: async (request, h) => {
                const { id, productName } = request.params;
                try {
                    const res = await pool.query('SELECT * FROM komoditas WHERE category_id = $1 AND nama ILIKE $2', [id, productName]);
                    return res.rows.length > 0 ? { status: 'success', data: res.rows[0] } : h.response({ status: 'fail' }).code(404);
                } catch (err) { return h.response({ status: 'error' }).code(500); }
            }
        },
        {
            // 4. POST Update Stok & Harga Produk
            method: 'POST',
            path: '/api/commodities/update-product',
            handler: async (request, h) => {
                const { id, harga, stok, aktif } = request.payload;
                try {
                    await pool.query('UPDATE komoditas SET harga = $1, stok = $2, aktif = $3 WHERE id = $4', [harga, stok, aktif, id]);
                    return { status: 'success', message: 'Data Berhasil Disimpan! 🚀' };
                } catch (err) { return h.response({ status: 'error' }).code(500); }
            }
        },
        {
            // 5. POST Tambah Produk Baru
            method: 'POST',
            path: '/api/commodities/add',
            handler: async (request, h) => {
                const { category_id, nama, harga, stok, aktif } = request.payload;
                try {
                    const result = await pool.query('INSERT INTO komoditas (category_id, nama, harga, stok, aktif) VALUES ($1, $2, $3, $4, $5) RETURNING *', [category_id, nama, harga, stok, aktif]);
                    return { status: 'success', message: 'Produk Baru Ditambahkan! 📦', data: result.rows[0] };
                } catch (err) { return h.response({ status: 'error' }).code(500); }
            }
        },
        {
            // 6. POST Update Info Kategori
            method: 'POST',
            path: '/api/categories/update',
            handler: async (request, h) => {
                const { id, nama, keterangan, foto } = request.payload;
                try {
                    const query = foto ? 
                        'UPDATE categories SET nama = $1, keterangan = $2, foto = $3 WHERE id = $4' :
                        'UPDATE categories SET nama = $1, keterangan = $2 WHERE id = $3';
                    const values = foto ? [nama.toUpperCase(), keterangan, foto, id] : [nama.toUpperCase(), keterangan, id];
                    await pool.query(query, values);
                    return { status: 'success', message: 'Kategori Diperbarui! ✨' };
                } catch (err) { return h.response({ status: 'error' }).code(500); }
            }
        },
        {
            // 7. POST Tambah Kategori Baru
            method: 'POST',
            path: '/api/categories/add',
            handler: async (request, h) => {
                const { id, nama, keterangan, foto } = request.payload;
                try {
                    await pool.query('INSERT INTO categories (id, nama, aktif, keterangan, foto) VALUES ($1, $2, $3, $4, $5)', [id.toLowerCase(), nama.toUpperCase(), false, keterangan, foto]);
                    return { status: 'success', message: 'Kategori Berhasil Dibuat! 📁' };
                } catch (err) { return h.response({ status: 'error' }).code(500); }
            }
        },
        {
            // 8. DELETE Hapus Produk Satuan
            method: 'DELETE',
            path: '/api/commodities/delete-product/{id}',
            handler: async (request, h) => {
                const { id } = request.params;
                try {
                    await pool.query('DELETE FROM komoditas WHERE id = $1', [id]);
                    return { status: 'success', message: 'Produk Dihapus! 🗑️' };
                } catch (err) { return h.response({ status: 'error' }).code(500); }
            }
        },
        {
            // 9. DELETE Hapus Kategori
            method: 'DELETE',
            path: '/api/categories/delete/{id}',
            handler: async (request, h) => {
                const { id } = request.params;
                try {
                    await pool.query('DELETE FROM komoditas WHERE category_id = $1', [id]);
                    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
                    return { status: 'success', message: `Kategori ${id.toUpperCase()} Dihapus!` };
                } catch (err) { return h.response({ status: 'error' }).code(500); }
            }
        },
        {
            // 10. GET Ringkasan Stok Global
            method: 'GET',
            path: '/api/stats/stock',
            handler: async (request, h) => {
                try {
                    const res = await pool.query('SELECT SUM(stok) as total_stok FROM komoditas');
                    return { status: 'success', total: res.rows[0].total_stok || 0 };
                } catch (err) { return h.response({ status: 'error' }).code(500); }
            }
        }
    ]);

    await server.start();
    console.log(`🚀 Dunax Farm Backend Aktif di: ${server.info.uri}`);
};

// Global Safety Net (Cegah Crash Konyol)
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Di Railway, biarkan sistem yang me-restart, jangan paksa exit jika hanya 1 error.
});

init();