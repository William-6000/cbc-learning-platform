const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export async function api(path, options = {}) {
  const token = localStorage.getItem('cbc_token');
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
  if (!response.ok) throw new Error((await response.json()).message || 'Request failed');
  return response.json();
}
