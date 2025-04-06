/**
 * 브라우저의 localStorage 데이터를 JSON 파일로 내보내는 스크립트입니다.
 * 이 스크립트는 브라우저 콘솔에서 실행해야 합니다.
 * 
 * 사용 방법:
 * 1. 웹 애플리케이션에서 개발자 도구를 엽니다 (F12)
 * 2. 콘솔 탭에서 이 스크립트의 내용을 붙여넣고 실행합니다
 * 3. localStorage 데이터가 JSON 파일로 다운로드됩니다
 */

(function exportLocalStorage() {
    // localStorage의 모든 데이터를 객체로 변환
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            // JSON 데이터는 파싱 후 다시 stringify하여 보기 좋게 저장
            const value = localStorage.getItem(key);
            // JSON인지 확인
            try {
                const parsed = JSON.parse(value);
                data[key] = parsed;
            } catch (e) {
                // JSON이 아니면 그대로 저장
                data[key] = value;
            }
        } catch (e) {
            console.error(`Failed to export key ${key}:`, e);
            data[key] = null;
        }
    }

    // 데이터를 JSON 문자열로 변환
    const jsonData = JSON.stringify(data, null, 2);

    // 파일 다운로드를 위한 Blob 생성
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 다운로드 링크 생성 및 클릭
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localStorage_backup.json';
    document.body.appendChild(a);
    a.click();

    // 정리
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);

    console.log('localStorage 데이터가 내보내기 되었습니다. "localStorage_backup.json" 파일을 확인하세요.');
    console.log(`내보낸 항목 수: ${Object.keys(data).length}`);

    return {
        keyCount: Object.keys(data).length,
        keys: Object.keys(data)
    };
})(); 