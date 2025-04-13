'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    useEffect(() => {
        // 이미 로그인되어 있는지 확인
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession()
            if (data.session) {
                router.push('/classes')
            }
        }

        checkSession()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        // 입력값 검증
        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.')
            setLoading(false)
            return
        }

        try {
            // Supabase에 회원가입 요청
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            })

            if (error) {
                throw error
            }

            if (data) {
                // 이메일 확인이 필요한 경우
                if (data.user?.identities?.length === 0) {
                    setMessage('이미 가입된 이메일입니다. 로그인 페이지로 이동합니다.')
                    setTimeout(() => {
                        router.push('/login')
                    }, 3000)
                }
                // 회원가입 성공
                else {
                    setMessage('회원가입이 완료되었습니다. 이메일 확인 후 로그인해주세요.')
                    setTimeout(() => {
                        router.push('/login')
                    }, 3000)
                }
            }
        } catch (err: any) {
            console.error('회원가입 오류:', err)
            setError(err.message || '회원가입 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative">
            <div className="absolute inset-0 bg-sky-50/60" />

            <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg relative z-10">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-600">상태창</h1>
                    <p className="mt-2 text-slate-600">새 계정 만들기</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">
                        {message}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                이메일
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="이메일을 입력하세요"
                            />
                        </div>

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                                이름 (성함)
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="이름을 입력하세요"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                비밀번호
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="비밀번호를 입력하세요 (6자 이상)"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                비밀번호 확인
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="비밀번호를 다시 입력하세요"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '회원가입 중...' : '회원가입'}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-slate-500">
                    <p>이미 계정이 있으신가요? <Link href="/login" className="text-blue-600 hover:text-blue-800">로그인</Link></p>
                    <p className="mt-2">
                        <Link href="/" className="text-blue-600 hover:text-blue-800">
                            홈으로 돌아가기
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
} 