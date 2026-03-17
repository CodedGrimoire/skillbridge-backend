const { prisma } = require('../config/db');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function fetchUserSkills(userId) {
  const skills = await prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true },
  });
  return skills.map((s) => s.skill.name);
}

async function fetchLatestResume(userId) {
  return prisma.resume.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

async function runCapabilityLLM({ resumeText, userSkills }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY missing');
  }

  const prompt = `You are an expert career assessor. Given the resume text and extracted skills, respond in JSON only with:
{
 "primaryRole": "<single best-fit role title>",
 "score": <0-10 number>,
 "suggestedRoles": ["role1","role2","role3"],
 "missingHardSkills": ["skill"],
 "missingSoftSkills": ["skill"]
}
Use scale 0-10 (10 = perfect fit). Missing skills should be realistic for the suggested roles. Keep lists concise (max 6 each).

Resume skills: ${userSkills.join(', ') || 'none'}
Resume text:
${resumeText?.slice(0, 4000) || 'No text provided'}
`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'Respond with strict JSON only, no prose.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 512,
  });

  const raw = response.choices?.[0]?.message?.content || '{}';
  const cleaned = cleanJsonBlock(raw);
  return JSON.parse(cleaned);
}

function cleanJsonBlock(text) {
  let t = text.trim();
  if (t.startsWith('```')) {
    // remove ```json ... ``` fences
    t = t.replace(/```json/i, '').replace(/```/g, '').trim();
  }
  // If still extra text, attempt to extract first JSON object substring
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    t = t.slice(first, last + 1);
  }
  return t;
}

async function createCapabilityAnalysis(userId) {
  const userSkills = await fetchUserSkills(userId);
  if (!userSkills.length) throw new Error('No user skills found. Upload a resume first.');

  const resume = await fetchLatestResume(userId);
  const llmResult = await runCapabilityLLM({
    resumeText: resume?.extractedText || '',
    userSkills,
  });

  const analysis = await prisma.capabilityAnalysis.create({
    data: {
      userId,
      resumeId: resume?.id || null,
      primaryRole: llmResult.primaryRole || 'Unspecified',
      score: llmResult.score || 0,
      suggestedRoles: llmResult.suggestedRoles || [],
      userSkills,
      missingSkills: llmResult.missingHardSkills || [],
      missingSoftSkills: llmResult.missingSoftSkills || [],
    },
  });

  // seed missing skill todos
  const todoData = (llmResult.missingHardSkills || []).map((name) => ({
    userId,
    name,
    status: 'pending',
    analysisId: analysis.id,
  }));
  if (todoData.length) {
    await prisma.missingSkill.createMany({ data: todoData, skipDuplicates: true });
  }

  return analysis;
}

async function listMissingSkills(userId) {
  return prisma.missingSkill.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { createCapabilityAnalysis, listMissingSkills };
