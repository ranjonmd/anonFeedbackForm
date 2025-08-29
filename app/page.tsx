'use client'

import { SubmitForm } from '@/components/SubmitForm'

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Anonymous Feedback
                    </h1>
                    <p className="text-gray-600">
                        Share your thoughts, concerns, or suggestions anonymously
                    </p>
                </div>

                <SubmitForm />

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Step 6: Notifications working</p>
                    <p>Email alerts sent to admins when new feedback is submitted</p>
                </div>
            </div>
        </div>
    )
}
