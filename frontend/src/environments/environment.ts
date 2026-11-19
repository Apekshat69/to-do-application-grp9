const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '');

export const environment = {
  production: !isLocalhost,
  apiUrl: isLocalhost ? 'http://localhost:5000/api' : '/api',
};
