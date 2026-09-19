import axios from 'axios';
import { message } from 'antd';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:5001',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 60 * 1000,
});

// Set global response interceptor for consistent error notifications
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Allow background polling or silent requests to skip global error toast
    if (!error.config?.silent) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        (error.code === 'ECONNABORTED' ? 'Request timed out' : null) ||
        error.message ||
        'Network request failed';

      message.error(errorMsg);
    }

    return Promise.reject(error);
  }
);
