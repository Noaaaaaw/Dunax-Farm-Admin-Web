import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: "aws-1-ap-southeast-1.pooler.supabase.com",
  port: 6543,
  user: "postgres.cdhpijazjuuvujxlhigq",
  password: "D00nax220475",
  database: "postgres",
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
  max: 20
});

export default pool;