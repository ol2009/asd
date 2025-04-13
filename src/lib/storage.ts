/**
 * 로컬 스토리지에서 데이터를 가져오는 함수
 * @param key 로컬 스토리지 키
 * @param defaultValue 기본값
 * @returns 저장된 값 또는 기본값
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
        return defaultValue;
    }

    try {
        const value = localStorage.getItem(key);
        if (value === null) {
            return defaultValue;
        }
        return JSON.parse(value);
    } catch (error) {
        console.error(`Failed to parse localStorage item with key "${key}":`, error);
        return defaultValue;
    }
}

/**
 * 로컬 스토리지에 데이터를 저장하는 함수
 * @param key 로컬 스토리지 키
 * @param value 저장할 값
 */
export function setLocalStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Failed to stringify and store localStorage item with key "${key}":`, error);
    }
} 