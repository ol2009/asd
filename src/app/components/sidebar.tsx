'use client'

import { LineChart, Target, Heart, Settings, Users, ShoppingBag } from 'lucide-react'

// 사이드바 메뉴 아이템
const menuItems = [
    { label: '학생목록', path: '/classes/[id]', icon: <Users className="w-5 h-5" /> },
    { label: '성장로드맵', path: '/classes/[id]/roadmap', icon: <LineChart className="w-5 h-5" /> },
    { label: '미션 관리', path: '/classes/[id]/missions', icon: <Target className="w-5 h-5" /> },
    { label: '칭찬카드 관리', path: '/classes/[id]/cards', icon: <Heart className="w-5 h-5" /> },
    { label: '학급 골드 상점 관리', path: '/classes/[id]/pointshop', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: '학급 설정', path: '/classes/[id]/settings', icon: <Settings className="w-5 h-5" /> },
] 