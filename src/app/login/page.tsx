'use client'

import React, { useState } from 'react'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // 간단한 유효성 검사
        if (!username || !password) {
            setError('아이디와 비밀번호를 모두 입력해주세요.')
            return
        }

        // 테스트용 하드코딩된 사용자 (실제 프로젝트에선 사용하지 마세요!)
        if (username === 'test' && password === '1234') {
            // 로그인 성공 처리
            try {
                localStorage.setItem('user', JSON.stringify({
                    username,
                    name: '테스트 유저',
                    isLoggedIn: true,
                    loginTime: new Date().toISOString()
                }))

                // 학급관리 페이지로 리디렉션
                window.location.href = '/classes'
            } catch (error) {
                console.error('로그인 오류:', error)
                setError('로그인 처리 중 오류가 발생했습니다.')
            }
        } else {
            setError('아이디 또는 비밀번호가 일치하지 않습니다.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('/images/backgrounds/fantasy-bg.jpg')] bg-cover relative">
            <div className="absolute inset-0 bg-[#0f172a]/70" />

            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl relative z-10">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-pink-300">상태창</h1>
                    <p className="mt-2 text-gray-300">계정에 로그인하세요</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/30 border border-red-500 text-white rounded-md">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-200">
                                아이디
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="아이디를 입력하세요"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                                비밀번호
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="비밀번호를 입력하세요"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                            로그인
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-400">
                    <p>테스트 계정: test / 1234</p>
                    <p className="mt-2">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="text-pink-400 hover:text-pink-300"
                        >
                            홈으로 돌아가기
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
} 