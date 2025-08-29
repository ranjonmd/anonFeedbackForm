import { NextRequest, NextResponse } from 'next/server'
import { db, createTable } from '@/lib/database'

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

        // Ensure table exists
        await createTable()

        // Store in database
        const client = await db.connect()
        try {
            const result = await client.query(
                'INSERT INTO complaints (content) VALUES ($1) RETURNING id, created_at',
                [content.trim()]
            )

            const { id, created_at } = result.rows[0]

            console.log('Stored feedback:', {
                id,
                content: content.trim(),
                created_at,
                ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown'
            })

            // Return success response
            return NextResponse.json({
                success: true,
                message: 'Feedback submitted successfully',
                id,
                timestamp: created_at
            })
        } finally {
            client.release()
        }

    } catch (error) {
        console.error('Submit error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
