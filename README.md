# 학급 관리 시스템

이 프로젝트는 교사가 학급과 학생을 관리할 수 있는 웹 애플리케이션입니다. Next.js 15를 기반으로 구축되었으며, 학생 정보 관리, 학급 관리 등의 기능을 제공합니다.

## 주요 기능

- **사용자 인증**: 로그인 및 회원가입 기능
- **학급 관리**: 학급 추가, 조회, 상세 정보 확인
- **학생 관리**: 학생 목록 조회, 학생 정보 확인
- **반응형 UI**: 다양한 화면 크기에 최적화된 사용자 인터페이스

## 기술 스택

- **프론트엔드**: Next.js 15, React, TypeScript, TailwindCSS
- **상태 관리**: React Hooks (useState, useEffect)
- **데이터 저장**: 로컬 스토리지 (프로토타입 용도)
- **UI 컴포넌트**: ShadCN UI, Lucide Icons

## 시작하기

다음 명령어로 개발 서버를 실행할 수 있습니다:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 프로젝트 구조

- `app/`: 애플리케이션 페이지 및 컴포넌트
  - `login/`: 로그인 관련 페이지
  - `classes/`: 학급 관리 페이지
  - `classes/[id]/`: 학급 상세 페이지
  - `classes/[id]/students/[id]`: 학생 상세 페이지
- `public/`: 정적 파일 (이미지, 아이콘 등)

## 추가 자료

Next.js에 대해 더 알아보려면 다음 리소스를 참조하세요:

- [Next.js 문서](https://nextjs.org/docs) - Next.js 기능 및 API에 대해 알아보세요.
- [Next.js 학습하기](https://nextjs.org/learn) - 대화형 Next.js 튜토리얼입니다.

## 배포

Next.js 앱을 배포하는 가장 쉬운 방법은 Next.js 제작자의 [Vercel 플랫폼](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)을 사용하는 것입니다.

자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 확인하세요.
