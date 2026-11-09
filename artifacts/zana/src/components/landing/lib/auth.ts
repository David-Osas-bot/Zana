export type SessionUser = { id: string; name: string; email: string };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(path, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${res.status})`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

export async function fetchSession(): Promise<SessionUser | null> {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
}

export function signUp(name: string, email: string, password: string) {
    return request<SessionUser>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}

export function signIn(email: string, password: string) {
    return request<SessionUser>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function signOutRequest() {
    return request<void>('/api/auth/logout', { method: 'POST' });
}