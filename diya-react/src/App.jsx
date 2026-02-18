import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import BrandIntake from './components/BrandIntake';
import AnalysisLoader from './components/AnalysisLoader';
import BrandPersona from './components/BrandPersona';
import ContentDirection from './components/ContentDirection';
import MorphLoader from './components/ui/MorphLoader';
import BrandCalendarPage from './components/BrandCalendarPage';
import BrandBuilder from './components/BrandBuilder';
import GalleryPreviewPage from './components/GalleryPreviewPage';
import ConnectSocialsPage from './components/ConnectSocialsPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/brand-intake" element={<BrandIntake />} />
        <Route path="/brand-analysis" element={<AnalysisLoader />} />
        <Route path="/brand-persona" element={<BrandPersona />} />
        <Route path="/content-direction" element={<ContentDirection />} />
        <Route path="/generating-plan" element={<MorphLoader />} />
        <Route path="/gallery-preview" element={<GalleryPreviewPage />} />
        <Route path="/connect-socials" element={<ConnectSocialsPage />} />
        <Route path="/brand-builder" element={<BrandBuilder />} />
        <Route path="/brand-calendar" element={<BrandCalendarPage />} />
      </Routes>
    </Router>
  );
}

export default App;
