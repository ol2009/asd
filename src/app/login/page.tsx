'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    useEffect(() => {
        // 이미 로그인되어 있는지 확인
        const checkSession = async () => {
            try {
                const { data } = await supabase.auth.getSession()
                const isLoggedIn = localStorage.getItem('isLoggedIn')

                if (data.session || isLoggedIn === 'true') {
                    console.log('이미 로그인되어 있습니다. 클래스 페이지로 이동합니다.')
                    // 직접 이동 방식 사용
                    window.location.href = '/classes'
                }
            } catch (error) {
                console.error('세션 확인 오류:', error)
            }
        }

        checkSession()
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        // 테스트 계정 로그인 (간소화된 버전)
        if (email === 'test@example.com' && password === 'test1234') {
            // 테스트 계정으로 로그인 성공
            setMessage('테스트 계정으로 로그인 성공! 리다이렉트 중...')

            // 로컬스토리지에 사용자 정보 저장
            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('user', JSON.stringify({
                username: 'test@example.com',
                name: '테스트 교사',
                loginTime: new Date().toISOString()
            }))

            // 짧은 지연 후 페이지 이동 (화면에 성공 메시지를 잠시 표시하기 위함)
            setTimeout(() => {
                window.location.href = '/classes'
            }, 500)

            return
        }

        // Supabase 로그인 시도
        supabase.auth.signInWithPassword({ email, password })
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }

                if (data && data.user) {
                    // 로그인 성공
                    setMessage('로그인 성공! 리다이렉트 중...')

                    // 기존 호환성을 위해 localStorage에도 저장
                    localStorage.setItem('isLoggedIn', 'true')
                    localStorage.setItem('user', JSON.stringify({
                        username: data.user.email,
                        name: data.user.user_metadata.full_name || data.user.email,
                        loginTime: new Date().toISOString()
                    }))

                    // 짧은 지연 후 페이지 이동
                    setTimeout(() => {
                        window.location.href = '/classes'
                    }, 500)
                }
            })
            .catch((err) => {
                console.error('로그인 오류:', err)
                setError(err.message || '로그인 중 오류가 발생했습니다.')
                setLoading(false)
            })
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative">
            <div className="absolute inset-0 bg-sky-50/60" />

            <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg relative z-10">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-600">상태창</h1>
                    <p className="mt-2 text-slate-600">계정에 로그인하세요</p>
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
                                placeholder="비밀번호를 입력하세요"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-slate-500">
                    <p>계정이 없으신가요? <Link href="/register" className="text-blue-600 hover:text-blue-800">회원가입</Link></p>
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