import api from './request';
import type { TokenResponse, User } from './types';

export function login(username: string, password: string): Promise<TokenResponse> {
  return api.post('/v1/auth/login', { username, password });
}

export function getMe(): Promise<User> {
  return api.get('/v1/auth/me');
}
