import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecommendationCard.css';

const RecommendationCard = ({ place, index }) => {
  const navigate = useNavigate();

  const getBadgeText = (index) => {
    if (index === 0) return '🥇 최고 추천';
    if (index === 1) return '🥈 추천';
    return '🥉 추천';
  };

  // 거리, 날씨, 기온, 혼잡도 더미 데이터 생성
  const getLocationInfo = () => {
    const distance = Math.floor(Math.random() * 10) + 1; // 1-10km
    const weathers = ['맑음', '흐림', '비', '구름조금'];
    const weather = weathers[Math.floor(Math.random() * weathers.length)];
    const temperature = Math.floor(Math.random() * 30) + 5; // 5-35도
    const crowdLevels = ['원활', '보통', '혼잡'];
    const crowdLevel = crowdLevels[Math.floor(Math.random() * crowdLevels.length)];
    
    return `거리 ${distance}km | 날씨 ${weather} | 기온 ${temperature}도 | 혼잡도 ${crowdLevel}`;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'culture':
        return '🏛️ 문화/역사';
      case 'nature':
        return '🌿 자연/힐링';
      case 'urban':
        return '🏙️ 도시/쇼핑';
      case 'adventure':
        return '🏔️ 모험/액티비티';
      default:
        return '';
    }
  };

  const handleCardClick = () => {
    console.log('카드 클릭됨, place.id:', place.id);
    navigate(`/place/${place.id}`);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    console.log('북마크 클릭됨, place.id:', place.id);
    // 북마크 기능 구현
  };

  return (
    <div 
      className="recommendation-card-horizontal clickable" 
      style={{animationDelay: `${index * 0.1}s`}}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="card-content-horizontal">
        <div className="place-title">
          {place.name}
        </div>
        
        <div className="place-description-horizontal">
          {place.description}
        </div>
        
        <div className="place-info">
          {getLocationInfo()}
        </div>
      </div>
      
      <img 
        className="card-image-horizontal" 
        src={place.image} 
        alt={place.name} 
      />
    </div>
  );
};

export default RecommendationCard;
