import jwt from 'jsonwebtoken'
import { db, verifyPassword, hashPassword } from './database'

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
        const client = await db.connect()

        // Find user by username or email
        const result = await client.query(
            'SELECT id, username, email, password_hash, role, requires_password_reset FROM users WHERE username = $1 OR email = $1',
            [usernameOrEmail]
        )

        client.release()

        if (result.rows.length === 0) {
            return null
        }

        const user = result.rows[0]

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
        const client = await db.connect()

        // Get current user
        const userResult = await client.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        )

        if (userResult.rows.length === 0) {
            client.release()
            return false
        }

        const user = userResult.rows[0]

        // Verify current password
        if (!verifyPassword(currentPassword, user.password_hash)) {
            client.release()
            return false
        }

        // Hash new password
        const newPasswordHash = hashPassword(newPassword)

        // Update password and mark as not requiring reset
        await client.query(
            'UPDATE users SET password_hash = $1, requires_password_reset = false, updated_at = NOW() WHERE id = $2',
            [newPasswordHash, userId]
        )

        client.release()
        return true
    } catch (error) {
        console.error('Password change error:', error)
        return false
    }
}

// Get user by ID
export async function getUserById(userId: number): Promise<JWTPayload | null> {
    try {
        const client = await db.connect()

        const result = await client.query(
            'SELECT id, username, email, role, requires_password_reset FROM users WHERE id = $1',
            [userId]
        )

        client.release()

        if (result.rows.length === 0) {
            return null
        }

        const user = result.rows[0]

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
