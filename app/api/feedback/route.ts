import { NextRequest, NextResponse } from 'next/server'
import { getComplaints } from '@/lib/supabase'
import { decrypt } from '@/lib/encryption'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        // Check authentication
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

        // Fetch encrypted feedback from database using Supabase client
        const complaints = await getComplaints()

        // Decrypt the feedback
        const decryptedFeedback = complaints.map(row => ({
            id: row.id,
            content: decrypt(row.content),
            email: row.email ? decrypt(row.email) : null,
            phone: row.phone ? decrypt(row.phone) : null,
            created_at: row.created_at
        }))

        return NextResponse.json({
            success: true,
            feedback: decryptedFeedback
        })

    } catch (error) {
        console.error('Fetch feedback error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
