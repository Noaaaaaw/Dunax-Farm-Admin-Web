import Hapi from '@hapi/hapi';
import cors from '@hapi/cors';
import authRoutes from './routes/auth.js';
import pool from './db.js';
import 'dotenv/config';

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: '0.0.0.0',
  });

  /* =============================
     REGISTER CORS (FIX RAILWAY)
  ============================== */
  await server.register({
    plugin: cors,
    options: {
      origins: ['*'],
      headers: ['Accept', 'Authorization', 'Content-Type'],
      exposedHeaders: ['Authorization'],
      maxAge: 86400,
    },
  });

  /* =============================
     LANDING PAGE
  ============================== */
  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      status: 'success',
      message: 'Dunax Farm API is Cloud Powered! ☁️',
      uptime: `${Math.floor(process.uptime())} seconds`,
    }),
  });

  /* =============================
     AUTH ROUTES
  ============================== */
  server.route(authRoutes);

  /* =============================
     MAIN ROUTES
  ============================== */
  server.route([
    /* 1. GET SEMUA KATEGORI */
    {
      method: 'GET',
      path: '/commodities',
      handler: async (_, h) => {
        try {
          const categories = await pool.query('SELECT * FROM categories ORDER BY id ASC');
          const products = await pool.query('SELECT * FROM komoditas ORDER BY id ASC');

          const result = categories.rows.map((cat) => {
            const catProducts = products.rows.filter((p) => p.category_id === cat.id);
            const active = catProducts.filter((p) => p.aktif).length;
            const inactive = catProducts.filter((p) => !p.aktif).length;

            return {
              id: cat.id,
              nama: cat.nama,
              keterangan: cat.keterangan || '',
              foto: cat.foto || null,
              aktif: active >= inactive && active > 0,
              details: catProducts.map((p) => ({
                ...p,
                harga: Number(p.harga),
                isEditing: false,
              })),
            };
          });

          return { status: 'success', data: result };
        } catch (err) {
          console.error(err);
          return h.response({ status: 'error' }).code(500);
        }
      },
    },

    /* 2. GET DETAIL KATEGORI */
    {
      method: 'GET',
      path: '/commodities/{id}',
      handler: async (request, h) => {
        const { id } = request.params;
        try {
          const cat = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
          if (!cat.rows.length) return h.response({ status: 'fail' }).code(404);

          const prod = await pool.query(
            'SELECT * FROM komoditas WHERE category_id = $1 ORDER BY id ASC',
            [id]
          );

          const active = prod.rows.filter((p) => p.aktif).length;
          const inactive = prod.rows.filter((p) => !p.aktif).length;

          return {
            status: 'success',
            data: {
              ...cat.rows[0],
              aktif: active >= inactive && active > 0,
              details: prod.rows.map((p) => ({
                ...p,
                harga: Number(p.harga),
                isEditing: false,
              })),
            },
          };
        } catch (err) {
          return h.response({ status: 'error' }).code(500);
        }
      },
    },

    /* 3. GET PRODUK SPESIFIK */
    {
      method: 'GET',
      path: '/commodities/{id}/{productName}',
      handler: async (request, h) => {
        const { id, productName } = request.params;
        try {
          const res = await pool.query(
            'SELECT * FROM komoditas WHERE category_id = $1 AND nama ILIKE $2',
            [id, productName]
          );
          return res.rows.length
            ? { status: 'success', data: res.rows[0] }
            : h.response({ status: 'fail' }).code(404);
        } catch {
          return h.response({ status: 'error' }).code(500);
        }
      },
    },

    /* 4. UPDATE PRODUK */
    {
      method: 'POST',
      path: '/api/commodities/update-product',
      handler: async (request, h) => {
        const { id, harga, stok, aktif } = request.payload;
        try {
          await pool.query(
            'UPDATE komoditas SET harga=$1, stok=$2, aktif=$3 WHERE id=$4',
            [harga, stok, aktif, id]
          );
          return { status: 'success', message: 'Data Berhasil Disimpan 🚀' };
        } catch {
          return h.response({ status: 'error' }).code(500);
        }
      },
    },

    /* 5. TAMBAH PRODUK */
    {
      method: 'POST',
      path: '/api/commodities/add',
      handler: async (request, h) => {
        const { category_id, nama, harga, stok, aktif } = request.payload;
        try {
          const res = await pool.query(
            `INSERT INTO komoditas (category_id,nama,harga,stok,aktif)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [category_id, nama, harga, stok, aktif]
          );
          return { status: 'success', data: res.rows[0] };
        } catch {
          return h.response({ status: 'error' }).code(500);
        }
      },
    },

    /* 6. STATS STOK */
    {
      method: 'GET',
      path: '/api/stats/stock',
      handler: async () => {
        const res = await pool.query('SELECT SUM(stok) total FROM komoditas');
        return { status: 'success', total: res.rows[0].total || 0 };
      },
    },

    /* 7. SEARCH PRODUK */
    {
      method: 'GET',
      path: '/api/commodities/search',
      handler: async (request, h) => {
        const { q } = request.query;
        try {
          const res = await pool.query(
            `SELECT k.*, c.nama kategori_nama
             FROM komoditas k JOIN categories c ON k.category_id=c.id
             WHERE k.nama ILIKE $1`,
            [`%${q}%`]
          );
          return { status: 'success', data: res.rows };
        } catch {
          return h.response({ status: 'error' }).code(500);
        }
      },
    },
  ]);

  await server.start();
  console.log(`🚀 API RUNNING: ${server.info.uri}`);
};

init();