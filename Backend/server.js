import Hapi from '@hapi/hapi';
import authRoutes from './routes/auth.js';
import pool from './db.js'; 
import 'dotenv/config';

const init = async () => {
    const server = Hapi.server({
        // RAILWAY DYNAMICS: Ambil port dari environment variable
        port: process.env.PORT || 5000,
        // WAJIB '0.0.0.0' biar bisa diakses via internet
        host: '0.0.0.0', 
        routes: { 
            cors: { 
                origin: ['*'], // Izinkan akses dari mana saja
                headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
                additionalHeaders: ['cache-control', 'x-requested-with'],
                credentials: true
            }, 
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

    // Route Auth (Login/Register)
    try {
        server.route(authRoutes);
    } catch (err) {
        console.error('Peringatan: Cek file ./routes/auth.js lo.');
    }

    // Main Routes (1-15)
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
            // 2. GET Detail Per Kategori
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
                } catch (err) { return h.response({ status: 'error' }).code(500); }
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
        },
        {
            // 11. GET Search Produk
            method: 'GET',
            path: '/api/commodities/search',
            handler: async (request, h) => {
                const { q } = request.query;
                try {
                    const res = await pool.query(
                        'SELECT k.*, c.nama as kategori_nama FROM komoditas k JOIN categories c ON k.category_id = c.id WHERE k.nama ILIKE $1', 
                        [`%${q}%`]
                    );
                    return { status: 'success', data: res.rows };
                } catch (err) { return h.response({ status: 'error' }).code(500); }
            }
        },
        {
            // 12. GET Dashboard Stats
            method: 'GET',
            path: '/api/stats/categories',
            handler: async (request, h) => {
                try {
                    const res = await pool.query(`
                        SELECT c.nama, COUNT(k.id) as total_item, SUM(k.stok) as total_stok 
                        FROM categories c 
                        LEFT JOIN komoditas k ON c.id = k.category_id 
                        GROUP BY c.nama
                    `);
                    return { status: 'success', data: res.rows };
                } catch (err) { return h.response({ status: 'error' }).code(500); }
            }
        },
        {
            // 13. POST Simpan Laporan Operasional (Kerjaan Ryan)
            method: 'POST',
            path: '/api/laporan/save',
            handler: async (request, h) => {
                const { hewan, deret, sesi, kesehatan, kelayakan, pekerjaan, petugas } = request.payload;
                try {
                    const query = `
                        INSERT INTO laporan_operasional 
                        (hewan, deret_kandang, sesi, kesehatan_data, kelayakan_data, pekerjaan_data, petugas) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
                    
                    const values = [hewan, parseInt(deret), sesi, JSON.stringify(kesehatan), JSON.stringify(kelayakan), JSON.stringify(pekerjaan), petugas];
                    const result = await pool.query(query, values);
                    return { status: 'success', message: 'Laporan Masuk Cloud! ☁️', data: result.rows[0] };
                } catch (err) {
                    return h.response({ status: 'error', message: 'Gagal simpan database' }).code(500);
                }
            }    
        },
        {
            // 14. GET Histori Laporan (Biar data gak hilang pas refresh)
            method: 'GET',
            path: '/api/laporan',
            handler: async (request, h) => {
                try {
                    const result = await pool.query('SELECT * FROM laporan_operasional ORDER BY tanggal_jam DESC');
                    return { status: 'success', data: result.rows };
                } catch (err) {
                    return h.response({ status: 'error' }).code(500);
                }
            }
        },
        {
            // 15. POST Proses Pembibitan (LOGIKA TABEL BARU & ANTI-MINUS)
            method: 'POST',
            path: '/api/pembibitan/process',
            handler: async (request, h) => {
                const { kategori_id, berhasil, gagal, sisa_ke_konsumsi } = request.payload;
                
                // Total yang dikelola dari antrian (Misal: 100)
                const totalDikelola = (parseInt(berhasil) || 0) + (parseInt(gagal) || 0) + (parseInt(sisa_ke_konsumsi) || 0); 
                const client = await pool.connect();

                try {
                    await client.query('BEGIN');

                    // A. POTONG STOK FERTIL UTAMA (BAHAN BAKU)
                    await client.query(`
                        UPDATE komoditas SET stok = stok - $1 
                        WHERE category_id = $2 AND nama ILIKE '%Fertil%'
                    `, [totalDikelola, kategori_id]);

                    // B. MASUK KE STOK DOC (DITETAS)
                    await client.query(`
                        UPDATE komoditas SET stok = stok + $1 
                        WHERE category_id = $2 AND (nama ILIKE '%DOC%' OR nama ILIKE '%DOD%')
                    `, [berhasil, kategori_id]);

                    // C. BALIK KE STOK FERTIL JUAL (REFUND SORTIR JUAL)
                    await client.query(`
                        UPDATE komoditas SET stok = stok + $1 
                        WHERE category_id = $2 AND nama ILIKE '%Fertil%'
                    `, [gagal, kategori_id]);

                    // D. MASUK KE STOK TELUR KONSUMSI
                    await client.query(`
                        UPDATE komoditas SET stok = stok + $1 
                        WHERE category_id = $2 AND nama ILIKE '%Telur%' AND nama NOT ILIKE '%Fertil%'
                    `, [sisa_ke_konsumsi, kategori_id]);

                    // E. SIMPAN KE TABEL KHUSUS (Bukan laporan_operasional lagi)
                    await client.query(`
                        INSERT INTO hatchery_process 
                        (kategori_id, total_panen, hasil_doc, hasil_fertil_jual, hasil_konsumsi)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [kategori_id, totalDikelola, berhasil, gagal, sisa_ke_konsumsi]);

                    await client.query('COMMIT');
                    return { status: 'success' };
                } catch (err) {
                    await client.query('ROLLBACK');
                    console.error('Proses Gagal:', err.message);
                    return h.response({ status: 'error', message: err.message }).code(500);
                } finally {
                    client.release();
                }
            }
        },
        {
            // 16. GET Histori Proses Khusus Pembibitan (Audit Trail)
            method: 'GET',
            path: '/api/pembibitan/history',
            handler: async (request, h) => {
                try {
                    const res = await pool.query('SELECT * FROM hatchery_process ORDER BY tanggal_proses DESC');
                    return { status: 'success', data: res.rows };
                } catch (err) {
                    return h.response({ status: 'error' }).code(500);
                }
            }
        }
    ]);

    await server.start();
    console.log(`🚀 Dunax Farm Backend Aktif di: ${server.info.uri}`);
};

// Global Safety Net
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

init();