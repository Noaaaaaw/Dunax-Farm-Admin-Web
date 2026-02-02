import pkg from 'pg';
import 'dotenv/config'; 
const { Pool } = pkg;

// Baris console.log sudah gue hapus biar terminal bersih
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

export default pool;