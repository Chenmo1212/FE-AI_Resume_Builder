export const DEFAULT_PROMPT_TEMPLATES = [
  {
    id: 'experience_highlighter',
    name: 'experience_highlighter',
    description: 'Highlight and tailor work experience bullets for the target job.',
    version: 1,
    messages: [
      { role: 'system', content: 'You are an expert resume writer. Rewrite the experience section to highlight achievements relevant to the job description.' },
      { role: 'human', content: 'Job description:\n{job_description}\n\nExperience:\n{experience}' },
    ],
  },
  {
    id: 'skills_matcher',
    name: 'skills_matcher',
    description: 'Match and prioritize skills to the job requirements.',
    version: 1,
    messages: [
      { role: 'system', content: 'You are a technical recruiter. Extract and rank the most relevant skills for the given job description.' },
      { role: 'human', content: 'Job description:\n{job_description}\n\nCandidate skills:\n{skills}' },
    ],
  },
  {
    id: 'summary_writer',
    name: 'summary_writer',
    description: 'Write a compelling professional summary targeted at the role.',
    version: 1,
    messages: [
      { role: 'system', content: 'You are an expert resume writer. Write a concise 3-4 sentence professional summary tailored to the target job.' },
      { role: 'human', content: 'Job description:\n{job_description}\n\nResume:\n{resume}' },
    ],
  },
];
