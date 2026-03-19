const Groq = require('groq-sdk');

// Use Groq (compatible OpenAI-style) when API key present; otherwise fall back.
const groq =
  process.env.GROQ_API_KEY &&
  new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

const fallbackRoadmap = (role) => ({
  role,
  stages: [
    { level: 'Beginner', skills: ['Internet basics', 'Git fundamentals', 'HTML', 'CSS', 'JS basics'] },
    { level: 'Junior', skills: ['React', 'Node.js', 'REST APIs', 'SQL', 'Testing basics'] },
    { level: 'Senior', skills: ['System design', 'Scalability', 'CI/CD', 'Cloud (AWS/GCP)', 'Security basics'] },
  ],
});

const promptForRole = (role) => `Generate a structured career roadmap for the role: ${role}.
Divide into 3 stages: Beginner, Junior, Senior.

Return ONLY JSON in this format:
{
  "role": "...",
  "stages": [
    { "level": "Beginner", "skills": ["..."] },
    { "level": "Junior", "skills": ["..."] },
    { "level": "Senior", "skills": ["..."] }
  ]
}`;

async function generateRoleRoadmap(role) {
  if (!role) throw new Error('Role is required');

  // No key: immediately use fallback
  if (!groq) {
    return fallbackRoadmap(role);
  }

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a concise career roadmap generator. Always return strict JSON only.' },
        { role: 'user', content: promptForRole(role) },
      ],
      temperature: 0.2,
      max_tokens: 300,
    });

    const content = response?.choices?.[0]?.message?.content || '';
    const cleaned = content.trim().replace(/^```(json)?/i, '').replace(/```$/, '');
    const parsed = JSON.parse(cleaned);
    if (!parsed?.stages?.length) throw new Error('Missing stages');
    return parsed;
  } catch (err) {
    console.error('Roadmap LLM failed, using fallback:', err.message);
    return fallbackRoadmap(role);
  }
}

module.exports = { generateRoleRoadmap };
