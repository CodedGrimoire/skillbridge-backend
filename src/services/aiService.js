const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Generates short recommendations leveraging Groq LLM. Replace prompt/parameters as needed.
const generateRecommendations = async ({ userSkills, roleSkills, gapSummary }) => {
  if (!process.env.GROQ_API_KEY) {
    return { note: 'GROQ_API_KEY missing; returning placeholder recommendations.' };
  }

  const prompt = `You are a career coach. Role requires: ${JSON.stringify(roleSkills)}. User has: ${JSON.stringify(userSkills)}. Gaps: ${JSON.stringify(gapSummary.missing)}. Suggest concise learning steps.`;

  try {
    const response = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: 'Provide succinct, actionable recommendations.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 256,
    });

    const content = response.choices?.[0]?.message?.content || 'No response';
    return { summary: content };
  } catch (err) {
    console.error('Groq API error', err.message);
    return { error: 'AI service unavailable right now' };
  }
};

module.exports = { generateRecommendations };
