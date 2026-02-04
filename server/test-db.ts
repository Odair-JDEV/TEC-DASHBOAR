import pg from 'pg';
import 'dotenv/config';

const client = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
    try {
        console.log('Testing connection to:', process.env.DATABASE_URL?.split('@')[1]); // Hide credentials
        const res = await client.query('SELECT NOW()');
        console.log('Connection Successful!');
        console.log('Server Time:', res.rows[0].now);
        process.exit(0);
    } catch (err) {
        console.error('Connection Failed:', err);
        process.exit(1);
    }
}

testConnection();
