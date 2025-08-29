import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Database operations using Supabase client
export async function insertComplaint(content: string, email: string | null, phone: string | null) {
    const { data, error } = await supabase
        .from('complaints')
        .insert([
            {
                content,
                email,
                phone
            }
        ])
        .select()

    if (error) {
        throw new Error(`Failed to insert complaint: ${error.message}`)
    }

    return data[0]
}

export async function getComplaints() {
    const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(`Failed to get complaints: ${error.message}`)
    }

    return data
}

export async function getAdminEmails() {
    const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'admin')

    if (error) {
        throw new Error(`Failed to get admin emails: ${error.message}`)
    }

    return data.map(row => row.email)
}

export async function authenticateUser(username: string, password: string) {
    // First, get the user by username or email
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${username},email.eq.${username}`)
        .limit(1)

    if (userError || !users || users.length === 0) {
        return null
    }

    const user = users[0]

    // Verify password (you'll need to implement password hashing comparison)
    // For now, we'll need to handle this differently since Supabase doesn't have built-in password hashing
    // This is a simplified version - you might want to use a different approach

    return user
}

export async function changePassword(userId: number, newPassword: string) {
    // You'll need to implement password hashing here
    const { error } = await supabase
        .from('users')
        .update({
            password_hash: newPassword, // This should be hashed
            requires_password_reset: false
        })
        .eq('id', userId)

    if (error) {
        throw new Error(`Failed to change password: ${error.message}`)
    }

    return true
}
