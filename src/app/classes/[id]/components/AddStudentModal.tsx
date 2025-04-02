'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Student {
    id: string
    number: number
    name: string
    honorific: string
    stats: {
        level: number
    }
    iconType: string
}

// 이미지 아이콘 경로
const iconTypes = [
    '/images/icons/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg',
    '/images/icons/Gemini_Generated_Image_49lajh49lajh49la.jpg',
    '/images/icons/Gemini_Generated_Image_6thu0u6thu0u6thu.jpg',
    '/images/icons/Gemini_Generated_Image_el7avsel7avsel7a.jpg',
    '/images/icons/Gemini_Generated_Image_eun2yveun2yveun2.jpg',
    '/images/icons/Gemini_Generated_Image_gf0wfdgf0wfdgf0w.jpg',
    '/images/icons/Gemini_Generated_Image_jzqdr4jzqdr4jzqd.jpg',
    '/images/icons/Gemini_Generated_Image_ogd5ztogd5ztogd5.jpg',
    '/images/icons/Gemini_Generated_Image_t3iddit3iddit3id.jpg',
    '/images/icons/Gemini_Generated_Image_t4umtlt4umtlt4um.jpg',
    '/images/icons/Gemini_Generated_Image_vl29o5vl29o5vl29.jpg',
    '/images/icons/Gemini_Generated_Image_xg0y2rxg0y2rxg0y.jpg'
]

// 랜덤 칭호 가져오기
const honorifics = [
    '독서왕', '수학천재', '과학마니아', '영어고수', '역사박사',
    '체육특기생', '예술가', '코딩마법사', '토론왕', '리더십마스터',
    '창의왕', '성실상', '발표왕', '노력상', '협동왕'
]

interface AddStudentModalProps {
    classId: string
    isOpen: boolean
    onClose: () => void
    onStudentAdded: (student: Student) => void
}

export default function AddStudentModal({ classId, isOpen, onClose, onStudentAdded }: AddStudentModalProps) {
    const [names, setNames] = useState('')

    // 랜덤 값 가져오기 함수
    const getRandomFromArray = (array: string[]) => {
        return array[Math.floor(Math.random() * array.length)];
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!names.trim()) {
            toast.error('학생 이름을 입력해주세요')
            return
        }

        // 쉼표나 공백으로 구분된 이름들을 분리
        const nameList = names
            .split(/[,\s]+/) // 쉼표나 연속된 공백으로 분리
            .map(name => name.trim())
            .filter(name => name !== '') // 빈 문자열 제거

        if (nameList.length === 0) {
            toast.error('유효한 학생 이름을 입력해주세요')
            return
        }

        // 현재 학생 목록 가져오기
        const savedStudents = localStorage.getItem(`students_${classId}`)
        let students: Student[] = []

        if (savedStudents) {
            try {
                students = JSON.parse(savedStudents)
            } catch (error) {
                console.error('학생 데이터 로드 오류:', error)
            }
        }

        let nextNumber = students.length + 1
        const newStudents: Student[] = []

        // 각 이름별로 학생 추가
        for (const name of nameList) {
            // 새 학생 데이터 생성 (랜덤 값으로 설정)
            const newStudent: Student = {
                id: Date.now().toString() + nextNumber.toString(),
                number: nextNumber++,
                name,
                honorific: '', // 빈 칭호로 시작
                stats: {
                    level: 1 // 레벨 1로 고정
                },
                iconType: iconTypes[0] // 첫 번째 기본 이미지 사용
            }

            // 학생 목록에 추가
            students.push(newStudent)
            newStudents.push(newStudent)

            // 각 학생을 부모 컴포넌트에 알림
            onStudentAdded(newStudent)
        }

        // 저장
        localStorage.setItem(`students_${classId}`, JSON.stringify(students))

        // 폼 초기화
        setNames('')

        toast.success(`${newStudents.length}명의 학생이 추가되었습니다`)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto relative">
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                >
                    <X className="w-5 h-5 text-slate-600" />
                </button>

                <h2 className="text-2xl font-bold text-blue-600 mb-6">새 학생 추가</h2>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* 이름 입력 */}
                        <div>
                            <label htmlFor="names" className="block text-slate-700 font-medium mb-1">학생 이름</label>
                            <div className="text-slate-500 text-sm mb-2">
                                여러 학생을 추가하려면 이름을 쉼표(,)나 띄어쓰기로 구분해 입력하세요
                            </div>
                            <textarea
                                id="names"
                                value={names}
                                onChange={(e) => setNames(e.target.value)}
                                className="w-full px-3 py-2 h-24 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="예: 홍길동, 김철수, 이영희"
                            />
                        </div>

                        {/* 제출 버튼 */}
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md mt-6 transition"
                        >
                            학생 추가하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 