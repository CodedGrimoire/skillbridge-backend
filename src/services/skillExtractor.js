// Placeholder skill extractor. Replace with NLP/LLM powered extractor later.
const SKILL_KEYWORDS = ['javascript', 'node', 'express', 'python', 'sql', 'aws', 'react'];

const extractSkillsFromText = async (text) => {
  if (!text) return [];
  const lower = text.toLowerCase();
  return SKILL_KEYWORDS.filter((kw) => lower.includes(kw));
};

module.exports = { extractSkillsFromText };
