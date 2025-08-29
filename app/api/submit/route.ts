import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { content } = await request.json()

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

        // For now, just log the submission (no database yet)
        console.log('Received feedback:', {
            content: content.trim(),
            timestamp: new Date().toISOString(),
            ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown'
        })

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Feedback submitted successfully',
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Submit error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
