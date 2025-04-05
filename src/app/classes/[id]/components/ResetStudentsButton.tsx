'use client'

import { useState } from 'react'
import { toast } from 'sonner'

// 알 이미지 경로 배열
const eggImages = [
    '/images/icons/growmon/egg/egg1.jpg',
    '/images/icons/growmon/egg/egg2.jpg',
    '/images/icons/growmon/egg/egg3.jpg',
    '/images/icons/growmon/egg/egg4.jpg'
]

// 학생 인터페이스
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

interface ResetStudentsButtonProps {
    classId: string
    onReset?: () => void
}

export default function ResetStudentsButton({ classId, onReset }: ResetStudentsButtonProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    // 랜덤 알 이미지 가져오기
    const getRandomEggImage = () => {
        return eggImages[Math.floor(Math.random() * eggImages.length)]
    }

    // 학생 데이터 초기화 함수
    const resetStudentsData = () => {
        try {
            // 학생 목록 가져오기
            const savedStudents = localStorage.getItem(`students_${classId}`)
            if (!savedStudents) {
                toast.error('학생 데이터를 찾을 수 없습니다.')
                return
            }

            let students: Student[] = JSON.parse(savedStudents)

            // 각 학생의 데이터 초기화
            students = students.map(student => ({
                ...student,
                honorific: '',  // 칭호 제거
                stats: {
                    level: 0,   // 레벨 0으로 설정
                    exp: 0      // 경험치 0으로 설정
                },
                iconType: getRandomEggImage(),  // 알 이미지로 변경
                points: 0       // 포인트 0으로 설정
            }))

            // 로컬 스토리지에 저장
            localStorage.setItem(`students_${classId}`, JSON.stringify(students))

            // 클래스 데이터에도 학생 정보 업데이트
            const classData = localStorage.getItem(`class_${classId}`)
            if (classData) {
                const classObj = JSON.parse(classData)
                classObj.students = students
                localStorage.setItem(`class_${classId}`, JSON.stringify(classObj))
            }

            toast.success('모든 학생 데이터가 초기화되었습니다.')

            // 확인 모달 닫기
            setIsConfirmOpen(false)

            // 콜백 실행
            if (onReset) onReset()
        } catch (error) {
            console.error('학생 데이터 초기화 중 오류 발생:', error)
            toast.error('데이터 초기화 중 오류가 발생했습니다.')
        }
    }

    return (
        <>
            <button
                onClick={() => setIsConfirmOpen(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
            >
                학생 데이터 초기화
            </button>

            {/* 확인 모달 */}
            {isConfirmOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[70]">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-red-600 mb-3">⚠️ 주의: 학생 데이터 초기화</h3>
                        <p className="text-slate-700 mb-6">
                            모든 학생의 레벨이 0으로, 아이콘이 '알'로, 칭호가 제거됩니다.
                            이 작업은 되돌릴 수 없습니다. 정말 진행하시겠습니까?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsConfirmOpen(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                            >
                                취소
                            </button>
                            <button
                                onClick={resetStudentsData}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                            >
                                초기화 진행
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
} 