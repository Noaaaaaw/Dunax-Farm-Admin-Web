import bcrypt from 'bcrypt';
import pool from '../db.js';

const authRoutes = [{
    method: 'POST',
    path: '/api/login',
    handler: async (request, h) => {
        const { email, password } = request.payload;

        try {
            // 1. Ambil data dari tabel "Karyawan" di Supabase
            const { rows } = await pool.query(
                'SELECT * FROM "Karyawan" WHERE email = $1', 
                [email]
            );

            if (rows.length === 0) {
                return h.response({ status: 'fail', message: 'Email nggak terdaftar!' }).code(401);
            }

            const user = rows[0];

            // 2. Bandingkan password input dengan hash utuh ($2a$)
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return h.response({ status: 'fail', message: 'Password salah total!' }).code(401);
            }

            // 3. Kirim response sukses dengan data kolom 'nama'
            return h.response({
                status: 'success',
                message: 'Login Berhasil! 🚀',
                data: {
                    nama: user.nama, 
                    role: user.role,
                    avatar: `https://ui-avatars.com/api/?name=${user.nama}&background=41644A&color=fff`
                }
            }).code(200);

        } catch (err) {
            console.error("Error PostgreSQL:", err);
            return h.response({ status: 'error', message: 'Gagal konek ke Supabase!' }).code(500);
        }
    }
}];

export default authRoutes;