import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

export function renderApp(location) {
  return renderToString(
    <React.StrictMode>
      <StaticRouter location={location}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StaticRouter>
    </React.StrictMode>
  );
}
