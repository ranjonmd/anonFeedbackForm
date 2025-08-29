const { Pool } = require('pg')
const crypto = require('crypto')
require('dotenv').config({ path: '.env.local' })

// Parse the connection string from environment variable
const connectionString = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!connectionString) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL environment variable is required')
    process.exit(1)
}

// Create a connection pool
const db = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
})

// Hash password using PBKDF2
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return `${salt}:${hash}`
}

// Create users table
async function createUsersTable() {
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

// Create initial admin users
async function createInitialUsers() {
    try {
        const client = await db.connect()

        // Ensure users table exists
        await createUsersTable()

        // Create initial admin users
        const users = [
            {
                username: 'rgardner',
                email: 'rjgardnermd@gmail.com',
                password: 'temp123456'
            },
            // {
            //     username: 'admin2',
            //     email: 'admin2@example.com',
            //     password: 'temp123456'
            // }
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

// Main execution
async function main() {
    console.log('🚀 Setting up initial admin users...')

    try {
        await createInitialUsers()
        console.log('✅ Setup complete!')
        console.log('\n📋 Login Credentials:')
        console.log('   Username: admin1 or admin2')
        console.log('   Email: admin1@example.com or admin2@example.com')
        console.log('   Password: temp123456')
        console.log('\n⚠️  IMPORTANT: Change these passwords after first login!')
    } catch (error) {
        console.error('❌ Setup failed:', error)
        process.exit(1)
    } finally {
        await db.end()
    }
}

main()
