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


