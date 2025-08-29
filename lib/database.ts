import { Pool } from 'pg'

// Parse the connection string from environment variable
const connectionString = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!connectionString) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
}

// Create a connection pool using the transaction pooler
export const db = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
})

// Test the connection
export async function testConnection() {
    try {
        const client = await db.connect()
        console.log('✅ Database connection successful')
        client.release()
        return true
    } catch (error) {
        console.error('❌ Database connection failed:', error)
        return false
    }
}

// Create the complaints table if it doesn't exist
export async function createTable() {
    try {
        const client = await db.connect()

        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

        await client.query(createTableQuery)
        console.log('✅ Complaints table ready')
        client.release()
        return true
    } catch (error) {
        console.error('❌ Failed to create table:', error)
        return false
    }
}
