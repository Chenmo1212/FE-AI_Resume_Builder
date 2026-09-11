export const DEFAULT_PROMPT_TEMPLATES = [
  {
    id: 'section_highlighter',
    name: 'section_highlighter',
    description: 'Identify relevant portions from the master resume that match the job posting and rephrase them into highlights.',
    version: 1,
    messages: [
      {
        role: 'system',
        content: 'You are an expert technical writer. Your goal is to strictly follow all the provided <Steps> and meet all the given <Criteria>.',
      },
      {
        role: 'human',
        content: '<Job Posting>\nThe ideal candidate is able to perform the following duties:{duties}\n\nThe ideal candidate has the following qualifications:{qualifications}\n\nThe ideal candidate has the following skills:{technical_skills}\n{non_technical_skills}',
      },
      {
        role: 'human',
        content: '<Master Resume>{section}',
      },
      {
        role: 'human',
        content: '<Instruction> Identify the relevant portions from the <Master Resume> that match the <Job Posting>, and rephrase these relevant portions into highlights',
      },
      {
        role: 'human',
        content: '<Criteria> \n- Based on <Master Resume> to extract 3 - 4 highlights.\n- Each highlight must be based on what is mentioned in the <Master Resume>.\n- In each highlight, include how that experience in the <Master Resume> demonstrates an ability to perform duties mentioned in the <Job Posting>.\n- In each highlight, try to include action verbs, give tangible and concrete examples, and include success metrics when available.\n- Each highlight must exceed 50 words, and include 2 - 3 sentence.\n- Make sure add more hard number in each highlight.\n- Must avoid the overuse of specific action verbs.\n- Grammar, spellings, and sentence structure must be correct.',
      },
      {
        role: 'human',
        content: '<Steps>\n- Create a <Plan> for following the <Instruction> while meeting all the <Criteria>.\n- What <Additional Steps> are needed to follow the <Plan>?\n- Follow all steps one by one and show your <Work>.\n- Verify that highlights are reflective of the <Master Resume> and not the <Job Posting>. Update if necessary.\n- Verify that all <Criteria> are met, and update if necessary.\n- Provide the answer to the <Instruction> with prefix <Final Answer>.',
      },
      {
        role: 'human',
        content: 'Output your final answer as JSON only, following this schema:\n{format_instructions}',
      },
    ],
  },
  {
    id: 'skills_matcher',
    name: 'skills_matcher',
    description: 'Extract technical and non-technical skills from the resume that match the skills required in the job posting.',
    version: 1,
    messages: [
      {
        role: 'system',
        content: 'You are an expert technical writer. Your goal is to strictly follow all the provided <Steps> and meet all the given <Criteria>.',
      },
      {
        role: 'human',
        content: '<Job Posting>\nThe ideal candidate has the following skills:{technical_skills}\n{non_technical_skills}',
      },
      {
        role: 'human',
        content: '<Resume>\nExperience:{projects}\n{experiences}',
      },
      {
        role: 'human',
        content: '<Instruction> Extract technical and non-technical skills from the <Resume> that match the skills required in the <Job Posting>.',
      },
      {
        role: 'human',
        content: '<Criteria> \n- Each skill must be based on what is mentioned in the <Resume>.\n- Technical skills are programming languages, technologies, and tools. Examples: Python, MS Office, Machine learning, Marketing, Optimization, GPT\n- Non-technical skills are soft skills. Communication, Leadership, Adaptability, Teamwork, Problem solving, Critical thinking, Time management\n- Review and identify skills that have similar or equivalent meanings, such as \'React.js,\' \'React,\' and \'ReactJS.\'\n- Merge equivalent skills into a single representation to avoid redundancy and make the skills list more concise.\n- Ensure that the merged representation is comprehensive and commonly recognized within the respective category.\n- Update the skills list by replacing the redundant skills with their merged counterparts.\n- Each skill must be written in sentence case and remove duplicate skills.',
      },
      {
        role: 'human',
        content: '<Steps>\n- Create a <Plan> for following the <Instruction> while meeting all the <Criteria>.\n- What <Additional Steps> are needed to follow the <Plan>?\n- Follow all steps one by one and show your <Work>.\n- Verify that skills are reflective of the <Resume> and not the <Job Posting>. Update if necessary.\n- Verify that all <Criteria> are met, and update if necessary.\n- Provide the answer to the <Instruction> with prefix <Final Answer>.',
      },
      {
        role: 'human',
        content: 'Output your final answer as JSON only, following this schema:\n{format_instructions}',
      },
    ],
  },
  {
    id: 'summary_writer',
    name: 'summary_writer',
    description: 'Create a professional summary from the resume tailored to the target job posting.',
    version: 1,
    messages: [
      {
        role: 'system',
        content: 'You are an expert technical writer. Your goal is to strictly follow all the provided <Steps> and meet all the given <Criteria>.',
      },
      {
        role: 'human',
        content: '<Job Posting>\n{company}\n{job_summary}',
      },
      {
        role: 'human',
        content: '<Resume>\nEducation:{degrees}\n\nExperience:{projects}\n{experiences}\n\nSkills:{skills}',
      },
      {
        role: 'human',
        content: '<Instruction> Create a Professional Summary from my <Resume>.',
      },
      {
        role: 'human',
        content: '<Criteria>\n- The summary must reflect my strong work ethic, highlighting key adjectives\n- Specify the field in which I have expertise and mention the duration of my experience.\n- The summary must feature my most impressive and relevant on-the-job achievement.\n- Clearly articulate what I aim to achieve in this role, emphasizing how I will contribute to the company.\n- The summary should be concise, comprising 3–4 sentences totaling 100–200 words.\n- It should incorporate relevant keywords from the job posting that align with my resume.\n- Mention the company\'s name and the specific job title in the summary to demonstrate customization.\n- Ensure correct grammar, spelling, and sentence structure for a polished presentation.',
      },
      {
        role: 'human',
        content: '<Steps>\n- Create a <Plan> for following the <Instruction> while meeting all the <Criteria>.\n- What <Additional Steps> are needed to follow the <Plan>?\n- Follow all steps one by one and show your <Work>.\n- Verify that summary is reflective of my <Resume> and not the <Job Posting>. Update if necessary.\n- Verify that all <Criteria> are met, and update if necessary.\n- Provide the answer to the <Instruction> with prefix <Final Answer>.',
      },
      {
        role: 'human',
        content: 'Output your final answer as JSON only, following this schema:\n{format_instructions}',
      },
    ],
  },
  {
    id: 'improver',
    name: 'improver',
    description: 'Critique the resume and suggest improvements to better match the job posting requirements.',
    version: 1,
    messages: [
      {
        role: 'system',
        content: 'You are an expert critic. Your goal is to strictly follow all the provided <Steps> and meet all the given <Criteria>.',
      },
      {
        role: 'human',
        content: '<Job Posting>\nThe ideal candidate is able to perform the following duties:{duties}\n\nThe ideal candidate has the following qualifications:{qualifications}\n\nThe ideal candidate has the following skills:{technical_skills}\n{non_technical_skills}',
      },
      {
        role: 'human',
        content: '<Resume>\nSummary:{summary}\n\n{experiences}\n{projects}\n{education}\n{skills}',
      },
      {
        role: 'human',
        content: '<Instruction> Critique my <Resume>, and suggest how I can improve it so it showcases that I am the ideal candidate who meets all the requirements of the <Job Posting>.',
      },
      {
        role: 'human',
        content: '<Criteria>\n- Find any spelling or grammar errors in my <Resume>, and include suggestions to fix them.\n- Compile all your suggestions from <Work> into the <Final Answer>.\n- For each suggestion in the <Final Answer>, include the respective <Resume> section, what needs to be improved, and how to improve it.\n- In the <Final Answer>, include a section for Spelling and Grammar, including any suggestions for improvements.',
      },
      {
        role: 'human',
        content: '<Steps>\n- Create a <Plan> for following the <Instruction> while meeting all the <Criteria>.\n- What <Additional Steps> are needed to follow the <Plan>?\n- Follow all steps one by one and show your <Work>.\n- Verify that all <Criteria> are met, and update if necessary.\n- Provide the answer to the <Instruction> with prefix <Final Answer>.',
      },
    ],
  },
];
