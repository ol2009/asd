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
        exp: number
    }
    iconType: string
    points?: number
}

// 이미지 아이콘 경로
const gradeIcons = {
    d: [
        '/images/icons/grade_d/Gemini_Generated_Image_t4umtlt4umtlt4um.jpg',
        '/images/icons/grade_d/Gemini_Generated_Image_t3iddit3iddit3id.jpg',
        '/images/icons/grade_d/Gemini_Generated_Image_jzqdr4jzqdr4jzqd.jpg',
        '/images/icons/grade_d/Gemini_Generated_Image_6thu0u6thu0u6thu.jpg',
        '/images/icons/grade_d/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg',
    ]
}

// 알 이미지 경로
const eggImages = [
    '/images/icons/growmon/egg/egg1.jpg',
    '/images/icons/growmon/egg/egg2.jpg',
    '/images/icons/growmon/egg/egg3.jpg',
    '/images/icons/growmon/egg/egg4.jpg'
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

    // 여러 학생 이름을 처리하는 함수
    const processNames = (namesString: string) => {
        return namesString
            .split(/[,\s]+/) // 쉼표나 연속된 공백으로 분리
            .map(name => name.trim())
            .filter(name => name !== ''); // 빈 문자열 제거
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!names.trim()) {
            toast.error('학생 이름을 입력해주세요.')
            return
        }

        try {
            // 이름 목록 생성
            const nameList = processNames(names);

            if (nameList.length === 0) {
                toast.error('유효한 학생 이름을 입력해주세요.')
                return
            }

            console.log('새 학생 추가 시작:', { nameList, classId });

            // 추가할 학생 번호 계산 (클래스 내 학생 수 + 1)
            let nextNumber = 1
            const savedStudents = localStorage.getItem(`students_${classId}`)
            let students = [];

            if (savedStudents) {
                students = JSON.parse(savedStudents)
                if (Array.isArray(students) && students.length > 0) {
                    nextNumber = students.length + 1
                }
            }

            const newStudents: Student[] = [];

            // 각 이름별로 학생 추가
            for (const name of nameList) {
                // 현재 시간 + 랜덤 문자열로 고유 ID 생성
                const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 10) + nextNumber.toString();

                // 새 학생 데이터 생성
                const newStudent: Student = {
                    id: uniqueId,
                    number: nextNumber++,
                    name,
                    honorific: '', // 빈 칭호로 시작
                    stats: {
                        level: 0, // 레벨 0으로 시작
                        exp: 0 // 경험치는 0으로 시작
                    },
                    iconType: eggImages[Math.floor(Math.random() * eggImages.length)], // 랜덤 알 이미지 선택
                    points: 0 // 포인트도 0으로 시작
                }

                newStudents.push(newStudent);
            }

            // 1. students_classId에 학생들 추가
            const updatedStudents = [...students, ...newStudents]
            localStorage.setItem(`students_${classId}`, JSON.stringify(updatedStudents))
            console.log('students_classId에 학생 추가 완료');

            // 2. classes 데이터에도 학생 정보 추가
            const savedClasses = localStorage.getItem('classes')
            if (savedClasses) {
                const classes = JSON.parse(savedClasses)
                const classIndex = classes.findIndex((c: any) => c.id === classId)

                if (classIndex !== -1) {
                    // 해당 클래스의 students 배열이 없으면 생성
                    if (!classes[classIndex].students || !Array.isArray(classes[classIndex].students)) {
                        classes[classIndex].students = []
                    }

                    // 학생들 추가
                    classes[classIndex].students.push(...newStudents)
                    localStorage.setItem('classes', JSON.stringify(classes))
                    console.log('classes에 학생 추가 완료');
                }
            }

            // 3. 상태 업데이트를 위해 각 학생마다 콜백 호출
            // 여기서는 newStudents 배열을 통째로 전달하는 방식이 더 효율적일 수 있음
            newStudents.forEach(student => {
                if (onStudentAdded) {
                    onStudentAdded(student);
                }
            });

            // 폼 초기화
            setNames('')

            // 모달 닫기
            onClose()

            // 성공 메시지
            toast.success(`${newStudents.length}명의 학생이 추가되었습니다.`)
        } catch (error) {
            console.error('학생 추가 중 오류 발생:', error)
            toast.error('학생을 추가하는 중 오류가 발생했습니다.')
        }
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