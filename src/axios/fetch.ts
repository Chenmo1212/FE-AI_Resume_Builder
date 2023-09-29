import axios from 'axios';

export const api = axios.create({
  // baseURL: 'http://16.170.240.190:5002',
  baseURL: 'https://api.chenmo1212.cn/cv/',
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
