import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ 
  title, 
  showBackButton = true, 
  showHomeButton = true, 
  showLocationInfo = false,
  locationData = null,
  onLocationRefresh = null,
  customLeftButton = null,
  customRightButton = null 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 페이지별 기본 설정
  const getPageConfig = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return {
        title: '여행 추천',
        showBackButton: false,
        showHomeButton: false,
        showLocationInfo: true
      };
    } else if (path === '/chatbot') {
      return {
        title: '맞춤 추천',
        showBackButton: true,
        showHomeButton: true,
        showLocationInfo: false
      };
    } else if (path === '/recommendations') {
      return {
        title: '추천 결과',
        showBackButton: true,
        showHomeButton: true,
        showLocationInfo: false
      };
    } else if (path.startsWith('/place/')) {
      return {
        title: '상세 정보',
        showBackButton: true,
        showHomeButton: true,
        showLocationInfo: false
      };
    }
    
    return {
      title: '여행 추천',
      showBackButton: false,
      showHomeButton: false,
      showLocationInfo: false
    };
  };

  const pageConfig = getPageConfig();
  
  // Props로 전달된 값이 있으면 사용, 없으면 페이지 기본값 사용
  const finalTitle = title || pageConfig.title;
  const finalShowBackButton = showBackButton !== undefined ? showBackButton : pageConfig.showBackButton;
  const finalShowHomeButton = showHomeButton !== undefined ? showHomeButton : pageConfig.showHomeButton;
  const finalShowLocationInfo = showLocationInfo !== undefined ? showLocationInfo : pageConfig.showLocationInfo;

  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const renderLeftButton = () => {
    if (customLeftButton) {
      return customLeftButton;
    }
    
    if (finalShowBackButton) {
      return (
        <button 
          className="header-button back-button" 
          onClick={handleBackClick}
          aria-label="뒤로가기"
        >
          <span className="button-icon">←</span>
        </button>
      );
    }
    
    return <div className="header-spacer" />;
  };

  const renderRightButton = () => {
    if (customRightButton) {
      return customRightButton;
    }
    
    if (finalShowLocationInfo && locationData) {
      return (
        <div className="location-container">
          <div className="location-info">
            <button 
              className={`location-icon ${locationData.loading ? 'loading' : ''}`}
              onClick={onLocationRefresh}
              disabled={locationData.loading}
              aria-label="현재 위치 새로고침"
              title={locationData.loading ? '위치 정보를 가져오는 중...' : '클릭하여 위치 새로고침'}
            />
            <div className="location-text">
              {locationData.loading ? '위치 확인 중...' : locationData.error ? '위치 정보 없음' : locationData.city}
            </div>
          </div>
          {locationData.error && (
            <div className="location-error" title={locationData.error}>
              ⚠️
            </div>
          )}
        </div>
      );
    }
    
    if (finalShowHomeButton) {
      return (
        <button 
          className="header-button home-button" 
          onClick={handleHomeClick}
          aria-label="홈으로"
        >
          <span className="button-icon">🏠</span>
        </button>
      );
    }
    
    return <div className="header-spacer" />;
  };

  return (
    <header className="app-header">
      <div className="header-content">
        {renderLeftButton()}
        
        <div className="header-title-section">
          <h1 className="header-title">{finalTitle}</h1>
          {location.pathname !== '/' && (
            <div className="breadcrumb">
              {location.pathname === '/chatbot' && '질문 답변'}
              {location.pathname === '/recommendations' && '맞춤 추천 완료'}
              {location.pathname.startsWith('/place/') && '관광지 정보'}
            </div>
          )}
        </div>
        
        {renderRightButton()}
      </div>
      
      {/* Progress indicator for chatbot page */}
      {location.pathname === '/chatbot' && (
        <div className="header-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '60%' }} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
