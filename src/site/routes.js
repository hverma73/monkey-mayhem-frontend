import { posts } from './siteData.js';

const articleRoutes = posts.map((post) => `/articles/${post.id}`);

export const PUBLIC_ROUTES = [
  '/',
  '/programs',
  '/batches',
  '/team',
  '/achievements',
  '/gallery',
  '/events',
  '/articles',
  ...articleRoutes,
  '/contact',
];
