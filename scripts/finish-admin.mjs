import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminPath = (process.env.VITE_ADMIN_PATH || '').replace(/^\/+|\/+$/g, '');
const htpasswdPath = process.env.ADMIN_HTPASSWD_PATH;

if (!adminPath) throw new Error('VITE_ADMIN_PATH is required');
if (!htpasswdPath) throw new Error('ADMIN_HTPASSWD_PATH is required');

const htaccessPath = path.join(rootDir, 'dist', adminPath, '.htaccess');
const content = fs.readFileSync(htaccessPath, 'utf8');
fs.writeFileSync(htaccessPath, content.replaceAll('__ADMIN_HTPASSWD_PATH__', htpasswdPath));
