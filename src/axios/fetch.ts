import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://16.170.240.190:5001',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  },
  timeout: 10 * 1000,
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
