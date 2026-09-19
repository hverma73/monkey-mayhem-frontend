import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './index.css';

const rootEl = document.getElementById('root');
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

if (rootEl && rootEl.childNodes.length > 0) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}
