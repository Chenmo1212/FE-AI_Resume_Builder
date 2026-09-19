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
  return api.post('/tasks/results', JSON.stringify(data), { silent: true });
}

export function addTask(data) {
  return api.post('/task', JSON.stringify(data));
}

export function updateTask(id, data) {
  return api.put('/task/' + id, JSON.stringify(data));
}

export function cancelTask(id) {
  return api.post(`/task/${id}/cancel`);
}

export function addTasks(data) {
  return api.post('/tasks/run', JSON.stringify(data));
}

export function getPromptTemplates() {
  return api.get('/prompt-templates');
}

export function checkHealth() {
  return api.get('/health', { silent: true });
}

export function updatePromptTemplate(id, messages) {
  return api.put('/prompt-templates/' + id, JSON.stringify({ messages }));
}

