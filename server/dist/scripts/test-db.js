import 'dotenv/config';
import pg from 'pg';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
}
console.log(`Testing connection to: ${connectionString.split('@')[1]}`); // Log only host for privacy
const pool = new pg.Pool({ connectionString });
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to the database!');
        const res = await client.query('SELECT NOW()');
        console.log('QUERY RESULT:', res.rows[0]);
        client.release();
        await pool.end();
    }
    catch (err) {
        console.error('❌ Connection failed:', err);
        process.exit(1);
    }
}
testConnection();
