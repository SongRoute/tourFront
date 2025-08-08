
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [location, setLocation] = useState({
    city: 'Ikeja, Lagos',
    loading: false,
    error: null
  });
  const [activeSlide, setActiveSlide] = useState(0);

  // 핫한 관광지 데이터
  const hotSpots = [
    {
      id: 1,
      name: '경복궁',
      location: '서울 종로구',
      description: '조선왕조의 정궁으로 한국의 전통 문화를 체험할 수 있는 대표적인 궁궐',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
      badge: 'HOT',
      rating: '4.6',
      visitors: '1.2만+'
    },
    {
      id: 2,
      name: '부산 해운대',
      location: '부산 해운대구',
      description: '국내 최고의 해수욕장으로 아름다운 해변과 다양한 액티비티를 즐길 수 있는 곳',
      image: 'https://images.unsplash.com/photo-1578470509703-aa6a2b00d6b1?w=400&h=300&fit=crop&crop=center',
      badge: 'TRENDING',
      rating: '4.5',
      visitors: '8.7만+'
    },
    {
      id: 3,
      name: '제주 성산일출봉',
      location: '제주 서귀포시',
      description: '유네스코 세계자연유산으로 지정된 아름다운 일출 명소',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
      badge: 'POPULAR',
      rating: '4.7',
      visitors: '5.3만+'
    },
    {
      id: 4,
      name: '강릉 정동진',
      location: '강원 강릉시',
      description: '바다와 기차역이 만나는 낭만적인 해변, 일출 감상의 명소',
      image: 'https://images.unsplash.com/photo-1578470509703-aa6a2b00d6b1?w=400&h=300&fit=crop&crop=center',
      badge: 'RISING',
      rating: '4.4',
      visitors: '3.9만+'
    },
    {
      id: 5,
      name: '전주 한옥마을',
      location: '전북 전주시',
      description: '전통 한옥과 맛있는 전주 비빔밥을 경험할 수 있는 문화 관광지',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
      badge: 'NEW',
      rating: '4.3',
      visitors: '2.8만+'
    }
  ];

  // 역지오코딩 함수 (OpenStreetMap Nominatim API 사용)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=ko`
      );
      const data = await response.json();
      
      if (data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.county;
        const district = data.address.borough || data.address.district || data.address.suburb;
        const country = data.address.country;
        
        let locationName = '';
        if (district && city) {
          locationName = `${district}, ${city}`;
        } else if (city) {
          locationName = city;
        } else if (country) {
          locationName = country;
        } else {
          locationName = '위치 정보 없음';
        }
        
        return locationName;
      }
      return '위치 정보 없음';
    } catch (error) {
      console.error('역지오코딩 오류:', error);
      return '위치 정보 없음';
    }
  };

  // 현재 위치 가져오기 함수
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: '이 브라우저는 위치 서비스를 지원하지 않습니다.',
        loading: false
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const cityName = await reverseGeocode(latitude, longitude);
        
        setLocation({
          city: cityName,
          loading: false,
          error: null
        });
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 접근이 거부되었습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.';
            break;
          default:
            errorMessage = '알 수 없는 오류가 발생했습니다.';
            break;
        }
        
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분
      }
    );
  };

  // 컴포넌트 마운트 시 위치 정보 자동 요청
  // 슬라이더 스크롤 핸들러
  const handleSliderScroll = () => {
    if (sliderRef.current) {
      const scrollLeft = sliderRef.current.scrollLeft;
      const slideWidth = sliderRef.current.offsetWidth;
      const newActiveSlide = Math.round(scrollLeft / slideWidth);
      setActiveSlide(newActiveSlide);
    }
  };

  // 특정 슬라이드로 스크롤
  const scrollToSlide = (index) => {
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
      setActiveSlide(index);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="homepage-wrapper">
      <div className="homepage-container">
        <Header 
          showLocationInfo={true}
          locationData={location}
          onLocationRefresh={getCurrentLocation}
          customLeftButton={
            <img className="header-logo" src="https://placehold.co/35x35" alt="Logo" />
          }
        />

      {/* Hero Section - Hot Tourist Spots Slider */}
      <div className="hero-section">
        <div className="hero-header">
        </div>
        <div className="hero-slider-container">
          <div 
            className="hero-slider"
            ref={sliderRef}
            onScroll={handleSliderScroll}
          >
            {hotSpots.map((spot, index) => (
              <div key={spot.id} className="hero-slide">
                <div className="slide-image-container">
                  <img 
                    className="slide-image" 
                    src={spot.image} 
                    alt={spot.name}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <div className="slide-overlay">
                    <div className="slide-badge">{spot.badge}</div>
                    <div className="slide-title-overlay">{spot.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hero-pagination">
            {hotSpots.map((_, index) => (
              <div 
                key={index}
                className={`pagination-dot ${index === activeSlide ? 'active' : ''}`}
                onClick={() => scrollToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recommendation Button Section */}
      <div className="recommendation-button-section">
        <button 
          className="recommendation-button" 
          onClick={() => navigate('/chatbot')}
          aria-label="맞춤 추천받기"
        >
          <div className="recommendation-icon">🤖</div>
          <div className="recommendation-button-text">추천받기</div>
          <div className="recommendation-subtitle">AI가 맞춤 여행지를 추천해드려요</div>
        </button>
      </div>

      {/* First Recommendation Section */}
      <div className="recommendation-section">
        <div className="recommendation-header">
          <div className="recommendation-title">추천 문구 1</div>
        </div>
      </div>

      {/* First Cards Section */}
      <div className="cards-section">
        {[...Array(7)].map((_, index) => (
          <button key={`card1-${index}`} className="card" tabIndex="0" aria-label={`관광지 카드 ${index + 1}`}>
            <div className="card-content">
              <div className="card-top">
                <div className="card-icon-left">
                  <div className="card-icon" />
                </div>
                <div className="card-icon-right">
                  <div className="card-icon" />
                </div>
              </div>
              <div className="card-bottom">
                <div className="card-title">영금정</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Second Recommendation Section */}
      <div className="recommendation-section">
        <div className="recommendation-header">
          <div className="recommendation-title">추천 문구 1</div>
        </div>
      </div>

      {/* Second Cards Section */}
      <div className="cards-section">
        {[...Array(7)].map((_, index) => (
          <button key={`card2-${index}`} className="card" tabIndex="0" aria-label={`관광지 카드 ${index + 8}`}>
            <div className="card-content">
              <div className="card-top">
                <div className="card-icon-left">
                  <div className="card-icon" />
                </div>
                <div className="card-icon-right">
                  <div className="card-icon" />
                </div>
              </div>
              <div className="card-bottom">
                <div className="card-title">영금정</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      </div>
    </div>
  );
};

export default HomePage;
