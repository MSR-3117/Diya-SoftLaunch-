import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BrandProvider } from './context/BrandContext';
import Home from './components/Home';
import BrandIntake from './components/BrandIntake';
import AnalysisLoader from './components/AnalysisLoader';
import BrandPersona from './components/BrandPersona';
import ContentDirection from './components/ContentDirection';
import MorphLoader from './components/ui/MorphLoader';
import BrandCalendarPage from './components/BrandCalendarPage';
import './index.css';

function App() {
  return (
    <BrandProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/brand-intake" element={<BrandIntake />} />
          <Route path="/brand-analysis" element={<AnalysisLoader />} />
          <Route path="/brand-persona" element={<BrandPersona />} />
          <Route path="/content-direction" element={<ContentDirection />} />
          <Route path="/generating-plan" element={<MorphLoader />} />
          <Route path="/brand-calendar" element={<BrandCalendarPage />} />
        </Routes>
      </Router>
    </BrandProvider>
  );
}

export default App;
