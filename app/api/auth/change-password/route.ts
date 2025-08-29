import { NextRequest, NextResponse } from 'next/server'
import { changePassword, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            )
        }

        // Get token from Authorization header
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization token required' },
                { status: 401 }
            )
        }

        const token = authHeader.substring(7)
        const user = verifyToken(token)

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }

        // Change password
        const success = await changePassword(user.userId, currentPassword, newPassword)

        if (!success) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully'
        })

    } catch (error) {
        console.error('Password change error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
