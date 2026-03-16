const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate AI-powered recommendations for the user's skill gaps.
 */
const generateRecommendations = async ({ matchedSkills, missingSkills, roleTitle }) => {
  if (!process.env.GROQ_API_KEY) {
    return 'AI recommendations unavailable (GROQ_API_KEY missing).';
  }

  const prompt = `User currently has these skills:
${matchedSkills.length ? matchedSkills.join(', ') : 'None'}

Missing skills for role:
${missingSkills.length ? missingSkills.join(', ') : 'None'}

Target Role:
${roleTitle}

Generate:
1. Skill gap explanation
2. Learning roadmap
3. Suggested beginner projects
Keep it concise and actionable.`;

  try {
    const response = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: 'You are a concise, practical career coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 256,
    });

    return response.choices?.[0]?.message?.content || 'No AI response generated.';
  } catch (err) {
    console.error('Groq API error:', err.message);
    return null;
  }
};

module.exports = { generateRecommendations };
