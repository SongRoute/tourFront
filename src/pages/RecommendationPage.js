import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RecommendationCard from '../components/RecommendationCard';
import './RecommendationPage.css';

const RecommendationPage = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 추천 데이터 가져오기
    const savedRecommendations = localStorage.getItem('recommendations');
    if (savedRecommendations) {
      try {
        const data = JSON.parse(savedRecommendations);
        setRecommendations(data);
      } catch (error) {
        console.error('추천 데이터 파싱 오류:', error);
      }
    }
    
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const goHome = () => {
    navigate('/');
  };

  const goBack = () => {
    navigate('/chatbot');
  };

  if (loading) {
    return (
      <div className="recommendation-wrapper">
        <div className="recommendation-container">
          <Header />
          <div className="loading-screen">
            <div className="loading-animation">
              <div className="loading-spinner-large"></div>
              <h2>맞춤 추천을 생성하고 있어요</h2>
              <p>잠시만 기다려주세요...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations || !recommendations.places) {
    return (
      <div className="recommendation-wrapper">
        <div className="recommendation-container">
          <Header />
          <div className="error-screen">
            <div className="error-icon">❌</div>
            <h2>추천 결과를 불러올 수 없어요</h2>
            <p>다시 시도해주세요.</p>
            <button className="retry-button" onClick={goHome}>
              처음으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-wrapper">
      <div className="recommendation-container">
        <Header />

        {/* Success Message */}
        <div className="success-message">
          <div className="success-icon">🎉</div>
          <h2>당신을 위한 특별한 여행지를 찾았어요!</h2>
          <p>AI가 분석한 맞춤 추천 결과입니다</p>
        </div>

        {/* Recommendations List */}
        <div className="recommendations-list">
          {recommendations.places.map((place, index) => (
            <RecommendationCard 
              key={place.id} 
              place={place} 
              index={index} 
            />
          ))}
        </div>



        {/* Action Buttons */}
        <div className="bottom-actions">
          <button className="new-recommendation-button" onClick={() => navigate('/chatbot')}>
            다른 추천 받기
          </button>
          <button className="home-button-large" onClick={goHome}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationPage;
