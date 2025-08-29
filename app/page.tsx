'use client'

import { SubmitForm } from '@/components/SubmitForm'

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        UAMS PM&R
                    </h1>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Anonymous Feedback
                    </h1>
                    <p className="text-gray-300">
                        Share your thoughts, concerns, or suggestions anonymously
                    </p>
                </div>

                <SubmitForm />

            </div>
        </div>
    )
}

