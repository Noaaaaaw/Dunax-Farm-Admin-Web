import Hapi from '@hapi/hapi';
import authRoutes from './routes/auth.js';
import pool from './db.js'; 
import 'dotenv/config';

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: '0.0.0.0', 
        routes: { 
            cors: { 
                origin: ['*'], 
                headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
                additionalHeaders: ['cache-control', 'x-requested-with'],
                credentials: true
            }, 
            payload: { maxBytes: 2097152 } 
        },
    });

    // Landing Page
    server.route({
        method: 'GET',
        path: '/',
        handler: () => ({ 
            status: 'success', 
            message: 'Dunax Farm API is Cloud Powered! ☁️',
            uptime: Math.floor(process.uptime()) + ' seconds'
        }),
    });

    // Route Auth
    try { server.route(authRoutes); } catch (err) { console.error('Peringatan: Cek file ./routes/auth.js lo.'); }

    // Main Routes (1-16)
    server.route([
       {
            // 1. GET Semua Kategori (Status Online/Offline Sinkron)
            method: 'GET',
            path: '/commodities',
            handler: async (request, h) => {
                try {
                    const categories = await pool.query('SELECT * FROM categories ORDER BY id ASC');
                    const products = await pool.query('SELECT * FROM komoditas');
                    const result = categories.rows.map(cat => {
                        const catProducts = products.rows.filter(p => p.category_id === cat.id);
                        const isOnline = catProducts.some(p => p.aktif === true);
                        return {
                            id: cat.id, nama: cat.nama, keterangan: cat.keterangan || '', foto: cat.foto || null,
                            aktif: isOnline, // Menjamin indikator Hijau di Kelola Bibit
                            details: catProducts.map(p => ({ ...p, harga: parseInt(p.harga), isEditing: false }))
                        };
                    });
                    return { status: 'success', data: result };
                } catch (err) { return h.response({ status: 'error' }).code(500); }
            }
        },
        {
            // 2. GET Detail Per Kategori
            method: 'GET',
            path: '/commodities/{id}',
            handler: async (request, h) => {
                const { id } = request.params;
                const catRes = await pool.query('SELECT * FROM categories WHERE id = $1', [id.toLowerCase()]);
                const prodRes = await pool.query('SELECT * FROM komoditas WHERE category_id = $1 ORDER BY id ASC', [id.toLowerCase()]);
                const isOnline = prodRes.rows.some(p => p.aktif === true);

                return { 
                    status: 'success', 
                    data: { ...catRes.rows[0], aktif: isOnline, details: prodRes.rows } 
                };
            }
        },
        {
            // 3. GET Produk Spesifik
            method: 'GET',
            path: '/commodities/{id}/{productName}',
            handler: async (request, h) => {
                const { id, productName } = request.params;
                const res = await pool.query('SELECT * FROM komoditas WHERE category_id = $1 AND nama ILIKE $2', [id, productName]);
                return { status: 'success', data: res.rows[0] };
            }
        },
        {
            // 4. POST Update Stok & Harga Produk Satuan
            method: 'POST',
            path: '/api/commodities/update-product',
            handler: async (request, h) => {
                const { id, harga, stok, aktif } = request.payload;
                await pool.query('UPDATE komoditas SET harga = $1, stok = $2, aktif = $3 WHERE id = $4', [harga, stok, aktif, id]);
                return { status: 'success', message: 'Data Berhasil Disimpan! 🚀' };
            }
        },
        {
            // 5. POST Tambah Produk Baru
            method: 'POST',
            path: '/api/commodities/add',
            handler: async (request, h) => {
                const { category_id, nama, harga, stok, aktif } = request.payload;
                const result = await pool.query('INSERT INTO komoditas (category_id, nama, harga, stok, aktif) VALUES ($1, $2, $3, $4, $5) RETURNING *', [category_id, nama, harga, stok, aktif]);
                return { status: 'success', data: result.rows[0] };
            }
        },
        {
            // 6. POST Update Info Kategori
            method: 'POST',
            path: '/api/categories/update',
            handler: async (request, h) => {
                const { id, nama, keterangan, foto } = request.payload;
                await pool.query('UPDATE categories SET nama = $1, keterangan = $2, foto = COALESCE($3, foto) WHERE id = $4', [nama.toUpperCase(), keterangan, foto, id]);
                return { status: 'success', message: 'Kategori Diperbarui!' };
            }
        },
        {
            // 7. POST Tambah Kategori Baru
            method: 'POST',
            path: '/api/categories/add',
            handler: async (request, h) => {
                const { id, nama, keterangan, foto } = request.payload;
                await pool.query('INSERT INTO categories (id, nama, aktif, keterangan, foto) VALUES ($1, $2, false, $3, $4)', [id.toLowerCase(), nama.toUpperCase(), keterangan, foto]);
                return { status: 'success', message: 'Kategori Berhasil Dibuat!' };
            }
        },
        {
            // 8. DELETE Hapus Produk
            method: 'DELETE',
            path: '/api/commodities/delete-product/{id}',
            handler: async (request, h) => {
                await pool.query('DELETE FROM komoditas WHERE id = $1', [request.params.id]);
                return { status: 'success', message: 'Produk Dihapus!' };
            }
        },
        {
            // 9. DELETE Hapus Kategori
            method: 'DELETE',
            path: '/api/categories/delete/{id}',
            handler: async (request, h) => {
                const { id } = request.params;
                await pool.query('DELETE FROM komoditas WHERE category_id = $1', [id]);
                await pool.query('DELETE FROM categories WHERE id = $1', [id]);
                return { status: 'success', message: 'Kategori Dihapus!' };
            }
        },
        {
            // 10. GET Total Stok Global
            method: 'GET',
            path: '/api/stats/stock',
            handler: async () => {
                const res = await pool.query('SELECT SUM(stok) as total FROM komoditas');
                return { status: 'success', total: res.rows[0].total || 0 };
            }
        },
        {
            // 11. GET Search Produk
            method: 'GET',
            path: '/api/commodities/search',
            handler: async (request) => {
                const res = await pool.query('SELECT * FROM komoditas WHERE nama ILIKE $1', [`%${request.query.q}%`]);
                return { status: 'success', data: res.rows };
            }
        },
        {
            // 12. GET Dashboard Stats (Berdasarkan Stok Butir)
            method: 'GET',
            path: '/api/stats/categories',
            handler: async () => {
                const res = await pool.query('SELECT c.nama, SUM(k.stok) as total_stok FROM categories c LEFT JOIN komoditas k ON c.id = k.category_id GROUP BY c.nama');
                return { status: 'success', data: res.rows };
            }
        },
        {
            // 13. POST Simpan Laporan Operasional (Ryan)
            method: 'POST',
            path: '/api/laporan/save',
            handler: async (request, h) => {
                const { hewan, deret, sesi, kesehatan, kelayakan, pekerjaan, petugas } = request.payload;
                const query = `INSERT INTO laporan_operasional (hewan, deret_kandang, sesi, kesehatan_data, kelayakan_data, pekerjaan_data, petugas) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
                const values = [hewan, parseInt(deret), sesi, JSON.stringify(kesehatan), JSON.stringify(kelayakan), JSON.stringify(pekerjaan), petugas];
                const result = await pool.query(query, values);
                return { status: 'success', data: result.rows[0] };
            }    
        },
        {
            // 14. GET Histori Laporan (Antrian Lapangan)
            method: 'GET',
            path: '/api/laporan',
            handler: async () => {
                const result = await pool.query('SELECT * FROM laporan_operasional ORDER BY tanggal_jam DESC');
                return { status: 'success', data: result.rows };
            }
        },
        {
            // 15. POST Proses Pembibitan (VALIDASI STOK & ANTI-MINUS)
            method: 'POST',
            path: '/api/pembibitan/process',
            handler: async (request, h) => {
                const { kategori_id, berhasil, gagal, sisa_ke_konsumsi } = request.payload;
                
                // Barang yang bener-bener dibuang/keluar dari gudang Fertil cuma DOC dan KONSUMSI
                const stokFertilDibutuhkan = (parseInt(berhasil) || 0) + (parseInt(sisa_ke_konsumsi) || 0);
                const totalAntrian = stokFertilDibutuhkan + (parseInt(gagal) || 0);

                const client = await pool.connect();
                try {
                    await client.query('BEGIN');

                    // A. CEK STOK DULU: Lu punya barangnya nggak buat dipotong?
                    const check = await client.query(
                        `SELECT stok, nama FROM komoditas WHERE category_id = $1 AND nama ILIKE '%Fertil%'`,
                        [kategori_id]
                    );

                    const stokSekarang = check.rows[0]?.stok || 0;

                    // B. KALAU STOK KURANG, JANGAN MAU DIPOTONG!
                    if (stokSekarang < stokFertilDibutuhkan) {
                        await client.query('ROLLBACK');
                        return h.response({ 
                            status: 'error', 
                            message: `Gagal! Stok ${check.rows[0]?.nama} cuma ${stokSekarang}, nggak cukup buat potong ${stokFertilDibutuhkan}. Input Panen dulu!` 
                        }).code(400);
                    }

                    // C. POTONG STOK FERTIL (NETTO)
                    await client.query(`UPDATE komoditas SET stok = stok - $1 WHERE category_id = $2 AND nama ILIKE '%Fertil%'`, [stokFertilDibutuhkan, kategori_id]);
                    // D. TAMBAH STOK HASIL (DOC & KONSUMSI)
                    await client.query(`UPDATE komoditas SET stok = stok + $1 WHERE category_id = $2 AND (nama ILIKE '%DOC%' OR nama ILIKE '%DOD%')`, [berhasil, kategori_id]);
                    await client.query(`UPDATE komoditas SET stok = stok + $1 WHERE category_id = $2 AND nama ILIKE '%Telur%' AND nama NOT ILIKE '%Fertil%'`, [sisa_ke_konsumsi, kategori_id]);
                    // E. SIMPAN HISTORI
                    await client.query(`INSERT INTO hatchery_process (kategori_id, total_panen, hasil_doc, hasil_fertil_jual, hasil_konsumsi) VALUES ($1, $2, $3, $4, $5)`, [kategori_id, totalAntrian, berhasil, gagal, sisa_ke_konsumsi]);

                    await client.query('COMMIT');
                    return { status: 'success' };
                } catch (err) { await client.query('ROLLBACK'); return h.response({ status: 'error', message: err.message }).code(500); }
                finally { client.release(); }
            }
        },
        {
            method: 'GET',
            path: '/api/pembibitan/history',
            handler: async () => {
                const res = await pool.query('SELECT * FROM hatchery_process ORDER BY tanggal_proses DESC');
                return { status: 'success', data: res.rows };
            }
        },
        {
            method: 'GET',
            path: '/api/laporan',
            handler: async () => {
                const result = await pool.query('SELECT * FROM laporan_operasional ORDER BY tanggal_jam DESC');
                return { status: 'success', data: result.rows };
            }
        },
        {
            // Update Stok & Harga
            method: 'POST',
            path: '/api/commodities/update-product',
            handler: async (request) => {
                const { id, harga, stok, aktif } = request.payload;
                await pool.query('UPDATE komoditas SET harga = $1, stok = $2, aktif = $3 WHERE id = $4', [harga, stok, aktif, id]);
                return { status: 'success' };
            }
        },
        {
            // 16. GET Histori Pembibitan (Audit Trail)
            method: 'GET',
            path: '/api/pembibitan/history',
            handler: async () => {
                const res = await pool.query('SELECT * FROM hatchery_process ORDER BY tanggal_proses DESC');
                return { status: 'success', data: res.rows };
            }
        }
    ]);

    await server.start();
    console.log(`🚀 Dunax Farm Backend Aktif!`);
};

process.on('unhandledRejection', (err) => { console.error(err); });
init();