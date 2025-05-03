import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* 히어로 섹션 */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-gray-900">DigiSafe 소개</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              소중한 디지털 자산을 안전하게 보호하고, 위급 상황에 대비하는 서비스
            </p>
          </div>
        </section>

        {/* 회사/서비스 소개 섹션 */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">미션과 비전</h2>
                <div className="space-y-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">미션</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      사용자의 소중한 디지털 자산을 안전하게 보호하고, 위급 상황에서만 신뢰할 수 있는 사람이 접근할 수 있도록 하는 것
                    </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">비전</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      디지털 자산 보호의 새로운 기준을 만들어, 모든 사람이 안심하고 디지털 정보를 관리할 수 있는 세상을 만드는 것
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">서비스 배경</h2>
                <div className="space-y-6">
                  <p className="text-gray-600 leading-relaxed">
                    현대 사회에서 디지털 자산의 중요성이 증가함에 따라, 이를 안전하게 보호하고 위급 상황에서 접근할 수 있도록 하는 서비스의 필요성이 대두되었습니다.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    DigiSafe는 이러한 필요성에 부응하여, 최고 수준의 보안과 편리한 접근성을 제공하는 서비스를 만들었습니다.
                  </p>
                  <div className="bg-yellow-50 p-6 rounded-lg mt-8">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">핵심 가치</h3>
                    </div>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-yellow-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>사용자 프라이버시 최우선</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-yellow-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>투명한 서비스 운영</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-yellow-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>지속적인 혁신과 개선</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 핵심 기술 및 보안 섹션 */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">핵심 기술과 보안</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                최고 수준의 보안 기술로 데이터를 보호합니다
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">엔드-투-엔드 암호화</h3>
                <p className="text-gray-600">
                  모든 데이터는 사용자의 기기에서 암호화되어 서버로 전송됩니다.
                  당사를 포함한 누구도 원본 데이터에 접근할 수 없습니다.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">AWS 보안 인프라</h3>
                <p className="text-gray-600">
                  AWS의 엔터프라이즈급 보안 인프라를 활용하여
                  데이터의 안전성을 최대한 보장합니다.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">제3자 접근 관리</h3>
                <p className="text-gray-600">
                  사용자가 지정한 조건이 충족될 때만
                  신뢰할 수 있는 제3자가 데이터에 접근할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 서비스 차별화 섹션 */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">다른 클라우드 스토리지와의 차이점</h2>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>엔드-투-엔드 암호화로 최고 수준의 보안 제공</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>제3자 접근 관리 기능으로 위급 상황에 대비</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>사용하지 않으면 50% 환불되는 투명한 요금제</span>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">환불 정책</h2>
                <p className="text-gray-600 mb-4">
                  DigiSafe는 사용자가 서비스를 사용하지 않은 경우(제3자 접근이 발생하지 않은 경우)
                  요금의 50%를 환불해 드립니다.
                </p>
                <p className="text-gray-600">
                  이는 사용자가 위급 상황에 대비하는 서비스의 특성을 고려한 것으로,
                  사용자가 안전하게 지내시길 바라는 마음에서 시작된 정책입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 사용 사례 섹션 */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">사용 사례</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                다양한 상황에서 DigiSafe를 활용할 수 있습니다
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">개인 사용자</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>중요 문서 보관</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>디지털 유산 관리</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>비상 연락처 정보 공유</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">비즈니스 사용자</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>중요 비즈니스 문서 보관</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>비상 시 계승자 지정</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>중요 계정 정보 관리</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">지금 DigiSafe를 시작하세요</h2>
            <p className="text-lg text-gray-600 mb-8">
              소중한 디지털 자산을 안전하게 보호하고, 위급 상황에 대비하세요.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              지금 시작하기
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
} 