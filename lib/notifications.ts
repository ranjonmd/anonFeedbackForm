import { Resend } from 'resend'
import { getAdminEmails as getAdminEmailsFromSupabase } from './supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

// Get admin email addresses for notifications
async function getAdminEmails(): Promise<string[]> {
    const startTime = Date.now()
    console.log('📧 Getting admin emails...')

    try {
        const emails = await getAdminEmailsFromSupabase()
        const time = Date.now() - startTime
        console.log(`📧 Got ${emails.length} admin emails in ${time}ms`)
        return emails
    } catch (error) {
        const time = Date.now() - startTime
        console.error(`❌ Failed to get admin emails after ${time}ms:`, error)
        return []
    }
}

// Send email notification
export async function sendEmailNotification(feedbackId: number, hasContactInfo: boolean): Promise<boolean> {
    const startTime = Date.now()
    console.log('📧 Starting email notification...')

    try {
        const adminEmails = await getAdminEmails()

        if (adminEmails.length === 0) {
            console.log('No admin emails found for notification')
            return false
        }

        const subject = `New Feedback Submitted - ID: ${feedbackId}`
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">New Feedback Received</h2>
                <p>A new feedback submission has been received.</p>
                
                <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Feedback ID:</strong> ${feedbackId}</p>
                    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Contact Info:</strong> ${hasContactInfo ? 'Yes' : 'No'}</p>
                </div>
                
                <p style="margin-top: 24px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        View Feedback Dashboard
                    </a>
                </p>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                    This is an automated notification. Please log in to view the full feedback content.
                </p>
            </div>
        `

        const emailStartTime = Date.now()
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
            to: adminEmails,
            subject,
            html
        })

        const emailTime = Date.now() - emailStartTime
        console.log(`📧 Resend API call took ${emailTime}ms`)

        if (error) {
            console.error('Failed to send email notification:', error)
            return false
        }

        const totalTime = Date.now() - startTime
        console.log(`✅ Email notification sent in ${totalTime}ms:`, data)
        return true
    } catch (error) {
        const totalTime = Date.now() - startTime
        console.error(`❌ Email notification error after ${totalTime}ms:`, error)
        return false
    }
}

// Send notification for new feedback
export async function notifyNewFeedback(feedbackId: number, hasContactInfo: boolean): Promise<void> {
    const startTime = Date.now()
    console.log(`🚀 Starting notification for feedback ID: ${feedbackId}`)

    try {
        // Send email notification
        await sendEmailNotification(feedbackId, hasContactInfo)

        const totalTime = Date.now() - startTime
        console.log(`✅ Notification sent for feedback ID: ${feedbackId} in ${totalTime}ms`)
    } catch (error) {
        const totalTime = Date.now() - startTime
        console.error(`❌ Failed to send notification after ${totalTime}ms:`, error)
    }
}
