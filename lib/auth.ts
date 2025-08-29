import jwt from 'jsonwebtoken'
import { supabase } from './supabase'
import { verifyPassword, hashPassword } from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'
const JWT_EXPIRES_IN = '24h'

export interface JWTPayload {
    userId: number
    username: string
    email: string
    role: string
    requiresPasswordReset: boolean
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
        return decoded
    } catch (error) {
        return null
    }
}

// Authenticate user with username/email and password
export async function authenticateUser(usernameOrEmail: string, password: string): Promise<JWTPayload | null> {
    try {
        // Find user by username or email
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, email, password_hash, role, requires_password_reset')
            .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
            .limit(1)

        if (error || !users || users.length === 0) {
            return null
        }

        const user = users[0]

        // Verify password
        if (!verifyPassword(password, user.password_hash)) {
            return null
        }

        return {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            requiresPasswordReset: user.requires_password_reset
        }
    } catch (error) {
        console.error('Authentication error:', error)
        return null
    }
}

// Change user password
export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
        // Get current user
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('password_hash')
            .eq('id', userId)
            .limit(1)

        if (userError || !users || users.length === 0) {
            return false
        }

        const user = users[0]

        // Verify current password
        if (!verifyPassword(currentPassword, user.password_hash)) {
            return false
        }

        // Hash new password
        const newPasswordHash = hashPassword(newPassword)

        // Update password and mark as not requiring reset
        const { error: updateError } = await supabase
            .from('users')
            .update({
                password_hash: newPasswordHash,
                requires_password_reset: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (updateError) {
            console.error('Password update error:', updateError)
            return false
        }

        return true
    } catch (error) {
        console.error('Password change error:', error)
        return false
    }
}

// Get user by ID
export async function getUserById(userId: number): Promise<JWTPayload | null> {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, email, role, requires_password_reset')
            .eq('id', userId)
            .limit(1)

        if (error || !users || users.length === 0) {
            return null
        }

        const user = users[0]

        return {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            requiresPasswordReset: user.requires_password_reset
        }
    } catch (error) {
        console.error('Get user error:', error)
        return null
    }
}
