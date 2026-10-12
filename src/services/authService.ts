import type { AuthResponse, Customer } from '@/types/api';
import { http } from './http';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
}

export async function getMe(): Promise<Customer> {
  const { data } = await http.get<Customer>('/auth/me');
  return data;
}
