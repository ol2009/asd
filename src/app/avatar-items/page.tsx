'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import {
    AvatarLayerType,
    AvatarRarity,
    RARITY_NAMES,
    RARITY_BORDER_CLASSES,
    NEWBY_HEAD_ITEMS,
    NEWBY_BODY_ITEMS,
    PREMIUM_HEAD_ITEMS,
    PREMIUM_BODY_ITEMS,
    HAT_ITEMS,
    WEAPON_ITEMS,
    AvatarItem,
} from '@/lib/avatar';
import { isAdmin } from '@/lib/auth';
import { EditAvatarNameModal } from '@/app/avatar-items/components/EditAvatarNameModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AvatarItemsPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<AvatarItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [rarityFilter, setRarityFilter] = useState<string>('all');
    const [currentTab, setCurrentTab] = useState<AvatarLayerType | 'all'>('all');
    const [selectedItem, setSelectedItem] = useState<AvatarItem | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [customNames, setCustomNames] = useState<Record<string, string>>({});

    // 권한 확인 및 초기화
    useEffect(() => {
        const checkAuthorization = () => {
            const adminStatus = isAdmin();
            setIsAuthorized(adminStatus);
            setIsLoading(false);

            if (!adminStatus) {
                // 관리자가 아니면 홈으로 리디렉션
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            }
        };

        // 클라이언트 측에서만 실행
        if (typeof window !== 'undefined') {
            checkAuthorization();
        }
    }, [router]);

    // 로컬스토리지에서 이름 변경 데이터 불러오기
    useEffect(() => {
        if (!isAuthorized) return;

        const storedNames = localStorage.getItem('avatarCustomNames');
        if (storedNames) {
            try {
                setCustomNames(JSON.parse(storedNames));
            } catch (e) {
                console.error('아바타 이름 데이터 로드 오류:', e);
            }
        }
    }, [isAuthorized]);

    // 이름 변경 저장
    const saveCustomName = (itemId: string, newName: string) => {
        const updatedNames = { ...customNames, [itemId]: newName };
        setCustomNames(updatedNames);
        localStorage.setItem('avatarCustomNames', JSON.stringify(updatedNames));
    };

    // 모든 아이템 불러오기
    useEffect(() => {
        if (!isAuthorized) return;

        const allItems = [
            ...NEWBY_HEAD_ITEMS,
            ...NEWBY_BODY_ITEMS,
            ...PREMIUM_HEAD_ITEMS,
            ...PREMIUM_BODY_ITEMS,
            ...HAT_ITEMS,
            ...WEAPON_ITEMS
        ];
        setItems(allItems);
    }, [isAuthorized]);

    // 필터링된 아이템 목록
    const filteredItems = items.filter(item => {
        // 타입 필터링
        if (currentTab !== 'all' && item.type !== currentTab) {
            return false;
        }

        // 희귀도 필터링
        if (rarityFilter !== 'all' && item.rarity.toString() !== rarityFilter) {
            return false;
        }

        // 검색어 필터링
        const displayName = customNames[item.id] || item.name;
        return displayName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // 아이템 이름 표시
    const getItemDisplayName = (item: AvatarItem) => {
        return customNames[item.id] || item.name;
    };

    // 로딩 중이면 로딩 표시
    if (isLoading) {
        return (
            <div className="container py-8 flex items-center justify-center min-h-screen">
                <p className="text-xl text-blue-600">로딩 중...</p>
            </div>
        );
    }

    // 권한이 없으면 접근 거부 메시지 표시
    if (!isAuthorized) {
        return (
            <div className="container py-8">
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>접근 거부</AlertTitle>
                    <AlertDescription>
                        이 페이지는 관리자만 접근할 수 있습니다. 곧 홈페이지로 이동합니다.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">아바타 아이템 목록 (관리자 전용)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="w-full md:w-1/3">
                                <Input
                                    placeholder="아이템 이름 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-1/3">
                                <Select
                                    value={rarityFilter}
                                    onValueChange={setRarityFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="희귀도 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">모든 희귀도</SelectItem>
                                        <SelectItem value="1">일반 (흰색)</SelectItem>
                                        <SelectItem value="2">희귀 (녹색)</SelectItem>
                                        <SelectItem value="3">영웅 (보라색)</SelectItem>
                                        <SelectItem value="4">전설 (주황색)</SelectItem>
                                        <SelectItem value="5">신화 (무지개)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Tabs
                            defaultValue="all"
                            value={currentTab}
                            onValueChange={(value) => setCurrentTab(value as AvatarLayerType | 'all')}
                        >
                            <TabsList className="w-full">
                                <TabsTrigger value="all" className="flex-1">
                                    전체
                                </TabsTrigger>
                                <TabsTrigger value="head" className="flex-1">
                                    머리
                                </TabsTrigger>
                                <TabsTrigger value="body" className="flex-1">
                                    몸
                                </TabsTrigger>
                                <TabsTrigger value="hat" className="flex-1">
                                    모자
                                </TabsTrigger>
                                <TabsTrigger value="weapon" className="flex-1">
                                    무기
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value={currentTab}>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-20">이미지</TableHead>
                                                <TableHead>이름</TableHead>
                                                <TableHead>타입</TableHead>
                                                <TableHead>희귀도</TableHead>
                                                <TableHead className="text-right">관리</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredItems.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-6">
                                                        검색 결과가 없습니다.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredItems.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            <div className={`relative w-12 h-12 ${RARITY_BORDER_CLASSES[item.rarity]} rounded-md overflow-hidden`}>
                                                                <Image
                                                                    src={item.inventoryImagePath || item.imagePath}
                                                                    alt={item.name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="object-contain"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {getItemDisplayName(item)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.type === 'head' && '머리'}
                                                            {item.type === 'body' && '몸'}
                                                            {item.type === 'hat' && '모자'}
                                                            {item.type === 'weapon' && '무기'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`
                                px-2 py-1 rounded-full text-xs
                                ${item.rarity === AvatarRarity.COMMON && 'bg-gray-100 text-gray-800'}
                                ${item.rarity === AvatarRarity.RARE && 'bg-green-100 text-green-800'}
                                ${item.rarity === AvatarRarity.EPIC && 'bg-purple-100 text-purple-800'}
                                ${item.rarity === AvatarRarity.LEGENDARY && 'bg-orange-100 text-orange-800'}
                                ${item.rarity === AvatarRarity.MYTHIC && 'bg-gradient-to-r from-pink-100 via-blue-100 to-purple-100 text-indigo-800'}
                              `}>
                                                                {RARITY_NAMES[item.rarity]}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <button
                                                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                                                onClick={() => {
                                                                    setSelectedItem(item);
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                            >
                                                                이름 변경
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>

            {/* 이름 변경 모달 */}
            <EditAvatarNameModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                item={selectedItem}
                currentName={selectedItem ? customNames[selectedItem.id] || selectedItem.name : ''}
                onSave={(item, newName) => {
                    saveCustomName(item.id, newName);
                    setIsEditModalOpen(false);
                }}
            />
        </div>
    );
} 