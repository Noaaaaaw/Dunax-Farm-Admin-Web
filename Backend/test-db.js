import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  host: "aws-1-ap-southeast-1.pooler.supabase.com",
  port: 6543,
  user: "postgres.cdhpijazjuuvujxlhigq",
  password: "D00nax220475",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => {
    console.log("✅ CONNECTED SUCCESS");
    return client.end();
  })
  .catch(err => {
    console.error("❌ FULL ERROR:", err);
  });