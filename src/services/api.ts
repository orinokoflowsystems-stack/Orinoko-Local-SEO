import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL,
  headers: {
    apikey: import.meta.env.VITE_SUPABASE_KEY,
    'Content-Type': 'application/json',
  },
});
