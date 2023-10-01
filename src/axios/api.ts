import { api } from './fetch';

export function updateResume(id, data) {
  return api.put('/resume/' + id, JSON.stringify(data));
}

export function getJobs() {
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

export function getTasks(data) {
  return api.post('/tasks', JSON.stringify(data));
}

export function checkTasksStatus(data) {
  return api.post('/tasks/results', JSON.stringify(data));
}

export function addTask(data) {
  return api.post('/task', JSON.stringify(data));
}

export function updateTask(id, data) {
  return api.put('/task/' + id, JSON.stringify(data));
}

export function addTasks(data) {
  return api.post('/tasks', JSON.stringify(data));
}
