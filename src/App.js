import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatbotPage from './pages/ChatbotPage';
import RecommendationPage from './pages/RecommendationPage';
import PlaceDetailPage from './pages/PlaceDetailPage';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/recommendations" element={<RecommendationPage />} />
          <Route path="/place/:id" element={<PlaceDetailPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
