import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://www.chenmo1212.cn/api/resume/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 60 * 1000,
});

// Set interceptor
// api.interceptors.response.use(
//   (response) => {
//     console.log('Interceptor: Request successful', response)
//     return response
//   }, (error) => {
//     console.log('Interceptor: An error occurred', error.response)
//     return Promise.reject(error)
//   }
// )
