import { NextRequest, NextResponse } from 'next/server'
import { insertComplaint } from '@/lib/supabase'
import { encrypt } from '@/lib/encryption'
import { notifyNewFeedback } from '@/lib/notifications'

export async function POST(request: NextRequest) {
    try {
        // Debug: Check if environment variables are loaded
        console.log('Environment check:', {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
            supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0
        })

        const { content, email, phone } = await request.json()

        // Validate input
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Content is required and must be a non-empty string' },
                { status: 400 }
            )
        }

        if (content.length > 10000) {
            return NextResponse.json(
                { error: 'Content must be less than 10,000 characters' },
                { status: 400 }
            )
        }



        // Encrypt sensitive data
        const encryptedContent = encrypt(content.trim())
        const encryptedEmail = email && email.trim() ? encrypt(email.trim()) : null
        const encryptedPhone = phone && phone.trim() ? encrypt(phone.trim()) : null

        // Store encrypted data in database using Supabase client
        const result = await insertComplaint(encryptedContent, encryptedEmail, encryptedPhone)

        console.log('Stored encrypted feedback:', {
            id: result.id,
            content: '[ENCRYPTED]',
            email: encryptedEmail ? '[ENCRYPTED]' : null,
            phone: encryptedPhone ? '[ENCRYPTED]' : null,
            created_at: result.created_at,
            ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown'
        })

        // Send notification (don't await to avoid blocking the response)
        const hasContactInfo = !!(email && email.trim()) || !!(phone && phone.trim())
        notifyNewFeedback(result.id, hasContactInfo).catch(error => {
            console.error('Notification failed:', error)
        })

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Feedback submitted successfully',
            id: result.id,
            timestamp: result.created_at
        })

    } catch (error) {
        console.error('Submit error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
