'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    username: string
    email: string
    role: string
    requiresPasswordReset: boolean
}

interface Feedback {
    id: number
    content: string
    email: string | null
    phone: string | null
    created_at: string
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [loginError, setLoginError] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<Feedback[]>([])
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false)
    const [showPasswordReset, setShowPasswordReset] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
    const router = useRouter()

    // Check if user is already authenticated
    useEffect(() => {
        const savedToken = localStorage.getItem('admin-token')
        if (savedToken) {
            setToken(savedToken)
            setIsAuthenticated(true)
            loadFeedback(savedToken)
        }
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoggingIn(true)
        setLoginError(null)

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })

            const data = await response.json()

            if (response.ok) {
                setToken(data.token)
                setUser(data.user)
                setIsAuthenticated(true)
                localStorage.setItem('admin-token', data.token)
                setUsername('')
                setPassword('')
                loadFeedback(data.token)
            } else {
                setLoginError(data.error || 'Login failed')
            }
        } catch (error) {
            setLoginError('Network error. Please try again.')
        } finally {
            setIsLoggingIn(false)
        }
    }

    const handleLogout = () => {
        setToken(null)
        setUser(null)
        setIsAuthenticated(false)
        setFeedback([])
        setShowPasswordReset(false)
        localStorage.removeItem('admin-token')
        router.push('/admin')
    }

    const loadFeedback = async (authToken: string) => {
        setIsLoadingFeedback(true)
        try {
            const response = await fetch('/api/feedback', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setFeedback(data.feedback)
            } else if (response.status === 401) {
                // Token expired
                handleLogout()
            }
        } catch (error) {
            console.error('Failed to load feedback:', error)
        } finally {
            setIsLoadingFeedback(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsChangingPassword(true)
        setPasswordError(null)
        setPasswordSuccess(null)

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match')
            setIsChangingPassword(false)
            return
        }

        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters long')
            setIsChangingPassword(false)
            return
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            })

            const data = await response.json()

            if (response.ok) {
                setPasswordSuccess('Password changed successfully!')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
                setShowPasswordReset(false)
                // Update user state to reflect password reset
                if (user) {
                    setUser({ ...user, requiresPasswordReset: false })
                }
            } else {
                setPasswordError(data.error || 'Failed to change password')
            }
        } catch (error) {
            setPasswordError('Network error. Please try again.')
        } finally {
            setIsChangingPassword(false)
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Admin Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your credentials to view feedback
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Username or Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        disabled={isLoggingIn}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        disabled={isLoggingIn}
                                    />
                                </div>
                            </div>

                            {loginError && (
                                <div className="text-red-600 text-sm">
                                    {loginError}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {isLoggingIn ? 'Logging in...' : 'Login'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Feedback Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Welcome, {user?.username} ({user?.email})
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            {user?.requiresPasswordReset && (
                                <button
                                    onClick={() => setShowPasswordReset(true)}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                >
                                    Reset Password
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {user?.requiresPasswordReset && !showPasswordReset && (
                        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                            <strong>Password Reset Required:</strong> Please change your temporary password.
                        </div>
                    )}

                    {showPasswordReset && (
                        <div className="mb-6 bg-white shadow sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                {passwordError && (
                                    <div className="text-red-600 text-sm">{passwordError}</div>
                                )}
                                {passwordSuccess && (
                                    <div className="text-green-600 text-sm">{passwordSuccess}</div>
                                )}
                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordReset(false)}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        {isLoadingFeedback ? (
                            <div className="p-6 text-center text-gray-500">
                                Loading feedback...
                            </div>
                        ) : feedback.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No feedback submitted yet.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {feedback.map((item) => (
                                    <li key={item.id} className="px-6 py-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                                    {item.content}
                                                </p>
                                                <span className="text-xs text-gray-500 ml-4">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {(item.email || item.phone) && (
                                                <div className="text-xs text-gray-600 space-y-1">
                                                    {item.email && (
                                                        <div>📧 {item.email}</div>
                                                    )}
                                                    {item.phone && (
                                                        <div>📞 {item.phone}</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
