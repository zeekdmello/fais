let csrfToken;
export async function api(path, options = {}) {
  const method = options.method || 'GET';
  if (method !== 'GET' && !csrfToken) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/csrf`, {
      credentials: 'include',
    });
    csrfToken = (await response.json()).csrfToken;
  }
  const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(method !== 'GET' ? { 'X-CSRF-Token': csrfToken } : {}),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The server is unavailable. Try again.');
  }
  if (!response.ok) {
    const error = new Error(data.error || 'Could not save. Try again.');
    error.status = response.status;
    throw error;
  }
  if (data.csrfToken) csrfToken = data.csrfToken;
  if (path === '/auth/logout') csrfToken = undefined;
  if (data.warning) window.dispatchEvent(new CustomEvent('fais-warning', { detail: data.warning }));
  return data;
}
export const localDate = (zone = 'Asia/Kolkata', value = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
export const shiftDate = (date, days) => {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
export const displayDate = (date, options = { month: 'long', day: 'numeric' }) =>
  new Date(date + 'T12:00:00').toLocaleDateString('en-US', options);
