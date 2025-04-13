'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit, Trash2, User } from 'lucide-react'
import AvatarRenderer from '@/components/Avatar'
import { Student } from '../types'

interface StudentProfileProps {
    student: Student
    onEditName: () => void
    onEditIcon: () => void
    onEditHonorific: () => void
    onDeleteClick: () => void
}

const StudentProfile: React.FC<StudentProfileProps> = ({
    student,
    onEditName,
    onEditIcon,
    onEditHonorific,
    onDeleteClick
}) => {
    // 학생 아이콘 렌더링 함수
    const renderIcon = (iconType: string | undefined, size: number = 24) => {
        if (!iconType) {
            return <div className="bg-blue-100 w-full h-full" />
        }

        return (
            <div className="relative w-full h-full">
                <Image
                    src={iconType}
                    alt="학생 아이콘"
                    fill
                    className="object-cover"
                />
            </div>
        )
    }

    // 경험치바 계산
    const EXP_PER_LEVEL = 100
    const exp = student.stats.exp || 0
    const expPercentage = ((exp % EXP_PER_LEVEL) / EXP_PER_LEVEL) * 100
    const remainingExp = EXP_PER_LEVEL - (exp % EXP_PER_LEVEL)

    return (
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm p-4">
            {/* 프로필 섹션 */}
            <div className="flex flex-col items-center">
                {/* 프로필 아이콘 - 아바타 사용 */}
                <div className="relative w-28 h-28 mb-3 mx-auto">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center">
                        {student.avatar ? (
                            <AvatarRenderer avatar={student.avatar} size={112} className="mx-auto" />
                        ) : (
                            renderIcon(student.iconType, 32)
                        )}
                    </div>
                    <button
                        onClick={onEditIcon}
                        className="absolute bottom-0 right-0 p-1 bg-blue-500 rounded-full"
                        title="아이콘 변경"
                    >
                        <Edit className="w-4 h-4 text-white" />
                    </button>
                </div>

                {/* 학생 이름 및 기본 정보 */}
                <h3 className="text-xl font-bold text-blue-800 mb-1">{student.name}</h3>
                <p className="text-slate-500 mb-2">{student.number}번</p>

                {/* 칭호 표시 및 수정 버튼 - 칭호가 있을 때만 표시 */}
                {student.honorific && (
                    <div className="flex items-center space-x-1 mb-3">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                            {student.honorific}
                        </span>
                        <button
                            onClick={onEditHonorific}
                            className="p-1 text-yellow-500 hover:text-yellow-600"
                            title="칭호 변경"
                        >
                            <Edit className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {/* 학생 레벨 및 경험치 바 */}
                <div className="w-full mt-2">
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span className="font-semibold">Lv. {student.stats.level}</span>
                        <span>{exp % EXP_PER_LEVEL} / {EXP_PER_LEVEL} EXP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${expPercentage}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 text-right">
                        다음 레벨까지 {remainingExp} EXP 필요
                    </p>
                </div>

                {/* 골드 정보 */}
                <div className="flex items-center justify-center mt-3 bg-yellow-50 w-full py-2 rounded-lg border border-yellow-100">
                    <span className="text-yellow-700 font-medium">보유 골드: {student.points || 0} G</span>
                </div>

                {/* 학생 삭제 버튼 */}
                <button
                    onClick={onDeleteClick}
                    className="mt-4 text-red-500 hover:text-red-600 flex items-center text-sm"
                >
                    <Trash2 className="w-4 h-4 mr-1" />
                    <span>학생 삭제</span>
                </button>
            </div>
        </div>
    );
};

export default StudentProfile; 