const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')
require('dotenv').config({ path: '.env.local' })

// Get Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required')
    process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Hash password using PBKDF2
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return `${salt}:${hash}`
}

// Check if users table exists
async function checkUsersTable() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .limit(1)

        if (error) {
            console.error('❌ Users table does not exist. Please create it in Supabase dashboard first.')
            return false
        }

        console.log('✅ Users table exists')
        return true
    } catch (error) {
        console.error('❌ Failed to check users table:', error)
        return false
    }
}

// Create initial admin users
async function createInitialUsers() {
    try {
        // Check if users table exists
        const tableExists = await checkUsersTable()
        if (!tableExists) {
            return false
        }

        // Create initial admin users
        const users = [
            {
                username: 'rgardner',
                email: 'rjgardnermd@gmail.com',
                password: 'temp123456'
            },
            {
                username: 'jbg',
                email: 'jgardnerx85@gmail.com',
                password: 'temp123456'
            }
        ]

        for (const user of users) {
            const passwordHash = hashPassword(user.password)

            // Check if user already exists
            const { data: existingUsers, error: checkError } = await supabase
                .from('users')
                .select('id')
                .or(`username.eq.${user.username},email.eq.${user.email}`)

            if (checkError) {
                console.error(`❌ Error checking user ${user.username}:`, checkError)
                continue
            }

            if (!existingUsers || existingUsers.length === 0) {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert([{
                        username: user.username,
                        email: user.email,
                        password_hash: passwordHash,
                        role: 'admin',
                        requires_password_reset: true
                    }])

                if (insertError) {
                    console.error(`❌ Failed to create user ${user.username}:`, insertError)
                } else {
                    console.log(`✅ Created user: ${user.username} (${user.email})`)
                    console.log(`   Temporary password: ${user.password}`)
                }
            } else {
                console.log(`⚠️ User already exists: ${user.username}`)
            }
        }

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
        console.log('   Username: rgardner or jbg')
        console.log('   Email: rjgardnermd@gmail.com or jgardnerx85@gmail.com')
        console.log('   Password: temp123456')
        console.log('\n⚠️  IMPORTANT: Change these passwords after first login!')
    } catch (error) {
        console.error('❌ Setup failed:', error)
        process.exit(1)
    }
}

main()
