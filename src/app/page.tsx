// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* 히어로 섹션 */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
              {/* 왼쪽: 텍스트 콘텐츠 */}
              <div className="text-center md:text-left self-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 font-heading">DigiSafe</h1>
                <h2 className="text-2xl md:text-3xl mb-4 text-gray-800 font-heading">
                  당신의 소중한 정보,<br />
                  지금 안전하게 미래를 대비하세요
                </h2>
                
                {/* 슬로건 */}
                <p className="text-2xl md:text-3xl text-primary-600 font-bold mb-8 tracking-wide font-heading">
                  Protected Always,<br />
                  But Ready When Needed
                </p>
                
                <p className="text-lg text-gray-600 max-w-2xl mx-auto md:mx-0 mb-6">
                  디지털 자산을 완벽히 보호하고,<br />
                  위급 상황에만 믿을 수 있는 사람에게 전달됩니다.
                </p>
                
                <p className="text-lg text-gray-600 max-w-2xl mx-auto md:mx-0 mb-10">
                  언제 어떤 일이 일어날지 모르기에,<br />
                  지금 준비하세요.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
                  <Link 
                    href="/register" 
                    className="px-8 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 text-center transition-colors"
                  >
                    지금 시작하기
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="px-8 py-3 bg-white text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 text-center transition-colors"
                  >
                    요금제 보기
                  </Link>
                </div>
                
                {/* 신뢰 요소 표시 */}
                <div className="flex items-center justify-center md:justify-start space-x-3 text-base md:text-lg text-gray-700 font-medium bg-primary-50 py-3 px-6 rounded-lg max-w-md mx-auto md:mx-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>AWS 엔터프라이즈급 보안 인프라로 안심하세요</span>
                </div>
              </div>
              
              {/* 오른쪽: 서비스 이미지 */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl transform rotate-3"></div>
                <div className="relative">
                  <Image
                    src="/service-image.jpg"
                    alt="DigiSafe 서비스 이미지"
                    width={1200}
                    height={800}
                    className="rounded-2xl shadow-xl object-cover"
                    priority
                    quality={90}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 기능 소개 카드 */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">왜 DigiSafe인가요?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 카드 1: 암호화 */}
              <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">완벽한 프라이버시</h3>
                <p className="text-gray-600">
                  모든 데이터는 사용자 기기에서 암호화되어 누구도 내용을 볼 수 없습니다.
                </p>
              </div>

              {/* 카드 2: 제3자 접근 */}
              <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">제3자 접근 관리</h3>
                <p className="text-gray-600">
                  위급 상황 발생 시 지정한 신뢰할 수 있는 사람에게 정보를 안전하게 전달합니다.
                </p>
              </div>

              {/* 카드 3: 환급 정책 */}
              <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">안심 환급 정책</h3>
                <p className="text-gray-600">
                  이용하지 않으면 50% 환급. 위급 상황 없이 안전하게 지내시길 바랍니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 서비스 가치 섹션 */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900">하이브리드 가치 제공</h2>
                <p className="text-gray-600 mb-6">
                  DigiSafe는 일상적인 디지털 저장소와 위급 상황을 대비한 안전망을 결합합니다. 
                  우리의 미션은 고객의 소중한 디지털 자산을 보호하는 동시에, 
                  필요할 때 접근할 수 있는 안전한 경로를 제공하는 것입니다.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 mt-1 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">엔드-투-엔드 암호화로 데이터 보호</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 mt-1 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">위급 상황 조건 맞춤 설정</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 mt-1 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">사용하지 않으면 50% 환급</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-[500px] bg-white rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-secondary-100/50"></div>
                <Image
                  src="/service-intro.jpg"
                  alt="DigiSafe 서비스 소개"
                  fill
                  className="object-cover object-bottom"
                  quality={90}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}