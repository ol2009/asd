// 학생 상세 모달 컴포넌트 리팩토링
// 이 파일은 컴포넌트를 내보내는 인덱스 역할을 합니다.

// 메인 컴포넌트
export { default as StudentDetailModal } from '../StudentDetailModal';

// 하위 컴포넌트
export { default as StudentProfile } from './components/StudentProfile';
export { default as AbilitiesDisplay } from './components/AbilitiesDisplay';
export { default as TabNavigation } from './components/TabNavigation';

// 탭 컴포넌트
export { default as RoadmapTab } from './tabs/RoadmapTab';
export { default as MissionTab } from './tabs/MissionTab';
export { default as CardTab } from './tabs/CardTab';
export { default as AvatarTab } from './tabs/AvatarTab';
export { default as PointShopTab } from './tabs/PointShopTab';

// 커스텀 훅
export { useStudentData } from './hooks/useStudentData';

// 타입
export * from './types';

// 세부 컴포넌트들이 구현되면 여기에 추가로 내보내게 됩니다. 