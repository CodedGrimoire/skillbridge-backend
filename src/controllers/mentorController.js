const { prisma } = require('../config/db');

const listMentors = async (_req, res, next) => {
  try {
    const mentors = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        mentorProfile: { select: { title: true, rating: true, reviewsCount: true, bio: true } },
      },
    });
    res.json(mentors);
  } catch (err) {
    next(err);
  }
};

const createRequest = async (req, res, next) => {
  try {
    const { mentorId, message } = req.body || {};
    if (!mentorId) return res.status(400).json({ message: 'mentorId is required' });
    const reqRec = await prisma.mentorRequest.create({
      data: { userId: req.user.id, mentorId, message },
    });
    res.status(201).json(reqRec);
  } catch (err) {
    next(err);
  }
};

const listRequestsForMentor = async (req, res, next) => {
  try {
    const data = await prisma.mentorRequest.findMany({
      where: { mentorId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// List accepted mentees for the authenticated mentor
const listMentees = async (req, res, next) => {
  try {
    const data = await prisma.mentorRequest.findMany({
      where: { mentorId: req.user.id, status: 'accepted' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(data.map((m) => m.user));
  } catch (err) {
    next(err);
  }
};

const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['pending', 'accepted', 'denied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const updated = await prisma.mentorRequest.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

const getUserSkillProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        resumeUrl: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
      },
    });
    const skills = await prisma.userSkill.findMany({
      where: { userId: id },
      include: { skill: true },
    });
    const missing = await prisma.missingSkill.findMany({ where: { userId: id } });
    res.json({
      user,
      skills: skills.map((s) => s.skill.name),
      missingSkills: missing,
    });
  } catch (err) {
    next(err);
  }
};

const addMissingSkill = async (req, res, next) => {
  try {
    const { id } = req.params; // userId
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: 'name required' });
    const created = await prisma.missingSkill.create({
      data: { userId: id, name, status: 'pending' },
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

const addResumeComment = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const { comment } = req.body || {};
    if (!comment) return res.status(400).json({ message: 'comment required' });
    const created = await prisma.resumeComment.create({
      data: { resumeId, mentorId: req.user.id, comment },
    });
    res.status(201).json(created);
  } catch (err) {
  next(err);
 }
};

const listResumeComments = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const comments = await prisma.resumeComment.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' },
      include: { mentor: { select: { id: true, name: true } } },
    });
    res.json(comments);
  } catch (err) {
  next(err);
 }
};

const upsertMentorProfile = async (req, res, next) => {
  try {
    const { title, bio, rating } = req.body || {};
    const data = {
      ...(title !== undefined ? { title } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(rating !== undefined ? { rating: Number(rating) } : {}),
    };
    const profile = await prisma.mentorProfile.upsert({
      where: { userId: req.user.id },
      update: data,
      create: { userId: req.user.id, ...data },
    });
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

const getMentorProfile = async (req, res, next) => {
  try {
    const profile = await prisma.mentorProfile.findUnique({ where: { userId: req.user.id } });
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

async function recomputeMentorRating(mentorId) {
  const agg = await prisma.mentorReview.aggregate({
    where: { mentorId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.mentorProfile.upsert({
    where: { userId: mentorId },
    update: {
      rating: agg._avg.rating || 0,
      reviewsCount: agg._count.rating || 0,
    },
    create: {
      userId: mentorId,
      rating: agg._avg.rating || 0,
      reviewsCount: agg._count.rating || 0,
    },
  });
}

const submitReview = async (req, res, next) => {
  try {
    const { mentorId, rating, comment } = req.body || {};
    if (!mentorId || rating === undefined) {
      return res.status(400).json({ message: 'mentorId and rating are required' });
    }
    const review = await prisma.mentorReview.upsert({
      where: { mentorId_userId: { mentorId, userId: req.user.id } },
      update: { rating: Number(rating), comment },
      create: { mentorId, userId: req.user.id, rating: Number(rating), comment },
    });
    await recomputeMentorRating(mentorId);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

const listReviews = async (req, res, next) => {
  try {
    const { mentorId } = req.params;
    const reviews = await prisma.mentorReview.findMany({
      where: { mentorId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

const submitAssessment = async (req, res, next) => {
  try {
    const { userId, resumeRating, linkedinRating, githubRating, portfolioRating, comment } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const assessment = await prisma.mentorAssessment.upsert({
      where: { mentorId_userId: { mentorId: req.user.id, userId } },
      update: { resumeRating, linkedinRating, githubRating, portfolioRating, comment },
      create: { userId, mentorId: req.user.id, resumeRating, linkedinRating, githubRating, portfolioRating, comment },
    });
    res.status(201).json(assessment);
  } catch (err) {
    next(err);
  }
};

const listAssessmentsForUser = async (req, res, next) => {
  try {
    const { id } = req.params; // userId
    const assessments = await prisma.mentorAssessment.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      include: { mentor: { select: { id: true, name: true } } },
    });
    res.json(assessments);
  } catch (err) {
    next(err);
  }
};

const createMeeting = async (req, res, next) => {
  try {
    const { menteeId, scheduledAt, meetLink, note } = req.body || {};
    if (!menteeId || !scheduledAt || !meetLink) {
      return res.status(400).json({ message: 'menteeId, scheduledAt, meetLink required' });
    }
    const meeting = await prisma.mentorMeeting.create({
      data: {
        mentorId: req.user.id,
        menteeId,
        scheduledAt: new Date(scheduledAt),
        meetLink,
        note,
      },
    });
    res.status(201).json(meeting);
  } catch (err) {
    next(err);
  }
};

const listMeetings = async (req, res, next) => {
  try {
    const meetings = await prisma.mentorMeeting.findMany({
      where: {
        OR: [{ mentorId: req.user.id }, { menteeId: req.user.id }],
      },
      orderBy: { scheduledAt: 'desc' },
    });
    res.json(meetings);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listMentors,
  createRequest,
  listRequestsForMentor,
  listMentees,
  updateRequestStatus,
  deleteUser,
  getUserSkillProfile,
  addMissingSkill,
  addResumeComment,
  listResumeComments,
  upsertMentorProfile,
  getMentorProfile,
  submitReview,
  listReviews,
  submitAssessment,
  listAssessmentsForUser,
  createMeeting,
  listMeetings,
};
