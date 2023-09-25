import { api } from './fetch';

export function getJobList() {
  return api.get('/jobs');
}

export function addJob(data) {
  return api.post('/job', JSON.stringify(data));
}

export function updateJob(id, data) {
  return api.put('/job/' + id, JSON.stringify(data));
}

export function purgeJob(id) {
  return api.delete('/job/' + id);
}

export function addTasks(data) {
  return api.post('/tasks', JSON.stringify(data));
}

export function checkTasksResult(data) {
  return api.post('/tasks/results', JSON.stringify(data));
}
