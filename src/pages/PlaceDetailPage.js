import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RecommendationCard from '../components/RecommendationCard';
import ApiService from '../services/api';
import './PlaceDetailPage.css';

const PlaceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [crowdInfo, setCrowdInfo] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState(null);

  useEffect(() => {
    loadPlaceDetails();
    checkBookmarkStatus();
    loadNearbyPlaces();
    initializeInfo();
  }, [id]);

  const loadPlaceDetails = async () => {
    try {
      console.log('PlaceDetailPage 로딩 시작, id:', id);
      setLoading(true);
      const placeData = await ApiService.getPlaceDetails(id);
      console.log('PlaceDetailPage 데이터 로딩 완료:', placeData);
      setPlace(placeData);
    } catch (error) {
      console.error('상세 정보 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(parseInt(id)));
  };

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const placeId = parseInt(id);
    
    if (isBookmarked) {
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark !== placeId);
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      setIsBookmarked(false);
    } else {
      bookmarks.push(placeId);
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const loadNearbyPlaces = () => {
    // 현재 관광지와 다른 카테고리의 인근 관광지를 모의 데이터로 생성
    const mockNearbyPlaces = [
      {
        id: parseInt(id) + 100,
        name: "인근 추천 관광지 1",
        description: "현재 위치에서 가까운 거리에 있는 아름다운 관광명소입니다.",
        image: "https://picsum.photos/300/200?random=1",
        rating: 4.5,
        category: "nature"
      },
      {
        id: parseInt(id) + 101,
        name: "인근 추천 관광지 2", 
        description: "역사적 가치가 높은 문화유산으로 꼭 방문해볼 만한 곳입니다.",
        image: "https://picsum.photos/300/200?random=2",
        rating: 4.3,
        category: "culture"
      },
      {
        id: parseInt(id) + 102,
        name: "인근 추천 관광지 3",
        description: "현지인들이 사랑하는 숨은 명소로 특별한 경험을 선사합니다.",
        image: "https://picsum.photos/300/200?random=3", 
        rating: 4.7,
        category: "urban"
      }
    ];
    
    setNearbyPlaces(mockNearbyPlaces);
  };

  // 혼잡도와 날씨 정보 초기화 (페이지당 한 번만)
  const initializeInfo = () => {
    // 혼잡도 더미 데이터 생성
    const levels = ['low', 'medium', 'high'];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const newCrowdInfo = {
      level: randomLevel,
      color: randomLevel === 'low' ? '#22c55e' : randomLevel === 'medium' ? '#eab308' : '#ef4444',
      text: randomLevel === 'low' ? '원활' : randomLevel === 'medium' ? '보통' : '혼잡'
    };

    // 날씨 더미 데이터 생성
    const weathers = [
      { condition: 'sunny', icon: '☀️', text: '맑음' },
      { condition: 'cloudy', icon: '☁️', text: '흐림' },
      { condition: 'rainy', icon: '🌧️', text: '비' },
      { condition: 'partly-cloudy', icon: '⛅', text: '구름조금' }
    ];
    const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
    const temperature = Math.floor(Math.random() * 30) + 5; // 5-35도
    
    const newWeatherInfo = {
      ...randomWeather,
      temperature
    };

    setCrowdInfo(newCrowdInfo);
    setWeatherInfo(newWeatherInfo);
  };

  // 이미지 슬라이더 스크롤 핸들러
  const handleSliderScroll = () => {
    if (sliderRef.current) {
      const scrollLeft = sliderRef.current.scrollLeft;
      const slideWidth = sliderRef.current.offsetWidth;
      const newActiveSlide = Math.round(scrollLeft / slideWidth);
      setActiveImageIndex(newActiveSlide);
    }
  };

  // 특정 이미지로 스크롤
  const scrollToImage = (index) => {
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
      setActiveImageIndex(index);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="place-detail-wrapper">
        <div className="place-detail-container">
          <Header />
          <div className="loading-screen">
            <div className="loading-spinner-large"></div>
            <p>상세 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="place-detail-wrapper">
        <div className="place-detail-container">
          <Header />
          <div className="error-screen">
            <div className="error-icon">❌</div>
            <h2>정보를 찾을 수 없습니다</h2>
            <button className="back-button-large" onClick={goBack}>
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mockImages = [
    place.image,
    place.image?.replace('300x200', '300x200/2'),
    place.image?.replace('300x200', '300x200/3'),
    place.image?.replace('300x200', '300x200/4')
  ];

  return (
    <div className="place-detail-wrapper">
      <div className="place-detail-container">
        <Header 
          title={place.name}
        />

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="image-slider-container">
            <div 
              className="image-slider"
              ref={sliderRef}
              onScroll={handleSliderScroll}
            >
              {mockImages.map((img, index) => (
                <div key={index} className="image-slide">
                  <img 
                    src={img} 
                    alt={`${place.name} ${index + 1}`}
                    className="place-image"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  
                  {/* Info Icons - only show on first image */}
                  {index === activeImageIndex && crowdInfo && weatherInfo && (
                    <div className="info-icons">
                      {/* Crowd Level */}
                      <div className="info-icon crowd-info">
                        <div className="icon-container">
                          <div 
                            className="crowd-indicator"
                            style={{ backgroundColor: crowdInfo.color }}
                          >
                            👤
                          </div>
                          <span className="info-text">{crowdInfo.text}</span>
                        </div>
                      </div>
                      
                      {/* Weather Info */}
                      <div className="info-icon weather-info">
                        <div className="icon-container">
                          <div className="weather-icon">
                            {weatherInfo.icon}
                          </div>
                          <span className="info-text">{weatherInfo.temperature}°C</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Pagination dots */}
            <div className="image-pagination">
              {mockImages.map((_, index) => (
                <div 
                  key={index}
                  className={`pagination-dot ${index === activeImageIndex ? 'active' : ''}`}
                  onClick={() => scrollToImage(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Place Info */}
        <div className="place-info">
          <div className="place-header">
            <h2 className="place-name">{place.name}</h2>
          </div>

          <p className="place-description">{place.description}</p>

          {/* Category Tags */}
          <div className="category-tags">
            <span className="category-tag primary">
              {place.category === 'culture' && '🏛️ 문화/역사'}
              {place.category === 'nature' && '🌿 자연/힐링'}
              {place.category === 'urban' && '🏙️ 도시/쇼핑'}
              {place.category === 'adventure' && '🏔️ 모험/액티비티'}
            </span>
            {place.tags?.map((tag, index) => (
              <span key={index} className="category-tag secondary">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Details Section */}
        <div className="details-section">
          <div className="detail-item">
            <div className="detail-icon">📍</div>
            <div className="detail-content">
              <h3>위치</h3>
              <p>{place.address || '서울특별시 중구'}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">💰</div>
            <div className="detail-content">
              <h3>입장료</h3>
              <p>{place.estimatedCost || '정보 준비중'}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">⏰</div>
            <div className="detail-content">
              <h3>소요시간</h3>
              <p>{place.duration || '2-3시간'}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">🕐</div>
            <div className="detail-content">
              <h3>운영시간</h3>
              <p>{place.openingHours || '09:00 - 18:00 (연중무휴)'}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">📞</div>
            <div className="detail-content">
              <h3>연락처</h3>
              <p>{place.contact || '02-1234-5678'}</p>
            </div>
          </div>
        </div>

        {/* Facilities */}
        {place.facilities && place.facilities.length > 0 && (
          <div className="facilities-section">
            <h3>편의시설</h3>
            <div className="facilities-list">
              {place.facilities.map((facility, index) => (
                <span key={index} className="facility-item">
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Places Section */}
        <div className="nearby-places-section">
          <div className="section-header">
            <h3>🗺️ 인근 추천 관광지</h3>
            <p className="section-subtitle">이곳과 함께 방문하면 좋은 관광지들</p>
          </div>

          <div className="nearby-places-list">
            {nearbyPlaces.map((place, index) => (
              <RecommendationCard 
                key={place.id} 
                place={place} 
                index={index} 
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-button primary" onClick={() => window.open(`https://map.google.com/search/${place.name}`, '_blank')}>
            🗺️ 길찾기
          </button>
          <button className="action-button secondary" onClick={() => navigator.share && navigator.share({title: place.name, text: place.description, url: window.location.href})}>
            📤 공유하기
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-navigation">
          <button className="nav-button" onClick={goBack}>
            ← 목록으로
          </button>
          <button className="nav-button primary" onClick={() => navigate('/chatbot')}>
            다른 추천 받기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailPage;
