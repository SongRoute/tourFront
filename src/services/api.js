// API 서비스 파일
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  // 추천 요청 API
  static async getRecommendations(userAnswers, location) {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          answers: userAnswers,
          location: location,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API 요청 오류:', error);
      
      // 개발 환경에서 사용할 목업 데이터
      return this.getMockRecommendations(userAnswers, location);
    }
  }

  // 목업 데이터 생성 함수 (백엔드 연결 전 테스트용)
  static getMockRecommendations(userAnswers, location) {
    const mockPlaces = [
      {
        id: 1,
        name: '경복궁',
        description: '조선 왕조의 대표 궁궐로, 한국의 전통 문화와 역사를 체험할 수 있는 곳입니다.',
        image: 'https://placehold.co/300x200/4a90e2/ffffff?text=경복궁',
        rating: 4.5,
        category: 'culture',
        tags: ['역사', '전통', '궁궐', '문화재'],
        address: '서울특별시 종로구 사직로 161',
        estimatedCost: '성인 3,000원',
        duration: '2-3시간'
      },
      {
        id: 2,
        name: '남산서울타워',
        description: '서울의 랜드마크로, 도시 전경을 한눈에 볼 수 있는 최고의 전망대입니다.',
        image: 'https://placehold.co/300x200/e74c3c/ffffff?text=남산타워',
        rating: 4.3,
        category: 'urban',
        tags: ['전망', '야경', '랜드마크', '데이트'],
        address: '서울특별시 용산구 남산공원길 105',
        estimatedCost: '성인 16,000원',
        duration: '2-4시간'
      },
      {
        id: 3,
        name: '한강공원',
        description: '도심 속 자연 휴식공간으로, 피크닉과 다양한 레저 활동을 즐길 수 있습니다.',
        image: 'https://placehold.co/300x200/27ae60/ffffff?text=한강공원',
        rating: 4.2,
        category: 'nature',
        tags: ['자연', '피크닉', '산책', '힐링'],
        address: '서울특별시 영등포구 여의동로 330',
        estimatedCost: '무료',
        duration: '1-4시간'
      },
      {
        id: 4,
        name: '북촌한옥마을',
        description: '전통 한옥이 잘 보존된 마을로, 한국의 전통 건축미를 감상할 수 있습니다.',
        image: 'https://placehold.co/300x200/f39c12/ffffff?text=북촌한옥마을',
        rating: 4.4,
        category: 'culture',
        tags: ['한옥', '전통', '사진', '문화'],
        address: '서울특별시 종로구 계동길 37',
        estimatedCost: '무료',
        duration: '1-2시간'
      },
      {
        id: 5,
        name: '롯데월드타워',
        description: '한국에서 가장 높은 건물로, 스카이데크에서 서울 전체를 조망할 수 있습니다.',
        image: 'https://placehold.co/300x200/9b59b6/ffffff?text=롯데월드타워',
        rating: 4.6,
        category: 'urban',
        tags: ['전망', '쇼핑', '현대적', '스릴'],
        address: '서울특별시 송파구 올림픽로 300',
        estimatedCost: '성인 29,000원',
        duration: '2-3시간'
      },
      {
        id: 6,
        name: '청계천',
        description: '도심을 가로지르는 복원된 하천으로, 도보 여행과 야간 산책에 좋습니다.',
        image: 'https://placehold.co/300x200/3498db/ffffff?text=청계천',
        rating: 4.0,
        category: 'nature',
        tags: ['산책', '도심', '야경', '힐링'],
        address: '서울특별시 중구 청계천로',
        estimatedCost: '무료',
        duration: '1-3시간'
      }
    ];

    // 사용자 답변에 따라 추천 로직 적용
    let filteredPlaces = [...mockPlaces];
    
    if (userAnswers.travelType) {
      filteredPlaces = filteredPlaces.filter(place => 
        place.category === userAnswers.travelType || 
        (userAnswers.travelType === 'adventure' && place.tags.includes('스릴'))
      );
    }

    // 예산에 따른 필터링
    if (userAnswers.budget === 'low') {
      filteredPlaces = filteredPlaces.filter(place => 
        place.estimatedCost.includes('무료') || 
        parseInt(place.estimatedCost.replace(/[^0-9]/g, '')) < 10000
      );
    }

    // 최대 3개의 추천 장소 반환
    const recommendations = filteredPlaces
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    // 추천이 부족하면 인기 장소로 채우기
    if (recommendations.length < 3) {
      const remaining = mockPlaces
        .filter(place => !recommendations.find(rec => rec.id === place.id))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3 - recommendations.length);
      
      recommendations.push(...remaining);
    }

    return {
      places: recommendations,
      userAnswers: userAnswers,
      location: location,
      generatedAt: new Date().toISOString(),
      message: '당신의 취향에 맞는 여행지를 찾았어요!'
    };
  }

  // 장소 상세 정보 조회
  static async getPlaceDetails(placeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/places/${placeId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('장소 상세 정보 조회 오류:', error);
      
      // 목업 데이터 반환 - 더 풍부한 정보 제공
      return this.getMockPlaceDetails(placeId);
    }
  }

  // 목업 상세 정보 생성
  static getMockPlaceDetails(placeId) {
    const mockPlaceDetails = {
      1: {
        id: 1,
        name: '경복궁',
        description: '조선 왕조의 대표 궁궐로, 1395년 태조 이성계가 조선 왕조를 개국한 후 세운 첫 번째 정궁입니다. 한국의 전통 문화와 역사를 체험할 수 있는 대표적인 관광지로, 근정전, 경회루, 향원정 등의 아름다운 건축물들을 감상할 수 있습니다.',
        image: 'https://placehold.co/300x200/4a90e2/ffffff?text=경복궁',
        rating: 4.5,
        reviewCount: 1247,
        category: 'culture',
        tags: ['역사', '전통', '궁궐', '문화재', '포토스팟'],
        address: '서울특별시 종로구 사직로 161',
        estimatedCost: '성인 3,000원, 청소년 1,500원, 어린이 무료',
        duration: '2-3시간',
        openingHours: '09:00 - 18:00 (3월~10월), 09:00 - 17:00 (11월~2월)',
        contact: '02-3700-3900',
        facilities: ['주차장', '화장실', '기념품샵', '카페', '가이드투어', '휠체어 접근'],
        nearbyPlaces: ['광화문광장', '북촌한옥마을', '인사동', '청와대']
      },
      2: {
        id: 2,
        name: '남산서울타워',
        description: '1969년 한국 최초의 종합 전파탑으로 건립된 서울의 대표적인 랜드마크입니다. 해발 479.7m 높이에서 서울 전체를 360도 파노라마로 조망할 수 있으며, 특히 야경이 아름다운 것으로 유명합니다.',
        image: 'https://placehold.co/300x200/e74c3c/ffffff?text=남산타워',
        rating: 4.3,
        reviewCount: 2156,
        category: 'urban',
        tags: ['전망', '야경', '랜드마크', '데이트', '케이블카'],
        address: '서울특별시 용산구 남산공원길 105',
        estimatedCost: '성인 16,000원, 청소년 12,000원, 어린이 8,000원',
        duration: '2-4시간',
        openingHours: '10:00 - 23:00 (연중무휴)',
        contact: '02-3455-9277',
        facilities: ['전망대', '레스토랑', '카페', '기념품샵', '포토존', '케이블카'],
        nearbyPlaces: ['명동', '남대문시장', '회현역', '남산공원']
      },
      3: {
        id: 3,
        name: '한강공원',
        description: '서울 시민들의 대표적인 휴식 공간으로, 한강을 따라 조성된 대규모 공원입니다. 피크닉, 자전거 타기, 수상스포츠 등 다양한 레저 활동을 즐길 수 있으며, 치킨과 맥주를 즐기는 한국 특유의 문화를 체험할 수 있습니다.',
        image: 'https://placehold.co/300x200/27ae60/ffffff?text=한강공원',
        rating: 4.2,
        reviewCount: 3421,
        category: 'nature',
        tags: ['자연', '피크닉', '산책', '힐링', '자전거', '치맥'],
        address: '서울특별시 영등포구 여의동로 330 (여의도 한강공원)',
        estimatedCost: '무료 (일부 시설 이용료 별도)',
        duration: '1-4시간',
        openingHours: '24시간 개방',
        contact: '02-3780-0561',
        facilities: ['자전거 대여', '피크닉장', '화장실', '편의점', '음수대', '운동시설'],
        nearbyPlaces: ['여의도', '63빌딩', '국회의사당', '선유도공원']
      },
      4: {
        id: 4,
        name: '북촌한옥마을',
        description: '조선시대 양반들이 거주했던 전통 한옥이 잘 보존된 마을로, 현재도 주민들이 실제 거주하고 있는 살아있는 문화유산입니다. 한국 전통 건축의 아름다움을 감상하고 전통 문화 체험을 할 수 있습니다.',
        image: 'https://placehold.co/300x200/f39c12/ffffff?text=북촌한옥마을',
        rating: 4.4,
        reviewCount: 892,
        category: 'culture',
        tags: ['한옥', '전통', '사진', '문화', '역사', '산책'],
        address: '서울특별시 종로구 계동길 37',
        estimatedCost: '무료 (체험 프로그램 별도)',
        duration: '1-2시간',
        openingHours: '24시간 개방 (체험관은 별도)',
        contact: '02-2133-1371',
        facilities: ['문화센터', '전통�찻집', '기념품샵', '한복체험', '포토존'],
        nearbyPlaces: ['창덕궁', '인사동', '삼청동', '경복궁']
      },
      5: {
        id: 5,
        name: '롯데월드타워',
        description: '높이 554.5m의 한국에서 가장 높은 건물로, 세계에서 5번째로 높은 마천루입니다. 117-123층에 위치한 서울스카이에서는 서울 전체를 조망할 수 있으며, 스릴 넘치는 스카이데크 체험도 가능합니다.',
        image: 'https://placehold.co/300x200/9b59b6/ffffff?text=롯데월드타워',
        rating: 4.6,
        reviewCount: 1876,
        category: 'urban',
        tags: ['전망', '쇼핑', '현대적', '스릴', '초고층'],
        address: '서울특별시 송파구 올림픽로 300',
        estimatedCost: '성인 29,000원, 청소년 25,000원, 어린이 23,000원',
        duration: '2-3시간',
        openingHours: '10:30 - 22:00 (입장마감 21:00)',
        contact: '1661-2000',
        facilities: ['전망대', '쇼핑몰', '레스토랑', '카페', '스카이데크', '주차장'],
        nearbyPlaces: ['잠실역', '롯데월드', '석촌호수', '올림픽공원']
      },
      6: {
        id: 6,
        name: '청계천',
        description: '서울 도심을 가로지르는 총 길이 10.9km의 복원된 하천으로, 2005년 복원 완료 후 서울의 대표적인 도심 휴식 공간이 되었습니다. 야간 조명이 아름다워 저녁 산책 코스로 인기가 높습니다.',
        image: 'https://placehold.co/300x200/3498db/ffffff?text=청계천',
        rating: 4.0,
        reviewCount: 1543,
        category: 'nature',
        tags: ['산책', '도심', '야경', '힐링', '문화행사'],
        address: '서울특별시 중구 청계천로',
        estimatedCost: '무료',
        duration: '1-3시간',
        openingHours: '24시간 개방',
        contact: '02-2290-6114',
        facilities: ['산책로', '벤치', '화장실', '조명', '문화공간', '분수'],
        nearbyPlaces: ['광화문', '동대문', '명동', '종로']
      }
    };

    return mockPlaceDetails[placeId] || {
      id: placeId,
      name: '정보 준비 중',
      description: '상세 정보를 준비하고 있습니다.',
      image: 'https://placehold.co/300x200/cccccc/ffffff?text=준비중',
      rating: 0,
      reviewCount: 0,
      category: 'other',
      tags: [],
      address: '정보 준비 중',
      estimatedCost: '정보 준비 중',
      duration: '정보 준비 중',
      openingHours: '정보 준비 중',
      contact: '정보 준비 중',
      facilities: [],
      nearbyPlaces: []
    };
  }

  // 사용자 피드백 전송
  static async sendFeedback(placeId, rating, comment) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeId: placeId,
          rating: rating,
          comment: comment,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('피드백 전송 오류:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ApiService;
