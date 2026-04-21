const tokenKey = 'daily-horoscope-token';

export function getToken(): string {
  return uni.getStorageSync(tokenKey) || '';
}

export function setToken(token: string): void {
  uni.setStorageSync(tokenKey, token);
}

export function clearToken(): void {
  uni.removeStorageSync(tokenKey);
}

export function isLoggedIn(): boolean {
  return Boolean(getToken());
}
