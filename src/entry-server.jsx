import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import { SiteRoutes } from './site/SiteRoutes.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
export { PUBLIC_ROUTES } from './site/routes.js';

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <AuthProvider>
        <SiteRoutes />
      </AuthProvider>
    </StaticRouter>
  );
}
