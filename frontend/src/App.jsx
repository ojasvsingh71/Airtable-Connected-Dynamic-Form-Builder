import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './pages/OAuthCallback';
import FormBuilder from './pages/FormBuilder';
import FormViewer from './pages/FormViewer';
import Responses from './pages/Responses';
import FormsList from './pages/FormsList';
import ProtectedRoute from './components/ProtectedRoute';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/builder" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
      <Route path="/forms" element={<ProtectedRoute><FormsList /></ProtectedRoute>} />
      <Route path="/form/:formId" element={<FormViewer />} />
      <Route path="/forms/:formId/responses" element={<ProtectedRoute><Responses /></ProtectedRoute>} />
    </Routes>
  );
}