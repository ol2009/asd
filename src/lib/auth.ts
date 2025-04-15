/**
 * 사용자 권한 관련 유틸리티 함수
 */

const ADMIN_EMAILS = ['test@example.com', 'admin@example.com'];

/**
 * 현재 로그인한 사용자가 관리자인지 확인
 * @returns {boolean} 관리자 여부
 */
export function isAdmin(): boolean {
    try {
        // 로컬 스토리지에서 사용자 정보 가져오기
        const userData = localStorage.getItem('user');
        if (!userData) return false;

        const user = JSON.parse(userData);
        return ADMIN_EMAILS.includes(user.username);
    } catch (error) {
        console.error('관리자 권한 확인 오류:', error);
        return false;
    }
}

/**
 * 사용자가 로그인되어 있는지 확인
 * @returns {boolean} 로그인 여부
 */
export function isLoggedIn(): boolean {
    try {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        return isLoggedIn === 'true';
    } catch (error) {
        console.error('로그인 상태 확인 오류:', error);
        return false;
    }
} 