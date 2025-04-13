import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// 환경 변수에서 Supabase URL과 API 키 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 환경 변수가 설정되어 있지 않으면 오류 메시지를 콘솔에 출력
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Supabase URL 또는 API 키가 없습니다. .env.local 파일에 다음 항목이 설정되어 있는지 확인하세요:',
        '\nNEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>',
        '\nNEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>'
    )
}

// 타입이 지정된 Supabase 클라이언트 생성
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Supabase 인증 관련 헬퍼 함수
export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    return { data, error }
}

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata,
        },
    })
    return { data, error }
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
}

export const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
}

export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
}

// Supabase 스토리지 관련 헬퍼 함수
export const uploadFile = async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
    })
    return { data, error }
}

export const getFileUrl = (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
}

export const deleteFile = async (bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).remove([path])
    return { error }
} 