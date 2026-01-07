import { decodeJwt } from 'jose';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Configuration
const KEYCLOAK_URL = '/keycloak';
const REALM = 'connected-lock';
const CLIENT_ID = 'vue-app';

interface TokenResponse {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    not_before_policy: number;
    session_state: string;
    scope: string;
}

export async function login(username: string, password: string): Promise<boolean> {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', CLIENT_ID);
    params.append('username', username);
    params.append('password', password);

    try {
        const response = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (response.ok) {
            const data: TokenResponse = await response.json();
            localStorage.setItem(TOKEN_KEY, data.access_token);
            localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
            return true;
        } else {
            console.error('Login failed', await response.text());
            return false;
        }
    } catch (error) {
        console.error('Login error', error);
        return false;
    }
}

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.location.href = '/login';
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export async function initKeycloak(): Promise<boolean> {
    const token = getToken();
    if (!token) return false;
    try {
        const payload = decodeJwt(token);
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return await refreshToken();
        }
        return true;
    } catch (e) {
        return false;
    }
}

async function refreshToken(): Promise<boolean> {
    const refreshTokenSrc = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshTokenSrc) return false;

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', CLIENT_ID);
    params.append('refresh_token', refreshTokenSrc);

    try {
        const response = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (response.ok) {
            const data: TokenResponse = await response.json();
            localStorage.setItem(TOKEN_KEY, data.access_token);
            localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
            return true;
        } else {
            logout(); // Refresh failed
            return false;
        }
    } catch {
        return false;
    }
}

export async function updateToken(minValidity: number = 30) {
    const token = getToken();
    if (!token) return Promise.reject();

    const payload = decodeJwt(token);
    if (!payload.exp) return Promise.resolve();

    if ((payload.exp * 1000) - Date.now() < (minValidity * 1000)) {
         if (await refreshToken()) {
             return Promise.resolve();
         } else {
             return Promise.reject();
         }
    }
    return Promise.resolve();
}


export function hasRole(role: string): boolean {
    const token = getToken();
    if (!token) return false;
    try {
        const payload = decodeJwt(token) as any;
        const roles = payload.realm_access?.roles || [];
        return roles.includes(role);
    } catch {
        return false;
    }
}
