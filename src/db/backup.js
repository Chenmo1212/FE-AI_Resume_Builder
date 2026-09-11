import { db } from './index';

/**
 * Export all IndexedDB tables as a single JSON snapshot.
 * @returns {Promise<string>} JSON string of all data.
 */
export async function exportAllData() {
  const [resumes, jobs, tasks, prompt_templates] = await Promise.all([
    db.resumes.toArray(),
    db.jobs.toArray(),
    db.tasks.toArray(),
    db.prompt_templates.toArray(),
  ]);
  const snapshot = {
    version: 1,
    exported_at: new Date().toISOString(),
    resumes,
    jobs,
    tasks,
    prompt_templates,
  };
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Import a JSON snapshot, replacing all IndexedDB data.
 * Validates required top-level keys before writing.
 * @param {string|object} json - raw JSON string or parsed object
 */
export async function importAllData(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  const required = ['resumes', 'jobs', 'tasks', 'prompt_templates'];
  for (const key of required) {
    if (!Array.isArray(data[key])) {
      throw new Error(`Invalid backup: missing or invalid "${key}" array`);
    }
  }
  await db.transaction('rw', [db.resumes, db.jobs, db.tasks, db.prompt_templates], async () => {
    await db.resumes.clear();
    await db.jobs.clear();
    await db.tasks.clear();
    await db.prompt_templates.clear();
    if (data.resumes.length) await db.resumes.bulkPut(data.resumes);
    if (data.jobs.length) await db.jobs.bulkPut(data.jobs);
    if (data.tasks.length) await db.tasks.bulkPut(data.tasks);
    if (data.prompt_templates.length) await db.prompt_templates.bulkPut(data.prompt_templates);
  });
}
