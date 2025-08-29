'use client'

import { useState } from 'react'

export function SubmitForm() {
    const [content, setContent] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [emailError, setEmailError] = useState<string | null>(null)
    const [phoneError, setPhoneError] = useState<string | null>(null)

    // Validation functions
    const validateEmail = (email: string) => {
        if (!email.trim()) return null // Empty is valid (optional field)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email.trim()) ? null : 'Invalid email format'
    }

    const validatePhone = (phone: string) => {
        if (!phone.trim()) return null // Empty is valid (optional field)
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')

        // Check minimum length (at least 10 digits for a valid phone number)
        if (cleanPhone.length < 10) {
            return 'Phone number must be at least 10 digits'
        }

        const phoneRegex = /^[\+]?[1-9][\d]{9,15}$/
        return phoneRegex.test(cleanPhone) ? null : 'Invalid phone number format'
    }

    // Handle email change with validation
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setEmail(value)
        setEmailError(validateEmail(value))
    }

    // Handle phone change with validation
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPhone(value)
        setPhoneError(validatePhone(value))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!content.trim()) {
            setMessage({ type: 'error', text: 'Please enter your feedback' })
            return
        }

        // Validate email
        const emailError = validateEmail(email)
        if (emailError) {
            setMessage({ type: 'error', text: emailError })
            return
        }

        // Validate phone
        const phoneError = validatePhone(phone)
        if (phoneError) {
            setMessage({ type: 'error', text: phoneError })
            return
        }

        setIsSubmitting(true)
        setMessage(null)

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content.trim(),
                    email: email.trim(),
                    phone: phone.trim()
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Thank you! Your feedback has been submitted anonymously.'
                })
                setContent('')
                setEmail('')
                setPhone('')
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Failed to submit feedback. Please try again.'
                })
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Network error. Please check your connection and try again.'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Feedback *
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts, concerns, or suggestions here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={6}
                        maxLength={10000}
                        disabled={isSubmitting}
                        required
                    />
                    <div className="mt-1 text-sm text-gray-500 text-right">
                        {content.length}/10,000 characters
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email (optional)
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="your.email@example.com"
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${emailError ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={isSubmitting}
                        />
                        {emailError && (
                            <p className="mt-1 text-sm text-red-600">{emailError}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone (optional)
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="+1 (555) 123-4567"
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${phoneError ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={isSubmitting}
                        />
                        {phoneError && (
                            <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                        )}
                    </div>
                </div>

                <div className="text-sm text-gray-500">
                    <p>Contact information is optional. Your feedback will be submitted anonymously regardless.</p>
                </div>

                {message && (
                    <div className={`p-3 rounded-md ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim() || !!emailError || !!phoneError}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
                </button>
            </form>
        </div>
    )
}
