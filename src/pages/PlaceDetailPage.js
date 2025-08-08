import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ApiService from '../services/api';
import './PlaceDetailPage.css';

const PlaceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadPlaceDetails();
    checkBookmarkStatus();
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

  const handleReviewSubmit = async () => {
    try {
      await ApiService.sendFeedback(id, userReview.rating, userReview.comment);
      setShowReviewForm(false);
      setUserReview({ rating: 5, comment: '' });
      // 리뷰 제출 후 상세 정보 다시 로드
      loadPlaceDetails();
    } catch (error) {
      console.error('리뷰 제출 오류:', error);
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
          <div className="main-image">
            <img 
              src={mockImages[activeImageIndex]} 
              alt={place.name}
              className="place-image"
            />
            <button 
              className={`bookmark-floating ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={toggleBookmark}
              aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
            >
              {isBookmarked ? '❤️' : '🤍'}
            </button>
          </div>
          
          <div className="image-thumbnails">
            {mockImages.map((img, index) => (
              <button
                key={index}
                className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img src={img} alt={`${place.name} ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Place Info */}
        <div className="place-info">
          <div className="place-header">
            <h2 className="place-name">{place.name}</h2>
            <div className="rating-section">
              <span className="rating-stars">
                {'⭐'.repeat(Math.floor(place.rating))}
              </span>
              <span className="rating-value">{place.rating}</span>
              <span className="rating-count">({place.reviewCount || 127}개 리뷰)</span>
            </div>
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

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h3>리뷰</h3>
            <button 
              className="write-review-button"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? '취소' : '리뷰 작성'}
            </button>
          </div>

          {showReviewForm && (
            <div className="review-form">
              <div className="rating-input">
                <label>평점:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`star ${star <= userReview.rating ? 'active' : ''}`}
                      onClick={() => setUserReview(prev => ({...prev, rating: star}))}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              
              <textarea
                className="review-textarea"
                placeholder="이곳에 대한 솔직한 후기를 남겨주세요..."
                value={userReview.comment}
                onChange={(e) => setUserReview(prev => ({...prev, comment: e.target.value}))}
                rows={4}
              />
              
              <button 
                className="submit-review-button"
                onClick={handleReviewSubmit}
                disabled={!userReview.comment.trim()}
              >
                리뷰 등록
              </button>
            </div>
          )}

          {/* Sample Reviews */}
          <div className="reviews-list">
            <div className="review-item">
              <div className="reviewer-info">
                <div className="reviewer-avatar">👤</div>
                <div className="reviewer-details">
                  <span className="reviewer-name">김여행</span>
                  <div className="review-rating">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="review-text">정말 아름다운 곳이에요! 사진으로만 보던 것보다 훨씬 웅장하고 감동적이었습니다.</p>
              <span className="review-date">2024.01.15</span>
            </div>

            <div className="review-item">
              <div className="reviewer-info">
                <div className="reviewer-avatar">👤</div>
                <div className="reviewer-details">
                  <span className="reviewer-name">박관광</span>
                  <div className="review-rating">⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="review-text">가족과 함께 방문했는데 모든 연령대가 즐길 수 있는 좋은 장소였어요.</p>
              <span className="review-date">2024.01.10</span>
            </div>
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
