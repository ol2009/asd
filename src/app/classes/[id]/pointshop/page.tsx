'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, X, Save, Trash2, ShoppingBag, LogOut, Edit, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ClassInfo {
    id: string
    name: string
    grade: string
    subject: string
    description: string
    coverImage: string
    createdAt: string
    students?: Student[]
}

interface PointShopItem {
    id: string
    name: string
    description: string
    price: number
    createdAt: string
    itemType?: string
    type: string
}

interface PurchaseHistory {
    id: string
    studentId: string
    itemId: string
    timestamp: string
    used: boolean
    usedDate?: string
}

interface Student {
    id: string
    name: string
}

export default function CouponShopPage() {
    const router = useRouter()
    const params = useParams()
    const classId = params?.id as string
    const [isLoading, setIsLoading] = useState(true)
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [items, setItems] = useState<PointShopItem[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<PointShopItem | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0
    })
    const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [activeTab, setActiveTab] = useState<'items' | 'history'>('items')
    const [isUsedModalOpen, setIsUsedModalOpen] = useState(false)
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseHistory | null>(null)

    useEffect(() => {
        // 로그인 상태 확인
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        if (!isLoggedIn) {
            router.push('/login')
            return
        }

        // 클래스 정보 가져오기
        const savedClasses = localStorage.getItem('classes')
        if (savedClasses) {
            try {
                const classes = JSON.parse(savedClasses)
                const foundClass = classes.find((c: ClassInfo) => c.id === classId)
                if (foundClass) {
                    setClassInfo(foundClass)
                    if (foundClass.students) {
                        setStudents(foundClass.students)
                    } else {
                        loadStudents()
                    }
                }
            } catch (error) {
                console.error('클래스 데이터 파싱 오류:', error)
            }
        }

        // 포인트 상점 아이템 목록 가져오기
        const savedItems = localStorage.getItem(`pointshop_items_${classId}`)
        if (savedItems) {
            try {
                setItems(JSON.parse(savedItems))
            } catch (error) {
                console.error('아이템 데이터 파싱 오류:', error)
            }
        } else {
            setItems([])
        }

        // 구매 내역 가져오기
        loadPurchaseHistory()

        setIsLoading(false)
    }, [classId, router])

    const loadStudents = () => {
        try {
            const savedStudents = localStorage.getItem(`students_${classId}`)
            if (savedStudents) {
                setStudents(JSON.parse(savedStudents))
            } else {
                const classData = localStorage.getItem(`class_${classId}`)
                if (classData) {
                    const parsedClass = JSON.parse(classData)
                    if (parsedClass.students) {
                        setStudents(parsedClass.students)
                    }
                }
            }
        } catch (error) {
            console.error('학생 데이터 로드 오류:', error)
        }
    }

    const loadPurchaseHistory = () => {
        try {
            const savedHistory = localStorage.getItem(`purchase_history_${classId}`)
            if (savedHistory) {
                setPurchaseHistory(JSON.parse(savedHistory))
            } else {
                setPurchaseHistory([])
            }
        } catch (error) {
            console.error('구매 내역 로드 오류:', error)
        }
    }

    // 폼 입력값 변경 핸들러
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        // 가격은 숫자로 변환
        if (name === 'price') {
            const numValue = parseInt(value)
            if (!isNaN(numValue)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: numValue
                }))
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    // 아이템 추가 모달 열기
    const openAddModal = () => {
        setFormData({
            name: '',
            description: '',
            price: 0
        })
        setIsAddModalOpen(true)
    }

    // 아이템 편집 모달 열기
    const openEditModal = (item: PointShopItem) => {
        setSelectedItem(item)
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price
        })
        setIsEditModalOpen(true)
    }

    // 삭제 확인 모달 열기
    const openDeleteConfirm = (item: PointShopItem) => {
        setSelectedItem(item)
        setIsDeleteConfirmOpen(true)
    }

    // 아이템 추가
    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault()

        // 유효성 검사
        if (!formData.name.trim()) {
            toast.error('상품 이름을 입력해주세요.')
            return
        }

        if (formData.price <= 0) {
            toast.error('상품 가격은 0보다 커야 합니다.')
            return
        }

        const newItem: PointShopItem = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            price: formData.price,
            createdAt: new Date().toISOString(),
            itemType: 'class',
            type: 'class'
        }

        // 새 아이템 추가
        const updatedItems = [...items, newItem]
        setItems(updatedItems)

        // 로컬 스토리지 업데이트
        localStorage.setItem(`pointshop_items_${classId}`, JSON.stringify(updatedItems))

        // 모달 닫기
        setIsAddModalOpen(false)
        toast.success('새 상품이 추가되었습니다.')
    }

    // 아이템 수정
    const handleEditItem = (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedItem) return

        // 유효성 검사
        if (!formData.name.trim()) {
            toast.error('상품 이름을 입력해주세요.')
            return
        }

        if (formData.price <= 0) {
            toast.error('상품 가격은 0보다 커야 합니다.')
            return
        }

        const updatedItem = {
            ...selectedItem,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            type: 'class'
        }

        // 아이템 수정
        const updatedItems = items.map(item =>
            item.id === selectedItem.id ? updatedItem : item
        )
        setItems(updatedItems)

        // 로컬 스토리지 업데이트
        localStorage.setItem(`pointshop_items_${classId}`, JSON.stringify(updatedItems))

        // 모달 닫기
        setIsEditModalOpen(false)
        setSelectedItem(null)
        toast.success('상품이 수정되었습니다.')
    }

    // 아이템 삭제
    const handleDeleteItem = () => {
        if (!selectedItem) return

        const updatedItems = items.filter(item => item.id !== selectedItem.id)
        setItems(updatedItems)

        // 로컬 스토리지 업데이트
        localStorage.setItem(`pointshop_items_${classId}`, JSON.stringify(updatedItems))

        // 모달 닫기
        setIsDeleteConfirmOpen(false)
        setSelectedItem(null)
        toast.success('상품이 삭제되었습니다.')
    }

    // 쿠폰 사용 처리 함수 추가
    const handleMarkAsUsed = (purchase: PurchaseHistory) => {
        setSelectedPurchase(purchase)
        setIsUsedModalOpen(true)
    }

    // 쿠폰 사용 완료 처리 함수
    const confirmMarkAsUsed = () => {
        if (!selectedPurchase) return

        try {
            // 구매 내역에서 해당 항목 찾기
            const updatedHistory = purchaseHistory.map(item => {
                if (item.id === selectedPurchase.id) {
                    return {
                        ...item,
                        used: true,
                        usedDate: new Date().toISOString()
                    }
                }
                return item
            })

            // 로컬 스토리지 업데이트
            localStorage.setItem(`purchase_history_${classId}`, JSON.stringify(updatedHistory))
            setPurchaseHistory(updatedHistory)
            setIsUsedModalOpen(false)
            toast.success('쿠폰 사용 처리가 완료되었습니다.')
        } catch (error) {
            console.error('쿠폰 사용 처리 오류:', error)
            toast.error('쿠폰 사용 처리 중 오류가 발생했습니다.')
        }
    }

    // 학생 이름 찾기 함수
    const getStudentName = (studentId: string) => {
        const student = students.find(s => s.id === studentId)
        return student ? student.name : '알 수 없는 학생'
    }

    // 아이템 이름 찾기 함수
    const getItemName = (itemId: string) => {
        const item = items.find(i => i.id === itemId)
        return item ? item.name : '알 수 없는 아이템'
    }

    // 아바타 상품 여부 확인
    const isAvatarItem = (item: PointShopItem) => {
        return item.itemType === 'avatar' || (item.itemType && ['head', 'body', 'hat', 'weapon'].includes(item.itemType))
    }

    if (isLoading) {
        return (
            <div className="min-h-screen text-slate-700 p-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xl">쿠폰 상점 정보를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative">
            {/* 배경 이미지 */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/images/backgrounds/sky-bg.jpg")' }}></div>

            {/* 배경 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-blue-300/30 to-white/20"></div>

            {/* 콘텐츠 영역 */}
            <div className="relative z-10 min-h-screen">
                {/* 헤더 */}
                <div className="bg-blue-500 shadow-md py-4 px-6 flex justify-between items-center text-white">
                    <div className="flex items-center">
                        <Link href={`/classes/${classId}`} className="mr-4">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold">학생 목록으로</h1>
                    </div>
                    <Link href="/login" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>로그아웃</span>
                    </Link>
                </div>

                <div className="container mx-auto py-8 px-4">
                    <div className="mb-8 bg-white/40 backdrop-blur-sm p-6 rounded-xl shadow-md">
                        <h1 className="text-2xl font-bold text-blue-800 mt-4">학급 쿠폰 상점 관리</h1>
                        <p className="text-slate-700">학생들이 골드로 구매할 수 있는 교실 내 쿠폰과 혜택을 관리하세요. 아바타 상품은 시스템에서 자동으로 관리되며 여기서는 수정할 수 없습니다.</p>
                    </div>

                    {/* 탭 메뉴 추가 */}
                    <div className="bg-white/40 backdrop-blur-sm rounded-xl shadow-md p-6 mb-8">
                        <div className="mb-6">
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('items')}
                                    className={`py-2 px-4 font-medium text-sm ${activeTab === 'items' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    학급 쿠폰 관리
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`py-2 px-4 font-medium text-sm ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    쿠폰 사용 내역
                                </button>
                            </div>
                        </div>

                        {/* 상품 관리 탭 */}
                        {activeTab === 'items' && (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-blue-800">학급 쿠폰 목록</h2>
                                    <button
                                        onClick={openAddModal}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2 hover:bg-blue-600 transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        새 쿠폰 추가
                                    </button>
                                </div>

                                {/* 상품 목록 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {items.filter(item => !isAvatarItem(item)).length === 0 ? (
                                        <div className="col-span-full text-center py-10 bg-white/70 backdrop-blur-sm rounded-lg border border-blue-100">
                                            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">등록된 상품이 없습니다. 새 상품을 추가해보세요.</p>
                                        </div>
                                    ) : (
                                        items.filter(item => !isAvatarItem(item)).map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-white/60 backdrop-blur-sm rounded-lg border border-blue-100 p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-blue-700 text-lg">{item.name}</h3>
                                                        <p className="text-slate-600 mt-1">{item.description}</p>
                                                        <div className="mt-3 inline-block px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                                            {item.price} 골드
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                                                            title="수정"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteConfirm(item)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                                            title="삭제"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="mt-8 bg-blue-50/60 backdrop-blur-sm border border-blue-100 rounded-lg p-4">
                                    <h3 className="font-bold text-blue-800 mb-2">쿠폰 상점 사용 안내</h3>
                                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                                        <li>학생들은 미션 달성이나 챌린지 완료를 통해 골드를 얻을 수 있습니다.</li>
                                        <li>학생 상세 정보에서 "쿠폰 상점" 탭을 통해 쿠폰을 구매할 수 있습니다.</li>
                                        <li>아바타 관련 상품은 시스템에서 자동으로 관리됩니다. 교사는 학급 내 쿠폰만 추가/수정할 수 있습니다.</li>
                                        <li>쿠폰 이름과 설명을 명확하게 작성하여 학생들이 혜택을 잘 이해할 수 있도록 해주세요.</li>
                                    </ul>
                                </div>
                            </>
                        )}

                        {/* 구매 내역 관리 탭 */}
                        {activeTab === 'history' && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-blue-800">쿠폰 구매 내역 관리</h2>
                                    <p className="text-slate-600 mt-1">학생들이 구매한 쿠폰의 사용 여부를 관리할 수 있습니다.</p>
                                </div>

                                {purchaseHistory.filter(purchase => {
                                    const item = items.find(i => i.id === purchase.itemId);
                                    return item && !isAvatarItem(item);
                                }).length === 0 ? (
                                    <div className="text-center py-10 bg-white/70 backdrop-blur-sm rounded-lg border border-blue-100">
                                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">아직 구매 내역이 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto bg-white/80 backdrop-blur-sm rounded-lg border border-blue-100">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생 이름</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">쿠폰 이름</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구매 날짜</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용일</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {purchaseHistory.filter(purchase => {
                                                    const item = items.find(i => i.id === purchase.itemId);
                                                    return item && !isAvatarItem(item);
                                                }).map((purchase) => (
                                                    <tr key={purchase.id} className={purchase.used ? "bg-gray-50" : ""}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {getStudentName(purchase.studentId)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {getItemName(purchase.itemId)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(purchase.timestamp).toLocaleDateString('ko-KR', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${purchase.used ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                                                {purchase.used ? '사용 완료' : '사용 가능'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {purchase.usedDate ? new Date(purchase.usedDate).toLocaleDateString('ko-KR', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            {!purchase.used && (
                                                                <button
                                                                    onClick={() => handleMarkAsUsed(purchase)}
                                                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                                >
                                                                    사용 완료 처리
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 기존 모달들 */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-blue-600">새 상품 추가</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddItem}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-slate-700 font-medium mb-1">상품 이름</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="예: 자리선택권, 급식 도우미 면제, 과제 하루 연장권 등"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-slate-700 font-medium mb-1">상품 설명</label>
                                    <input
                                        type="text"
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="상품에 대한 간략한 설명을 입력하세요"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-slate-700 font-medium mb-1">상품 가격 (골드)</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        상품 저장하기
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-blue-600">상품 편집</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditItem}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="edit-name" className="block text-slate-700 font-medium mb-1">상품 이름</label>
                                    <input
                                        type="text"
                                        id="edit-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-description" className="block text-slate-700 font-medium mb-1">상품 설명</label>
                                    <input
                                        type="text"
                                        id="edit-description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-price" className="block text-slate-700 font-medium mb-1">상품 가격 (골드)</label>
                                    <input
                                        type="number"
                                        id="edit-price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        변경사항 저장
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteConfirmOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">상품 삭제</h3>
                        <p className="text-slate-600 mb-6">
                            "{selectedItem.name}" 상품을 정말 삭제하시겠습니까?<br />
                            이 작업은 되돌릴 수 없습니다.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDeleteItem}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            >
                                삭제하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 쿠폰 사용 확인 모달 */}
            {isUsedModalOpen && selectedPurchase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-blue-800 mb-3">쿠폰 사용 처리</h3>
                        <p className="text-gray-600 mb-5">
                            <span className="font-medium">{getStudentName(selectedPurchase.studentId)}</span> 학생의 <span className="font-medium">{getItemName(selectedPurchase.itemId)}</span> 쿠폰을 사용 완료 처리하시겠습니까?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsUsedModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmMarkAsUsed}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                사용 완료 처리
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 