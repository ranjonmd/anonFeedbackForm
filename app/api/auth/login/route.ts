import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }

        // Authenticate user
        const user = await authenticateUser(username, password)

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            )
        }

        // Generate JWT token
        const token = generateToken(user)

        // Return token and user info
        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.userId,
                username: user.username,
                email: user.email,
                role: user.role,
                requiresPasswordReset: user.requiresPasswordReset
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
