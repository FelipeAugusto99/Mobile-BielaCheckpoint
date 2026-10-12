const rawUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.mockmerce.com.br/v1';

export const env = {
  apiUrl: rawUrl.replace(/\/+$/, ''),
  apiKey: process.env.EXPO_PUBLIC_API_KEY ?? '',
  studentRm: process.env.EXPO_PUBLIC_STUDENT_RM ?? '',
};
