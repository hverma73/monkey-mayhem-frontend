import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import AdminApp from './AdminApp.jsx';
import '../src/index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <AdminApp />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
