import { Pool } from 'pg'
import crypto from 'crypto'

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
        email TEXT,
        phone TEXT,
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

// Create the users table if it doesn't exist
export async function createUsersTable() {
    try {
        const client = await db.connect()

        const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        requires_password_reset BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

        await client.query(createUsersTableQuery)
        console.log('✅ Users table ready')
        client.release()
        return true
    } catch (error) {
        console.error('❌ Failed to create users table:', error)
        return false
    }
}

// Hash password using PBKDF2
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return `${salt}:${hash}`
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':')
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return hash === verifyHash
}

// Create initial admin users
export async function createInitialUsers() {
    try {
        const client = await db.connect()

        // Ensure users table exists
        await createUsersTable()

        // Create initial admin users
        const users = [
            {
                username: 'admin1',
                email: 'admin1@example.com',
                password: 'temp123456'
            },
            {
                username: 'admin2',
                email: 'admin2@example.com',
                password: 'temp123456'
            }
        ]

        for (const user of users) {
            const passwordHash = hashPassword(user.password)

            // Check if user already exists
            const existingUser = await client.query(
                'SELECT id FROM users WHERE username = $1 OR email = $2',
                [user.username, user.email]
            )

            if (existingUser.rows.length === 0) {
                await client.query(
                    'INSERT INTO users (username, email, password_hash, role, requires_password_reset) VALUES ($1, $2, $3, $4, $5)',
                    [user.username, user.email, passwordHash, 'admin', true]
                )
                console.log(`✅ Created user: ${user.username} (${user.email})`)
                console.log(`   Temporary password: ${user.password}`)
            } else {
                console.log(`⚠️ User already exists: ${user.username}`)
            }
        }

        client.release()
        return true
    } catch (error) {
        console.error('❌ Failed to create initial users:', error)
        return false
    }
}
