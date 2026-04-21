import type { AuthResponse, DailyReport, InvestmentLog, MoodLog, OverviewResponse, UserProfile } from '../types';
import { clearToken, getToken } from './auth';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT';
  data?: Record<string, unknown>;
}

function request<T>({ url, method = 'GET', data }: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${baseUrl}${url}`,
      method,
      data,
      header: getToken()
        ? {
            Authorization: `Bearer ${getToken()}`
          }
        : {},
      success: (response) => {
        if (response.statusCode === 401) {
          clearToken();
          uni.reLaunch({ url: '/pages/login/index' });
          reject(new Error('Unauthorized'));
          return;
        }
        resolve(response.data as T);
      },
      fail: reject
    });
  });
}

export const api = {
  register(data: { email: string; password: string; name?: string }) {
    return request<AuthResponse>({ url: '/auth/register', method: 'POST', data });
  },
  login(data: { email: string; password: string }) {
    return request<AuthResponse>({ url: '/auth/login', method: 'POST', data });
  },
  getOverview(date: string) {
    return request<OverviewResponse>({ url: `/overview?date=${date}` });
  },
  getProfile() {
    return request<UserProfile>({ url: '/profile' });
  },
  saveProfile(data: Partial<UserProfile>) {
    return request<UserProfile>({ url: '/profile', method: 'PUT', data });
  },
  saveMood(data: Omit<MoodLog, 'id'>) {
    return request<MoodLog>({ url: '/moods', method: 'POST', data });
  },
  getMoods(date?: string) {
    return request<MoodLog[]>({ url: date ? `/moods?date=${date}` : '/moods' });
  },
  saveInvestment(data: Omit<InvestmentLog, 'id'>) {
    return request<InvestmentLog>({ url: '/investments', method: 'POST', data });
  },
  getInvestments(date?: string) {
    return request<InvestmentLog[]>({ url: date ? `/investments?date=${date}` : '/investments' });
  },
  generateDailyReport(date: string) {
    return request<DailyReport>({ url: '/reports/daily', method: 'POST', data: { date } });
  },
  getDailyReport(date: string) {
    return request<DailyReport>({ url: `/reports/${date}` });
  }
};
