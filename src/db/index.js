import Dexie from 'dexie';

export const db = new Dexie('ResumeBuilderDB');

db.version(1).stores({
  resumes: 'id, update_time',
  jobs: 'id, create_time, is_delete',
  tasks: 'id, job_id, status, create_time',
  prompt_templates: 'id, name'
});
