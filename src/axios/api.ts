import { api } from './fetch';

export function getJobList() {
  return api.get('/jobs');
}

export function addJob(data) {
  return api.post('/job', JSON.stringify(data));
}

export function updateJob(data) {
  return api.put('/job/' + data.id, JSON.stringify(data));
}

export function purgeJob(id) {
  return api.delete('/job/' + id);
}
