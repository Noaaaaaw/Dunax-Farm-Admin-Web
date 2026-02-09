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
        handler: () => ({ status: 'success', message: 'Dunax Farm API - Jalur Stok Murni! 🚀' }),
    });

    // Route Auth
    try { server.route(authRoutes); } catch (err) { console.error('Peringatan: Cek file auth.js'); }

    // Main Routes (1-16)
    server.route([
        {
            // 1. GET Semua Kategori
            method: 'GET',
            path: '/commodities',
            handler: async (request, h) => {
                try {
                    const categories = await pool.query('SELECT * FROM categories ORDER BY id ASC');
                    const products = await pool.query('SELECT * FROM komoditas');
                    const result = categories.rows.map(cat => {
                        const catProducts = products.rows.filter(p => p.category_id === cat.id);
                        return {
                            id: cat.id, nama: cat.nama, keterangan: cat.keterangan || '', foto: cat.foto || null,
                            aktif: catProducts.some(p => p.aktif === true),
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
                return { status: 'success', data: { ...catRes.rows[0], details: prodRes.rows } };
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
            // 4. POST Update Stok & Harga (Edit Manual)
            method: 'POST',
            path: '/api/commodities/update-product',
            handler: async (request) => {
                const { id, harga, stok, aktif } = request.payload;
                await pool.query('UPDATE komoditas SET harga = $1, stok = $2, aktif = $3 WHERE id = $4', [harga, stok, aktif, id]);
                return { status: 'success' };
            }
        },
        {
            // 5. POST Tambah Produk Baru
            method: 'POST',
            path: '/api/commodities/add',
            handler: async (request) => {
                const { category_id, nama, harga, stok, aktif } = request.payload;
                await pool.query('INSERT INTO komoditas (category_id, nama, harga, stok, aktif) VALUES ($1, $2, $3, $4, $5)', [category_id, nama, harga, stok, aktif]);
                return { status: 'success' };
            }
        },
        {
            // 6. POST Update Info Kategori
            method: 'POST',
            path: '/api/categories/update',
            handler: async (request) => {
                const { id, nama, keterangan, foto } = request.payload;
                await pool.query('UPDATE categories SET nama = $1, keterangan = $2, foto = COALESCE($3, foto) WHERE id = $4', [nama.toUpperCase(), keterangan, foto, id]);
                return { status: 'success' };
            }
        },
        {
            // 7. POST Tambah Kategori Baru
            method: 'POST',
            path: '/api/categories/add',
            handler: async (request) => {
                const { id, nama, keterangan, foto } = request.payload;
                await pool.query('INSERT INTO categories (id, nama, aktif, keterangan, foto) VALUES ($1, $2, false, $3, $4)', [id.toLowerCase(), nama.toUpperCase(), keterangan, foto]);
                return { status: 'success' };
            }
        },
        {
            // 8. DELETE Hapus Produk
            method: 'DELETE',
            path: '/api/commodities/delete-product/{id}',
            handler: async (request) => {
                await pool.query('DELETE FROM komoditas WHERE id = $1', [request.params.id]);
                return { status: 'success' };
            }
        },
        {
            // 9. DELETE Hapus Kategori
            method: 'DELETE',
            path: '/api/categories/delete/{id}',
            handler: async (request) => {
                const { id } = request.params;
                await pool.query('DELETE FROM komoditas WHERE category_id = $1', [id]);
                await pool.query('DELETE FROM categories WHERE id = $1', [id]);
                return { status: 'success' };
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
            // 12. GET Dashboard Stats
            method: 'GET',
            path: '/api/stats/categories',
            handler: async () => {
                const res = await pool.query('SELECT c.nama, SUM(k.stok) as total_stok FROM categories c LEFT JOIN komoditas k ON c.id = k.category_id GROUP BY c.nama');
                return { status: 'success', data: res.rows };
            }
        },
        {
            // 13. POST Laporan Panen (PETUGAS TETAP ADA)
            method: 'POST',
            path: '/api/laporan/save',
            handler: async (request) => {
                const { hewan, deret, sesi, kesehatan, kelayakan, pekerjaan, petugas } = request.payload;
                const query = `INSERT INTO laporan_operasional (hewan, deret_kandang, sesi, kesehatan_data, kelayakan_data, pekerjaan_data, petugas) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
                const values = [hewan, parseInt(deret), sesi, JSON.stringify(kesehatan), JSON.stringify(kelayakan), JSON.stringify(pekerjaan), petugas];
                const result = await pool.query(query, values);
                return { status: 'success', data: result.rows[0] };
            }    
        },
        {
            // 14. GET Histori Laporan (Antrian)
            method: 'GET',
            path: '/api/laporan',
            handler: async () => {
                const result = await pool.query('SELECT * FROM laporan_operasional ORDER BY tanggal_jam DESC');
                return { status: 'success', data: result.rows };
            }
        },
        {
            // 15. POST Proses Pembibitan (DARI PANEN -> MASUK MINGGU 1 MESIN TETAS)
            method: 'POST',
            path: '/api/pembibitan/process',
            handler: async (request, h) => {
                const { kategori_id, berhasil, gagal, sisa_ke_konsumsi, sisa_ke_ayam_kampung } = request.payload;
                const client = await pool.connect();
                try {
                    await client.query('BEGIN');
                    const nMasukMesin = parseInt(berhasil) || 0; 
                    const nGagalJual = parseInt(gagal) || 0;
                    const nKonsumsiKg = parseFloat(sisa_ke_konsumsi) || 0; 
                    const nKampung = parseInt(sisa_ke_ayam_kampung) || 0;
                    
                    if (nMasukMesin > 0) {
                        await client.query(
                            `INSERT INTO mesin_tetas (kategori_id, jumlah, status, mesi_1_tgl) VALUES ($1, $2, 'MESIN_1', CURRENT_TIMESTAMP)`,
                            [kategori_id, nMasukMesin]
                        );
                    }
                    
                    await client.query(`UPDATE komoditas SET stok = stok + $1 WHERE category_id = $2 AND nama ILIKE '%Fertil%'`, [nGagalJual, kategori_id]);
                    await client.query(`UPDATE komoditas SET stok = stok + $1 WHERE category_id = $2 AND nama ILIKE '%Telur Konsumsi%'`, [nKonsumsiKg, kategori_id]);
                    await client.query(`UPDATE komoditas SET stok = stok + $1 WHERE category_id = $2 AND nama ILIKE '%Telur Ayam Kampung%'`, [nKampung, kategori_id]);

                    const totalButirProcessed = nMasukMesin + nGagalJual + Math.round(nKonsumsiKg * 17) + nKampung;
                    await client.query(
                        `INSERT INTO hatchery_process (kategori_id, total_panen, hasil_doc, hasil_fertil_jual, hasil_konsumsi) 
                         VALUES ($1, $2, $3, $4, $5)`, 
                        [kategori_id, totalButirProcessed, nMasukMesin, nGagalJual, (nKonsumsiKg + nKampung)]
                    );

                    await client.query('COMMIT');
                    return { status: 'success' };
                } catch (err) {
                    await client.query('ROLLBACK');
                    return h.response({ status: 'error', message: err.message }).code(500);
                } finally { client.release(); }
            }
        },
        {
    // API UNTUK NARIK SEMUA DATA ANTRIAN (UNTUK TABEL UMUR & KARTU)
    method: 'GET',
    path: '/api/mesin-tetas/status/{kategori_id}',
    handler: async (request) => {
        const kategori_id = request.params.kategori_id.toLowerCase(); 
        const res = await pool.query(
            `SELECT id, jumlah, status, mesi_1_tgl 
             FROM mesin_tetas 
             WHERE kategori_id = $1 AND status != 'SELESAI' 
             ORDER BY mesi_1_tgl ASC`, // Urutkan dari yang paling lama
            [kategori_id]
        );
        return { status: 'success', data: res.rows };
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
        },
       {
    // 17. POST Move / Panen Berantai (ALUR FIX: DIAM DI MESIN -> LANGSUNG PANEN)
    method: 'POST',
    path: '/api/mesin-tetas/move',
    handler: async (request, h) => {
        const { kategori_id, from_status, to_status, jumlah_hidup, jumlah_mati } = request.payload;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const nHidup = parseInt(jumlah_hidup) || 0;
            const nMati = parseInt(jumlah_mati) || 0;

            if (to_status === 'SELESAI') {
                // Logika Panen Akhir (Dari Kotak Panen ke DOC)
                await client.query(
                    `UPDATE mesin_tetas 
                     SET status = 'DOC_HIDUP', jumlah = $1, siap_panen_tgl = CURRENT_TIMESTAMP 
                     WHERE id = (
                        SELECT id FROM mesin_tetas 
                        WHERE kategori_id = $2 AND status = 'SIAP_PANEN' 
                        ORDER BY mesi_1_tgl ASC LIMIT 1
                     )`, [nHidup, kategori_id]
                );
                
                await client.query(
                    `UPDATE komoditas SET stok = stok + $1 
                     WHERE category_id = $2 AND (nama ILIKE '%DOC%' OR nama ILIKE '%DOD%')`, 
                    [nHidup, kategori_id]
                );

                await client.query(
                    `INSERT INTO pullet_process (kategori_id, jumlah_hidup, jumlah_mati) 
                     VALUES ($1, $2, $3)`, [kategori_id, nHidup, nMati]
                );

            } else {
                // LOGIKA BARU: Apapun mesinnya (M1/M2/M3), pindah langsung ke SIAP_PANEN
                // Kita ambil batch paling lama (FIFO) agar tidak salah tarik data
                await client.query(
                    `UPDATE mesin_tetas 
                     SET status = 'SIAP_PANEN', siap_panen_tgl = CURRENT_TIMESTAMP 
                     WHERE id = (
                        SELECT id FROM mesin_tetas 
                        WHERE kategori_id = $1 AND status = $2 
                        ORDER BY mesi_1_tgl ASC LIMIT 1
                     )`,
                    [kategori_id, from_status]
                );
            }

            await client.query('COMMIT');
            return { status: 'success' };
        } catch (err) { 
            await client.query('ROLLBACK'); 
            return h.response({ status: 'error', message: err.message }).code(500); 
        } finally { client.release(); }
    }
},
        {
    // 18. POST Proses Pullet (Distribusi ke Pejantan/Petelur/Konsumsi)
    method: 'POST',
    path: '/api/pullet/process',
    handler: async (request, h) => {
        const { kategori_id, pejantan, petelur, stay, pedaging } = request.payload;
        const totalKeluarDariStokPullet = pejantan + petelur + pedaging; // stay tidak dihitung karena tetap di pullet

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // 1. Kurangi Stok Pullet (8 Minggu)
            await client.query(`UPDATE komoditas SET stok = stok - $1 WHERE category_id = $2 AND nama = 'Pullet (8 Minggu)'`, [totalKeluarDariStokPullet, kategori_id]);
            // 2. Tambah Pejantan/Petelur (Asumsi ada produk dengan nama ini)
            await client.query(`UPDATE komoditas SET stok = stok + $1 WHERE category_id = $2 AND nama ILIKE '%Pejantan%'`, [pejantan, kategori_id]);
            await client.query(`UPDATE komoditas SET stok = stok + $1 WHERE category_id = $2 AND nama ILIKE '%Petelur%'`, [petelur, kategori_id]);
            // 3. Tambah ke Ayam Pedaging Konsumsi
            await client.query(`UPDATE komoditas SET stok = stok + $1 WHERE category_id = $2 AND nama = 'Ayam Pedaging Konsumsi'`, [pedaging, kategori_id]);
            // 4. Catat Histori ke tabel baru
            await client.query(`INSERT INTO maturity_process (kategori_id, stok_awal_pullet, hasil_pejantan, hasil_petelur, hasil_stay_pullet, hasil_pedaging_konsumsi) VALUES ($1, (SELECT stok + $2 FROM komoditas WHERE category_id = $1 AND nama = 'Pullet (8 Minggu)'), $3, $4, $5, $6)`, [kategori_id, totalKeluarDariStokPullet, pejantan, petelur, stay, pedaging]);
            
            await client.query('COMMIT');
            return { status: 'success' };
        } catch (err) { await client.query('ROLLBACK'); return h.response({ status: 'error', message: err.message }).code(500); }
        finally { client.release(); }
           }
        },
        {
    // 19. POST Proses Penjualan Ayam (Pejantan/Petelur ke Pedaging Konsumsi)
    method: 'POST',
    path: '/api/production/process',
    handler: async (request, h) => {
        const { kategori_id, sell_pejantan, sell_petelur, awal_pejantan, awal_petelur } = request.payload;
        const totalMasukKePedaging = (parseInt(sell_pejantan) || 0) + (parseInt(sell_petelur) || 0);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // A. Kurangi stok Pejantan & Petelur yang dipilih untuk dijual
            if (sell_pejantan > 0) {
                await client.query(
                    `UPDATE komoditas SET stok = stok - $1 WHERE category_id = $2 AND nama ILIKE '%Pejantan%'`, 
                    [sell_pejantan, kategori_id]
                );
            }
            if (sell_petelur > 0) {
                await client.query(
                    `UPDATE komoditas SET stok = stok - $1 WHERE category_id = $2 AND nama ILIKE '%Petelur%'`, 
                    [sell_petelur, kategori_id]
                );
            }

            // B. Tambah ke stok Ayam Pedaging Konsumsi
            if (totalMasukKePedaging > 0) {
                await client.query(
                    `UPDATE komoditas SET stok = stok + $1 WHERE category_id = $2 AND nama = 'Ayam Pedaging Konsumsi'`, 
                    [totalMasukKePedaging, kategori_id]
                );
            }

            // C. Catat Histori ke tabel production_process
            const sisaJantan = (parseInt(awal_pejantan) || 0) - (parseInt(sell_pejantan) || 0);
            const sisaBetina = (parseInt(awal_petelur) || 0) - (parseInt(sell_petelur) || 0);

            await client.query(
                `INSERT INTO production_process (kategori_id, stok_awal_pejantan, stok_awal_petelur, pejantan_dijual, petelur_dijual, sisa_pejantan_simpan, sisa_petelur_simpan) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
                [kategori_id, awal_pejantan, awal_petelur, sell_pejantan, sell_petelur, sisaJantan, sisaBetina]
            );

            await client.query('COMMIT');
            return { status: 'success' };
        } catch (err) { 
            await client.query('ROLLBACK'); 
            return h.response({ status: 'error', message: err.message }).code(500); 
        } finally { 
            client.release(); 
                }
            }
        },
        {
    // 20. GET Histori Maturity (Untuk Bahan Baku Kelola Ayam)
    method: 'GET',
    path: '/api/pullet/history',
    handler: async () => {
        try {
            // Narik semua data histori proses pullet
            const res = await pool.query('SELECT * FROM maturity_process ORDER BY tanggal_proses DESC');
            return { status: 'success', data: res.rows };
        } catch (err) {
            return { status: 'error', message: err.message };
        }
    }
},
{
    // 21. GET Histori Produksi/Penjualan (Penting buat Update Sisa Stok!)
    method: 'GET',
    path: '/api/production/history',
    handler: async () => {
        try {
            // Narik data penjualan biar presenter tau sisa stok terakhir adalah 15
            const res = await pool.query('SELECT * FROM production_process ORDER BY tanggal_proses DESC');
            return { status: 'success', data: res.rows };
        } catch (err) {
            return { status: 'error', message: err.message };
        }
    }
},
{
            // 22. POST Simpan Asset Baru (PEMBELIAN TELUR TETAS -> MASUK KE MESIN 1)
            method: 'POST',
            path: '/api/asset-baru/save',
            handler: async (request, h) => {
                const { kategori_id, produk, jumlah } = request.payload;
                const client = await pool.connect();
                try {
                    await client.query('BEGIN');
                    const nJumlah = parseInt(jumlah);
                    const cleanId = kategori_id.replace('asset-', '');

                    await client.query(`INSERT INTO pembelian_asset_baru (kategori_id, produk, jumlah) VALUES ($1, $2, $3)`, [kategori_id, produk, nJumlah]);

                    if (produk === 'DOC') {
                        await client.query(
                            `INSERT INTO mesin_tetas (kategori_id, jumlah, status, mesi_1_tgl) VALUES ($1, $2, 'MESIN_1', CURRENT_TIMESTAMP)`,
                            [cleanId, nJumlah]
                        );
                    } else {
                        let target = produk === 'PULLET' ? 'Pullet (8 Minggu)' : (produk === 'AYAM PEJANTAN' ? 'Pejantan' : 'Petelur');
                        await client.query(`UPDATE komoditas SET stok = stok + $1 WHERE category_id = $2 AND nama ILIKE $3`, [nJumlah, cleanId, `%${target}%`]);
                    }

                    await client.query('COMMIT');
                    return { status: 'success' };
                } catch (err) { await client.query('ROLLBACK'); return h.response({ status: 'error' }).code(500); }
                finally { client.release(); }
            }
        },
        {
            // 23. GET Riwayat Asset Baru
            method: 'GET',
            path: '/api/asset-baru/history',
            handler: async () => {
                const res = await pool.query('SELECT * FROM pembelian_asset_baru ORDER BY created_at DESC');
                return { status: 'success', data: res.rows };
            }
        }
    ]);

    await server.start();
    console.log(`🚀 API Dunax Farm FIX TOTAL! Jalur Stok Asset Baru Mentereng!`);
};

process.on('unhandledRejection', (err) => { console.error(err); });
init();