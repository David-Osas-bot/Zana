// Dev server on :3000 talks to the API on :3001, everything else is same-origin.
export function apiBaseUrl() {
  return window.location.port === '3000' ? 'http://localhost:3001' : '';
}
