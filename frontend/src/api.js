export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

export async function authFetch(path, options = {}) {
    const token = localStorage.getItem('token');
    const headers = options.headers ? { ...options.headers } : {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';

    return fetch(`${API_BASE}${path}`, { ...options, headers });
}