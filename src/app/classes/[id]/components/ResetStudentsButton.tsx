'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { parseAvatarString, stringifyAvatar } from '@/lib/avatar'

// 학생 아이콘 목록
const studentIcons = [
    '/images/icons/student_icon_1.png',
    '/images/icons/student_icon_2.png',
    '/images/icons/student_icon_3.png',
    '/images/icons/student_icon_4.png'
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

// 마법사 나라 아바타 아이템을 삭제하는 함수
export function removeNaraAvatarFromAllStudents(classId: string) {
    try {
        // 학생 데이터 가져오기
        const savedStudents = localStorage.getItem(`students_${classId}`)
        if (!savedStudents) {
            toast.error('학생 데이터를 찾을 수 없습니다.')
            return
        }

        const students = JSON.parse(savedStudents)
        let updatedCount = 0

        // 각 학생의 아바타를 확인하고 마법사 나라 아바타를 사용하는 경우 변경
        const updatedStudents = students.map((student: any) => {
            if (student.avatar) {
                const avatarData = parseAvatarString(student.avatar)
                let isUpdated = false

                // head 부분이 마법사 나라인지 확인
                if (avatarData.head && (
                    avatarData.head.id === 'head_2_nara' ||
                    avatarData.head.name === '마법사 나라'
                )) {
                    // head 부분 삭제 (기본 아바타로 돌아감)
                    delete avatarData.head
                    isUpdated = true
                }

                // 아바타를 업데이트한 경우에만 학생 데이터 업데이트
                if (isUpdated) {
                    updatedCount++
                    return {
                        ...student,
                        avatar: stringifyAvatar(avatarData)
                    }
                }
            }
            return student
        })

        // 업데이트된 학생 데이터 저장
        localStorage.setItem(`students_${classId}`, JSON.stringify(updatedStudents))

        // class_{classId} 데이터도 업데이트
        const savedClass = localStorage.getItem(`class_${classId}`)
        if (savedClass) {
            const classData = JSON.parse(savedClass)
            if (classData.students) {
                classData.students = updatedStudents
                localStorage.setItem(`class_${classId}`, JSON.stringify(classData))
            }
        }

        if (updatedCount > 0) {
            toast.success(`${updatedCount}명의 학생 아바타에서 마법사 나라 머리를 제거했습니다.`)
        } else {
            toast.info('마법사 나라 머리를 사용하는 학생이 없습니다.')
        }
    } catch (error) {
        console.error('마법사 나라 아바타 제거 중 오류 발생:', error)
        toast.error('아바타 업데이트 중 오류가 발생했습니다.')
    }
}

export default function ResetStudentsButton({ classId, onReset }: ResetStudentsButtonProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    // 랜덤 알 이미지 가져오기
    const getRandomEggImage = () => {
        return studentIcons[Math.floor(Math.random() * studentIcons.length)]
    }

    const handleResetStudents = () => {
        try {
            const savedStudents = localStorage.getItem(`students_${classId}`)
            if (!savedStudents) {
                toast.error('학생 데이터를 찾을 수 없습니다.')
                return
            }

            const students = JSON.parse(savedStudents)
            const resetStudents = students.map((student: any) => ({
                ...student,
                stats: {
                    level: 1,
                    exp: 0
                },
                points: 0
            }))

            localStorage.setItem(`students_${classId}`, JSON.stringify(resetStudents))

            // class_{classId} 데이터도 업데이트
            const savedClass = localStorage.getItem(`class_${classId}`)
            if (savedClass) {
                const classData = JSON.parse(savedClass)
                if (classData.students) {
                    classData.students = resetStudents
                    localStorage.setItem(`class_${classId}`, JSON.stringify(classData))
                }
            }

            toast.success('모든 학생의 레벨이 초기화되었습니다.')
            setIsConfirmOpen(false)
            if (onReset) onReset()
        } catch (error) {
            console.error('학생 레벨 초기화 중 오류 발생:', error)
            toast.error('학생 레벨 초기화 중 오류가 발생했습니다.')
        }
    }

    // 마법사 나라 아바타 제거 버튼 추가
    const handleRemoveNaraAvatar = () => {
        if (window.confirm('마법사 나라 머리를 사용하는 모든 학생의 아바타를 변경하시겠습니까?')) {
            removeNaraAvatarFromAllStudents(classId)
        }
    }

    return (
        <div className="space-y-2">
            <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsConfirmOpen(true)}
                className="w-full"
            >
                모든 학생 레벨 초기화
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveNaraAvatar}
                className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
                마법사 나라 아바타 제거
            </Button>

            {/* 확인 모달 */}
            {isConfirmOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-4">학생 데이터 초기화</h3>
                        <p className="mb-6">모든 학생의 레벨과 경험치, 포인트를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsConfirmOpen(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleResetStudents}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                            >
                                초기화
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 