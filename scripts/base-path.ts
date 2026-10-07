/** One explicit, path-only base for site-root and repository-subpath builds. */
export function normalizeBasePath(value: string): string {
  if (value === '/') return '/';
  const segments = value.replace(/^\/+|\/+$/g, '').split('/');
  if (!segments.length || segments.some(segment => !/^[A-Za-z0-9._-]+$/.test(segment)
    || segment === '.' || segment === '..')) {
    throw new Error('VITE_BASE_PATH must be / or a repository path such as /repository-name/');
  }
  return `/${segments.join('/')}/`;
}
