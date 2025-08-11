import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ApiService from '../services/api';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const questions = [
    {
      id: 'travelType',
      question: '어떤 여행을 선호하시나요?',
      type: 'choice',
      options: [
        { value: 'adventure', label: '🏔️ 모험/액티비티', description: '등산, 수상스포츠, 익스트림 스포츠' },
        { value: 'culture', label: '🏛️ 문화/역사', description: '박물관, 유적지, 전통체험' },
        { value: 'nature', label: '🌿 자연/힐링', description: '국립공원, 해변, 온천' },
        { value: 'urban', label: '🏙️ 도시/쇼핑', description: '쇼핑몰, 카페, 도시 명소' }
      ]
    },
    {
      id: 'budget',
      question: '여행 예산은 어느 정도인가요?',
      type: 'choice',
      options: [
        { value: 'low', label: '💰 10만원 미만', description: '가성비 중심의 여행' },
        { value: 'medium', label: '💰💰 10-30만원', description: '적당한 예산의 여행' },
        { value: 'high', label: '💰💰💰 30만원 이상', description: '프리미엄 여행' }
      ]
    },
    {
      id: 'duration',
      question: '여행 기간은 얼마나 되나요?',
      type: 'choice',
      options: [
        { value: 'day', label: '🌅 당일치기', description: '하루 여행' },
        { value: 'weekend', label: '🏖️ 1박 이상', description: '주말 여행' }
      ]
    },
    {
      id: 'travelDate',
      question: '언제 여행을 떠나시나요?',
      type: 'calendar',
      placeholder: '여행 날짜를 선택해주세요'
    },
    {
      id: 'companion',
      question: '누구와 함께 여행하시나요?',
      type: 'choice',
      options: [
        { value: 'solo', label: '🚶 혼자', description: '나만의 시간' },
        { value: 'couple', label: '💑 연인/부부', description: '로맨틱한 여행' },
        { value: 'friends', label: '👥 친구들', description: '즐거운 단체 여행' },
        { value: 'family', label: '👨‍👩‍👧‍👦 가족', description: '가족과 함께' }
      ]
    }
  ];

  // 달력 관련 유틸리티 함수들
  const formatDate = (date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const isSameDate = (date1, date2) => {
    return date1 && date2 && 
           date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isDateInRange = (date, startDate, endDate) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 이전 달의 빈 날짜들
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    const duration = userAnswers.duration;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return; // 과거 날짜 선택 불가
    
    if (duration === 'day') {
      // 당일치기 - 시작일만 선택
      setSelectedDates({ startDate: date, endDate: null });
      const formattedDate = formatDate(date);
      handleAnswer('travelDate', formattedDate);
    } else {
      // 1박 이상 - 시작일과 종료일 선택
      if (!selectedDates.startDate || (selectedDates.startDate && selectedDates.endDate)) {
        // 시작일 선택
        setSelectedDates({ startDate: date, endDate: null });
      } else if (selectedDates.startDate && !selectedDates.endDate) {
        // 종료일 선택
        if (date >= selectedDates.startDate) {
          const endDate = date;
          setSelectedDates(prev => ({ ...prev, endDate }));
          const dateRange = `${formatDate(selectedDates.startDate)} ~ ${formatDate(endDate)}`;
          handleAnswer('travelDate', dateRange);
        } else {
          // 시작일보다 이른 날짜 선택 시 시작일을 다시 설정
          setSelectedDates({ startDate: date, endDate: null });
        }
      }
    }
  };

  // 컴포넌트 마운트 시 첫 번째 질문 추가
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([{
        type: 'bot',
        content: questions[0].question,
        timestamp: new Date(),
        questionId: questions[0].id,
        questionType: questions[0].type,
        options: questions[0].options || null
      }]);
    }
  }, []);

  // 채팅 하단으로 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAnswer = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // 현재 질문의 정보 가져오기
    const currentQuestion = questions[currentStep];
    let userDisplayText = answer;

    // 선택형 질문인 경우 선택한 옵션의 라벨 사용
    if (currentQuestion.type === 'choice') {
      const selectedOption = currentQuestion.options.find(opt => opt.value === answer);
      userDisplayText = selectedOption ? selectedOption.label : answer;
    }

    // 사용자 답변을 채팅 기록에 추가
    setChatHistory(prev => [...prev, {
      type: 'user',
      content: userDisplayText,
      timestamp: new Date(),
      questionId: questionId,
      value: answer
    }]);

    // 다음 질문이 있으면 추가
    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        const nextStep = currentStep + 1;
        const nextQuestion = questions[nextStep];
        
        setChatHistory(prev => [...prev, {
          type: 'bot',
          content: nextQuestion.question,
          timestamp: new Date(),
          questionId: nextQuestion.id,
          questionType: nextQuestion.type,
          options: nextQuestion.options || null
        }]);
        
        setCurrentStep(nextStep);
      }, 500);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // API 서비스를 통해 추천 요청
      const userLocation = localStorage.getItem('userLocation') || '서울';
      const recommendations = await ApiService.getRecommendations(userAnswers, userLocation);
      
      // 추천 결과를 localStorage에 저장하고 결과 페이지로 이동
      localStorage.setItem('recommendations', JSON.stringify(recommendations));
      navigate('/recommendations');
    } catch (error) {
      console.error('추천 요청 오류:', error);
      // 에러 발생 시에도 기본 추천 데이터로 진행
      navigate('/recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      // 이전 단계로 돌아가기
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // 현재 단계의 답변 제거
      const currentQuestion = questions[currentStep];
      setUserAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestion.id];
        return newAnswers;
      });
      
      // 채팅 기록에서 현재 질문과 사용자 답변 제거
      setChatHistory(prev => {
        const newHistory = [...prev];
        // 마지막 봇 메시지(현재 질문) 제거
        if (newHistory.length > 0 && newHistory[newHistory.length - 1].type === 'bot') {
          newHistory.pop();
        }
        // 마지막 사용자 답변 제거 (있다면)
        if (newHistory.length > 0 && newHistory[newHistory.length - 1].type === 'user') {
          newHistory.pop();
        }
        return newHistory;
      });
    } else {
      navigate('/');
    }
  };

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const canProceed = userAnswers[currentQuestion?.id];

  return (
    <div className="chatbot-wrapper">
      <div className="chatbot-container">
        <Header 
          customRightButton={
            <div className="progress-indicator">
              {currentStep + 1}/{questions.length}
            </div>
          }
        />
        


        {/* Chat Content */}
        <div className="chat-content">
          {/* Chat History */}
          <div className="chat-messages">
            {chatHistory.map((message, index) => (
              <div key={index} className={`message ${message.type === 'bot' ? 'bot-message' : 'user-message'}`}>
                {message.type === 'bot' ? (
                  <>
                    <div className="bot-avatar">🤖</div>
                    <div className="message-bubble bot-bubble">
                      <p>{message.content}</p>
                      {message.questionType === 'choice' && message.options && (
                        <div className="bot-options">
                          {message.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex} 
                              className={`bot-option-item ${
                                userAnswers[message.questionId] === option.value ? 'selected' : ''
                              } ${
                                message.questionId === currentQuestion?.id && !userAnswers[message.questionId] ? 'clickable' : 'disabled'
                              }`}
                              onClick={() => {
                                if (message.questionId === currentQuestion?.id && !userAnswers[message.questionId]) {
                                  handleAnswer(message.questionId, option.value);
                                }
                              }}
                            >
                              <span className="option-emoji">{option.label.split(' ')[0]}</span>
                              <div className="option-text">
                                <span className="option-title">{option.label.substring(option.label.indexOf(' ') + 1)}</span>
                                <span className="option-desc">{option.description}</span>
                              </div>
                              {userAnswers[message.questionId] === option.value && (
                                <span className="option-check">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {message.questionType === 'text' && message.questionId === currentQuestion?.id && !userAnswers[message.questionId] && (
                        <div className="bot-text-input-section">
                          <textarea
                            className="bot-text-input"
                            placeholder={questions.find(q => q.id === message.questionId)?.placeholder}
                            value={userAnswers[message.questionId] || ''}
                            onChange={(e) => {
                              setUserAnswers(prev => ({
                                ...prev,
                                [message.questionId]: e.target.value
                              }));
                            }}
                            rows={3}
                          />
                          <button
                            className="bot-text-submit"
                            onClick={() => {
                              if (userAnswers[message.questionId]?.trim()) {
                                handleAnswer(message.questionId, userAnswers[message.questionId]);
                              }
                            }}
                            disabled={!userAnswers[message.questionId]?.trim()}
                          >
                            전송
                          </button>
                        </div>
                      )}
                      {message.questionType === 'text' && userAnswers[message.questionId] && (
                        <div className="bot-text-completed">
                          <span className="text-completed-icon">✓</span>
                          <span className="text-completed-text">답변 완료</span>
                        </div>
                      )}
                      {message.questionType === 'calendar' && message.questionId === currentQuestion?.id && !userAnswers[message.questionId] && (
                        <div className="bot-calendar-section">
                          <div className="calendar-header">
                            <button 
                              className="calendar-nav-button"
                              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            >
                              ‹
                            </button>
                            <div className="calendar-month-year">
                              {currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                            </div>
                            <button 
                              className="calendar-nav-button"
                              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            >
                              ›
                            </button>
                          </div>
                          <div className="calendar-info">
                            {userAnswers.duration === 'day' ? (
                              <span className="calendar-instruction">📅 출발 날짜를 선택해주세요</span>
                            ) : (
                              <span className="calendar-instruction">
                                📅 {selectedDates.startDate ? '종료 날짜를 선택해주세요' : '시작 날짜를 선택해주세요'}
                              </span>
                            )}
                          </div>
                          <div className="calendar-weekdays">
                            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                              <div key={day} className="calendar-weekday">{day}</div>
                            ))}
                          </div>
                          <div className="calendar-days">
                            {getDaysInMonth(currentMonth).map((date, index) => {
                              if (!date) return <div key={index} className="calendar-day empty"></div>;
                              
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const isPast = date < today;
                              const isSelected = isSameDate(date, selectedDates.startDate) || isSameDate(date, selectedDates.endDate);
                              const isInRange = isDateInRange(date, selectedDates.startDate, selectedDates.endDate);
                              const isToday = isSameDate(date, today);
                              
                              return (
                                <div
                                  key={index}
                                  className={`calendar-day ${isPast ? 'past' : 'available'} ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''} ${isToday ? 'today' : ''}`}
                                  onClick={() => !isPast && handleDateSelect(date)}
                                >
                                  {date.getDate()}
                                </div>
                              );
                            })}
                          </div>
                          {selectedDates.startDate && userAnswers.duration !== 'day' && (
                            <div className="calendar-selected-info">
                              시작일: {formatDate(selectedDates.startDate)}
                              {selectedDates.endDate && (
                                <span> → 종료일: {formatDate(selectedDates.endDate)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {message.questionType === 'calendar' && userAnswers[message.questionId] && (
                        <div className="bot-calendar-completed">
                          <span className="calendar-completed-icon">📅</span>
                          <span className="calendar-completed-text">일정 선택 완료</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="message-bubble user-bubble">
                      <p>{message.content}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>



          <div ref={chatEndRef} />
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {isLastQuestion && canProceed && (
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  추천 받는 중...
                </>
              ) : (
                '맞춤 추천 받기'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
