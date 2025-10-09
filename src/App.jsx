import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BuilderScreen from './screens/Builder.screen';
import BlochSphereScreen from './screens/BlochSphere.screen';
import 'katex/dist/katex.min.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/builder" replace />} />
        <Route path="/builder" element={<BuilderScreen />} />
        <Route path="/sphere" element={<BlochSphereScreen />} />
      </Routes>
    </Router>
  );
}